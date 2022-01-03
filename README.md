# Bedrock Ledger Maintainer CLI

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)

## Background
The Bedrock Ledger Maintainer CLI allows you to create & update witness pool records for a number of nodes.

## Install

```js
npm i
```

## Usage

This binary supports both `veres-one` and generic bedrock ledger nodes.

```
blm <cmd> [args]

Commands:
  blm create  create a witness pool doc
  blm update  update ledger nodes
  blm send    creates or updates a witness pool doc

Options:
      --version              Show version number                       [boolean]
  -p, --primary              A comma separated list of primary nodes
                                                                   [default: ""]
  -s, --secondary            A comma separated list of secondary nodes
                                                                   [default: ""]
  -k, --maintainerKey        A maintainer secret or a file containing material
                             for a v1 key                  [default: "password"]
  -a, --keepAlive            Whether to keep the httpsAgent agent alive
                                                                 [default: true]
  -r, --rejectUnauthorized   Whether to reject domains with invalid SSL
                             certificates                       [default: false]
  -m, --veresMode            The mode for veres one driver      [default: "dev"]
  -w, --maximumWitnessCount  The maximumWitnessCount for the witnessPool
                                                                    [default: 1]
  -d, --didMethod            The type of did key to use. Either "key" or "v1"
                                                                [default: "key"]
      --help                 Show help                                 [boolean]
```

### Create a Witness Pool Record

This example is for a non-veres-one ledger that uses did keys.
This example assumes you have 4 primary nodes.
The maintainerKey secret is a just string used to recreate the maintainer key for the ledger.
This will create a witness pool with a fault tolerance of 1.
```
./bin create --primary myNode1.com,myNode2.com,myNode3.com,myNode4.com --maximumWitnessCount 4 --didMethod key --maintainerKey maintainer-key-secret
```

For a `veres-one` ledger node:
```
./bin create --primary myNode1.com,myNode2.com,myNode3.com,myNode4.com --maximumWitnessCount 4 --didMethod v1 --maintainerKey path/to/maintainerKey.json
```
### Update a Witness Pool Record

These update examples use the cli aliases instead of the full option. Example `--primary` becomes `-p`.
Additionally, we now have 7 nodes, so we can safely have one secondary node.
```
./bin update -p myNode1.com,myNode2.com,myNode3.com,myNode4.com,myNode5.com,myNode6.com --secondary myNode7.com -w 6 -d key -k maintainer-key-secret
```

For a `veres-one` ledger node:
```
./bin update -p myNode1.com,myNode2.com,myNode3.com,myNode4.com,myNode5.com,myNode6.com -s myNode7.com -w 6 -d v1 -k path/to/maintainerKey.json
```

### Send a Witness Pool Record

The send command looks for an existing witness pool record.
If non exists it calls on create.
If a record already exists it will issue an update.

```
./bin send -p myNode1.com,myNode2.com,myNode3.com,myNode4.com,myNode7.com,myNode6.com -s myNode5.com -w 6 -d key -k maintainer-key-secret
```

For a `veres-one` ledger node:
```
./bin send -p myNode1.com,myNode2.com,myNode3.com,myNode4.com,myNode7.com,myNode6.com -s myNode5.com -w 6 -d v1 -k path/to/maintainerKey.json
```

### Fault Tolerance
Bedrock blockchains have the following rules for faults in consensus.

```js
// for each fault we need 3 times the fault plus one nodes
const minNodes = faults => 3 * faults + 1
// for each fault we need 2 times the fault primary nodes + 2
const minPrimaryNodes = faults => 2 * faults + 2;

const oneFault = minNodes(1);
// oneFault is 4
const oneFaultPrimaryNodes = minPrimaryNodes(1);
// oneFaultPrimaryNodes is 4
// so for one fault you need 4 nodes, with 4 of those nodes being primary

const twoFaults = minNodes(2);
// twoFaults is 7
const twoFaultsPrimaryNodes = minPrimaryNodes(2);
// twoFaultsPrimaryNodes is 6
// so for two faults you need 7 nodes with 6 of those nodes being primary
// the seventh node can be primary or secondary
```

### Maintainer Key format
Veres One ledgers require the maintainer key is a piece of json in this format:

```js
{
  "type": "Ed25519VerificationKey2020",
  "publicKeyMultibase": "zpublicKeyMultibase",
  "privateKeyMultibase": "zprivateKeyMultibase"
}
```

You can get this by [exporting an Ed25519VerificationKey2020 to a file](https://github.com/digitalbazaar/ed25519-verification-key-2020).
