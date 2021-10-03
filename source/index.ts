#!/usr/bin/env node

import { Cli } from "clipanion";

import { CheckCommand } from "./check";

const [node, app, ...arguments_] = process.argv;

const cli = new Cli({
  binaryLabel: `Composer Check Updates`,
  binaryName: `${node} ${app}`,
  binaryVersion: `1.0.0`,
});

cli.register(CheckCommand);
void cli.runExit(arguments_);
