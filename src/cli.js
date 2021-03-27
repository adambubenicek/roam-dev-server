#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const defaults = require('./defaults')
const Server = require('./server')

yargs(hideBin(process.argv))
    .option('c', {
        alias: 'config',
        config: true,
        description: "Configuration file",
        configParser: (path) => {
            return require(path)
        },
    })
    .option('h', {
        alias: 'host',
        default: defaults.host,
        description: "Server host",
        string: true,
    })
    .option('p', {
        alias: 'port',
        default: defaults.port,
        description: "Server port",
        number: true,
    })
    .option('t', {
        alias: 'page-title',
        default: defaults.pageTitle,
        description: "Default Roam page title",
        string: true,
    })
    .option('w', {
        alias: 'page-only',
        default: defaults.pageOnly,
        description: "Update only blocks on the default Roam page",
        boolean: true,
    })
    .command('$0 [directory]', 'Starts a development server for Roam',
        (yargs) => {
            yargs.positional('d', {
                alias: 'directory',
                describe: 'directory',
                type: 'string',
                default: '.',
                normalize: true,
            })
        },
        (args) => {
            new Server(args)
        })
    .argv