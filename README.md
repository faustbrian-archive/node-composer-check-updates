**You can help the author become a full-time open-source maintainer by [sponsoring him on GitHub](https://github.com/sponsors/faustbrian).**

---

# @faustbrian/node-composer-check-updates

[![npm version](https://badgen.net/npm/v/@faustbrian/node-composer-check-updates)](https://npm.im/@faustbrian/node-composer-check-updates)

## Installation

```
npm install -g @faustbrian/node-composer-check-updates
```

## Usage

`ccu {--prod} {--dev} {--pin} {--tilde} {--tilde-minor} {--caret} {--caret-minor}`

### `--prod`

Only update `require` dependencies, also known as production dependencies.

### `--dev`

Only update `require-dev` dependencies, also known as development dependencies.

### `--pin`

Pin dependencies to their latest version.

### `--tilde`

Pin dependencies to their latest `~MAJOR.MINOR.PATCH` version.

### `--tilde-minor`

Pin dependencies to their latest `~MAJOR.MINOR` version.

### `--caret`

Pin dependencies to their latest `^MAJOR.MINOR.PATCH` version.

### `--caret-minor`

Pin dependencies to their latest `^MAJOR.MINOR` version.

## License

This is an open-sourced software licensed under the [AGPL-3.0-or-later](LICENSE).
