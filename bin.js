#!/usr/bin/env node

/**
 * Bedrock Ledger Maintainer CLI
 * Command line interface for updating Witness Pool documents
 *
 * Copyright (C) 2021 Digital Bazaar, Inc. All Rights Reserved.
 */

const yargs = require('yargs');
const util = require('util');

// print out unhandled errors
process.on(
  'unhandledRejection',
  error => console.error(util.inspect(error, {depth: null})));

function _setupCLIOptions() {
  return yargs
    .option('primary', {
      alias: 'p',
      describe: 'A comma separated list of primary nodes',
      default: ''
    }).option('secondary', {
      alias: 's',
      describe: 'A comma separated list of secondary nodes',
      default: ''
    }).option('maintainerKey', {
      alias: 'k',
      describe: 'A maintainer file containing material for a did key',
      default: null
    }).option('keepAlive', {
      alias: 'a',
      describe: 'Whether to keep the httpsAgent agent alive',
      default: true
    }).option('rejectUnauthorized', {
      alias: 'r',
      describe: 'Whether to reject domains with invalid SSL certificates',
      default: false
    }).option('veresMode', {
      alias: 'm',
      describe: 'The mode for veres one driver',
      default: 'dev'
    }).option('maximumWitnessCount', {
      alias: 'w',
      describe: 'The maximumWitnessCount for the witnessPool',
      default: 1
    }).option('didMethod', {
      alias: 'd',
      default: 'key',
      describe: 'The type of did key to use. Either "key" or "v1"'
    });
}

_setupCLIOptions(yargs);

yargs.scriptName('vom')
  .usage('$0 <cmd> [args]')
  .command('create', 'create a witness pool doc', async ({argv}) => {
  })
  .command('update', 'update ledger nodes', async ({argv}) => {
  })
  .help()
  .argv;
