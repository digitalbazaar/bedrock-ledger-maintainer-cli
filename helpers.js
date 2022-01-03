/**
 *
 *  Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
*/

const crypto = require('crypto');
const {WebLedgerClient} = require('web-ledger-client');
const v1 = require('did-veres-one');
const didKeyDriver = require('@digitalbazaar/did-method-key').driver();
const {
  Ed25519VerificationKey2020
} = require('@digitalbazaar/ed25519-verification-key-2020');

/**
 * Takes in a potential url or domain and create a URL.
 *
 * @param {string} node - The address of a node.
 *
 * @returns {URL} Returns a url.
 */
function toUrl(node) {
  const trimmed = node.trim();
  const expectedProtocol = 'https://';
  const insecureProtocol = 'http://';
  if(trimmed.startsWith(insecureProtocol)) {
    throw new Error('Insecure Protocol. Expected ' +
      `${expectedProtocol} got ${trimmed}`);
  }
  // we do accept domains
  if(!trimmed.startsWith(expectedProtocol)) {
    return new URL(`${expectedProtocol}${trimmed}`);
  }
  return new URL(trimmed);
}

/**
 * Takes in either an Array or a String and returns an Array
 * of nodes.
 *
 * @param {Array|string} nodes - A list of nodes.
 *
 * @returns {Array<object>} - An array of node information.
 */
async function parseNodes(nodes, httpsAgent) {
  // if not input was provided just return
  if(!nodes) {
    return [];
  }
  // if the user did -p foo -p bar then we will get an array
  // so just return it as it
  if(Array.isArray(nodes)) {
    return Promise.all(nodes.map(node => getNodeData({node, httpsAgent})));
  }
  const nodeType = typeof nodes;
  if(nodeType === 'string') {
    return Promise.all(
      nodes.split(',').map(node => getNodeData({node, httpsAgent})));
  }
  throw new Error(`Expected nodes to be an Array or a string got ${nodeType}`);
}

/**
 * Takes in a node and wraps a WebLedgerClient around & then gets
 *   pertinent node info.
 *
 * @param {object} options - Options to use.
 * @param {string} options.node - The address of a node.
 * @param {Function} options.httpsAgent - A node httpsAgent.
 *
 * @returns {Promise<object>} - An object with node specific information.
 */
async function getNodeData({node, httpsAgent}) {
  const url = toUrl(node);
  const ledgerClient = new WebLedgerClient({hostname: url.host, httpsAgent});
  return {
    url,
    ledgerClient,
    genesisBlock: await ledgerClient.getGenesisBlock(),
    targetNode: await ledgerClient.getTargetNode()
  };
}

function deepClone(json) {
  return JSON.parse(JSON.stringify(json));
}

/**
 * Either gets an existing key or creates a new one.
 *
 * @param {object} options - Options to use.
 * @param {object} options.maintainerKey - An public and private key.
 * @param {string} options.veresMode - The mode for veres-one.
 * @param {string} options.hostname - The veres one node host.
 *
 * @returns {Promise<object>} The resulting key and helpers methods.
 */
async function getKey({
  maintainerKey,
  didMethod,
  veresMode,
  httpsAgent,
  hostname
}) {
  switch(didMethod.toLowerCase()) {
    case 'v1': {
      return _createV1Key({
        maintainerKey,
        veresMode,
        httpsAgent,
        hostname
      });
    }
    case 'key': {
      return _createDIDKey({
        maintainerKey,
      });
    }
    default: {
      throw new Error(
        `parameter "didMethod" must be "v1" or "key" received "${didMethod}"`);
    }
  }
}

async function _createV1Key({maintainerKey, veresMode, httpsAgent, hostname}) {
  const options = {
    mode: veresMode,
    httpsAgent,
    hostname
  };
  const veresDriver = v1.driver(options);

  if(!maintainerKey) {
    return veresDriver.generate(
      {didType: 'nym', keyType: 'Ed25519VerificationKey2020'});
  }
  // this a json object with public and private key material
  const keyOps = require(maintainerKey);
  const invokeKey = new Ed25519VerificationKey2020(keyOps);
  return veresDriver.generate({invokeKey});
}

async function _createDIDKey({maintainerKey}) {
  // FIXME this should support multi-codec
  // creates 32 byte hashes for passwords
  const hash32 = crypto.createHash('sha256');
  hash32.update(maintainerKey);
  const seed = hash32.digest();
  return didKeyDriver.generate({seed});
}

module.exports = {
  deepClone,
  toUrl,
  parseNodes,
  getNodeData,
  getKey
};
