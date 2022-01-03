/**
 *
 *  Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
*/

const jsonpatch = require('fast-json-patch');
const jsigs = require('jsonld-signatures');
const v1 = require('did-veres-one');
const {Ed25519Signature2020} = require('@digitalbazaar/ed25519-signature-2020');
const {CapabilityInvocation} = require('@digitalbazaar/zcapld');
const {contexts, getRecordContexts} = require('./contexts');
const documentLoader = require('./documentLoader');

const api = {};

/**
 * Adds a ledger invocation proof allowing you to write to the ledger.
 *
 * @param {object} options - Options to use.
 * @param {string} options.ledgerId - The ledger id.
 * @param {object} options.key - A key to signed with.
 * @param {object} options.operation - A Web ledger operation.
 *
 * @returns {Promise<object>} The signed operation.
 */
const addLedgerInvocationProof = ({ledgerId, key, operation}) => {
  return jsigs.sign(operation, {
    documentLoader,
    suite: new Ed25519Signature2020({key}),
    purpose: new CapabilityInvocation({
      capability: `urn:zcap:root:${encodeURIComponent(ledgerId)}`,
      capabilityAction: 'write',
      invocationTarget: `${ledgerId}/records`,
    })
  });
};

api.createWitnessPoolDoc = ({
  didDocument,
  nodes,
  witnessPoolId,
  maximumWitnessCount,
  didMethod
}) => ({
  '@context': getRecordContexts(didMethod),
  id: witnessPoolId,
  type: 'WitnessPool',
  controller: didDocument.id,
  maximumWitnessCount,
  primaryWitnessCandidate: nodes.primary.map(p => p.targetNode),
  secondaryWitnessCandidate: nodes.secondary.map(s => s.targetNode)
});

api.updateWitnessPoolDoc = ({
  existingWitnessPool,
  nodes,
  maximumWitnessCount,
  sequence,
  didMethod
}) => {
  const observer = jsonpatch.observe(existingWitnessPool);
  if(Number.isInteger(maximumWitnessCount)) {
    existingWitnessPool.maximumWitnessCount = maximumWitnessCount;
  }
  existingWitnessPool.primaryWitnessCandidate =
    nodes.primary.map(p => p.targetNode);
  existingWitnessPool.secondaryWitnessCandidate =
    nodes.secondary.map(s => s.targetNode);
  const patch = jsonpatch.generate(observer);
  if(patch.length <= 0) {
    throw new Error('Empty json patch. ' +
      'WebLedgerUpdates must contain changes.');
  }
  return {
    '@context': [contexts.JSON_LD_PATCH_CONTEXT_V1_URL, {
      value: {
        '@id': 'jldp:value',
        '@context': getRecordContexts(didMethod)
      }
    }],
    target: existingWitnessPool.id,
    sequence,
    patch
  };
};

api.signOperation = async ({
  operation,
  key,
  didMethod = '',
  witnessPoolId,
  ledgerId
}) => {
  const opWithLedgerProof = await addLedgerInvocationProof({
    operation,
    key,
    ledgerId
  });
  switch(didMethod.toLowerCase()) {
    case 'v1': {
      return v1.attachInvocationProof({
        operation: opWithLedgerProof,
        capability: `urn:zcap:root:${encodeURIComponent(witnessPoolId)}`,
        capabilityAction: 'write',
        invocationTarget: witnessPoolId,
        key,
        signer: key.signer()
      });
    }
    case 'key': {
      return jsigs.sign(opWithLedgerProof, {
        documentLoader,
        suite: new Ed25519Signature2020({key}),
        purpose: new CapabilityInvocation({
          capability: `urn:zcap:root:${encodeURIComponent(witnessPoolId)}`,
          capabilityAction: 'write',
          invocationTarget: witnessPoolId,
        })
      });
    }
    default: {
      throw new Error(`Unknown didMethod "${didMethod}"`);
    }
  }
};

module.exports = api;
