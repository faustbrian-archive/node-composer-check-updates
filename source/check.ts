import chalk from "chalk";
import Table from "cli-table";
import { Command, Option } from "clipanion";
import fetch from "cross-fetch";
import execa from "execa";
import fs from "fs";
import path from "path";
import semver from "semver";

export class CheckCommand extends Command {
  prod = Option.Boolean("--prod");
  dev = Option.Boolean("--dev");
  pin = Option.Boolean("--pin");
  tilde = Option.Boolean("--tilde");
  tildeMinor = Option.Boolean("--tilde-minor");
  caret = Option.Boolean("--caret");
  caretMinor = Option.Boolean("--caret-minor");
  composer = Option.Boolean("--composer");
  composerIgnore = Option.Boolean("--composer-ignore");

  async execute() {
    const contents = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "composer.json")).toString(),
    );

    const table = new Table({
      head: [
        "Package",
        "Current Version",
        "Latest Version",
        "Major",
        "Minor",
        "Patch",
        "Date & Time",
      ],
    });

    const packageTypes: string[] = [];

    if (!this.prod && !this.dev) {
      packageTypes.push("require", "require-dev");
    } else {
      if (this.prod) {
        packageTypes.push("require");
      }

      if (this.dev) {
        packageTypes.push("require-dev");
      }
    }

    const requests: Promise<any>[] = [];
    for (const packageType of packageTypes) {
      const pkgs = { ...contents }[packageType];

      if (!pkgs) {
        console.log(`Skipping [${packageType}] because it is not defined`);

        continue;
      }

      for (const [package_, version] of Object.entries(pkgs)) {
        if (package_ === "php") {
          continue;
        }

        if (package_.startsWith("ext-")) {
          continue;
        }

        requests.push(
          (async () => {
            try {
              const response = await fetch(
                `https://repo.packagist.org/p2/${package_}.json`,
              );

              if (response.status >= 400) {
                throw new Error("Bad response from server");
              }

              const body = (await response.json()).packages[package_][0];

              const versionOld = semver.coerce(version);
              const versionNew = semver.coerce(body.version);

              const latestVersion =
                `${versionNew.major}.${versionNew.minor}.${versionNew.patch}`;

              const isMajor = versionNew.major > versionOld.major;
              const isMinor = versionNew.minor > versionOld.minor;
              const isPatch = versionNew.patch > versionOld.patch;

              if (this.pin) {
                contents[packageType][package_] = latestVersion;
              }

              if (this.tilde) {
                contents[packageType][package_] = `~${latestVersion}`;
              }

              if (this.tildeMinor) {
                contents[packageType][
                  package_
                ] = `~${versionNew.major}.${versionNew.minor}`;
              }

              if (this.caret) {
                contents[packageType][package_] = `^${latestVersion}`;
              }

              if (this.caretMinor) {
                contents[packageType][
                  package_
                ] = `^${versionNew.major}.${versionNew.minor}`;
              }

              table.push([
                package_,
                version,
                isMajor || isMinor || isPatch
                  ? chalk.green(latestVersion)
                  : chalk.blue(latestVersion),
                isMajor ? chalk.green("X") : chalk.red("X"),
                isMinor ? chalk.green("X") : chalk.red("X"),
                isPatch ? chalk.green("X") : chalk.red("X"),
                body.time,
              ]);
            } catch {
              console.log(
                `Skipped ${package_} because it encountered an error`,
              );
            }
          })(),
        );
      }
    }

    await Promise.all(requests);

    console.log(table.toString());

    fs.writeFileSync(
      path.resolve(process.cwd(), "composer.json"),
      JSON.stringify(contents, undefined, 4),
    );

    if (this.composer || this.composerIgnore) {
      const { stderr, stdout } = await execa("composer", [
        this.composerIgnore ? "--ignore-platform-reqs" : "",
      ]);

      if (stderr) {
        console.error(stderr);
      }

      if (stdout) {
        console.log(stdout);
      }
    }
  }
}
