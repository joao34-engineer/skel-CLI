skel-cli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/skel-cli.svg)](https://npmjs.org/package/skel-cli)
[![Downloads/week](https://img.shields.io/npm/dw/skel-cli.svg)](https://npmjs.org/package/skel-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g skel-cli
$ skel-cli COMMAND
running command...
$ skel-cli (--version)
skel-cli/0.0.0 linux-x64 node-v24.8.0
$ skel-cli --help [COMMAND]
USAGE
  $ skel-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`skel-cli hello PERSON`](#skel-cli-hello-person)
* [`skel-cli hello world`](#skel-cli-hello-world)
* [`skel-cli help [COMMAND]`](#skel-cli-help-command)
* [`skel-cli plugins`](#skel-cli-plugins)
* [`skel-cli plugins add PLUGIN`](#skel-cli-plugins-add-plugin)
* [`skel-cli plugins:inspect PLUGIN...`](#skel-cli-pluginsinspect-plugin)
* [`skel-cli plugins install PLUGIN`](#skel-cli-plugins-install-plugin)
* [`skel-cli plugins link PATH`](#skel-cli-plugins-link-path)
* [`skel-cli plugins remove [PLUGIN]`](#skel-cli-plugins-remove-plugin)
* [`skel-cli plugins reset`](#skel-cli-plugins-reset)
* [`skel-cli plugins uninstall [PLUGIN]`](#skel-cli-plugins-uninstall-plugin)
* [`skel-cli plugins unlink [PLUGIN]`](#skel-cli-plugins-unlink-plugin)
* [`skel-cli plugins update`](#skel-cli-plugins-update)

## `skel-cli hello PERSON`

Say hello

```
USAGE
  $ skel-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ skel-cli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/software-skeleton-CLI/skel-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `skel-cli hello world`

Say hello world

```
USAGE
  $ skel-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ skel-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/software-skeleton-CLI/skel-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `skel-cli help [COMMAND]`

Display help for skel-cli.

```
USAGE
  $ skel-cli help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for skel-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/commands/help.ts)_

## `skel-cli plugins`

List installed plugins.

```
USAGE
  $ skel-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ skel-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/index.ts)_

## `skel-cli plugins add PLUGIN`

Installs a plugin into skel-cli.

```
USAGE
  $ skel-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into skel-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SKEL_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SKEL_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ skel-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ skel-cli plugins add myplugin

  Install a plugin from a github url.

    $ skel-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ skel-cli plugins add someuser/someplugin
```

## `skel-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ skel-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ skel-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/inspect.ts)_

## `skel-cli plugins install PLUGIN`

Installs a plugin into skel-cli.

```
USAGE
  $ skel-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into skel-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SKEL_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SKEL_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ skel-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ skel-cli plugins install myplugin

  Install a plugin from a github url.

    $ skel-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ skel-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/install.ts)_

## `skel-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ skel-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ skel-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/link.ts)_

## `skel-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ skel-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ skel-cli plugins unlink
  $ skel-cli plugins remove

EXAMPLES
  $ skel-cli plugins remove myplugin
```

## `skel-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ skel-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/reset.ts)_

## `skel-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ skel-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ skel-cli plugins unlink
  $ skel-cli plugins remove

EXAMPLES
  $ skel-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/uninstall.ts)_

## `skel-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ skel-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ skel-cli plugins unlink
  $ skel-cli plugins remove

EXAMPLES
  $ skel-cli plugins unlink myplugin
```

## `skel-cli plugins update`

Update installed plugins.

```
USAGE
  $ skel-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/update.ts)_
<!-- commandsstop -->
