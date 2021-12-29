const jsigs = require('jsonld-signatures');
const v1 = require('did-veres-one');
const {Ed25519Signature2020} = require('@digitalbazaar/ed25519-signature-2020');
const {CapabilityInvocation} = require('@digitalbazaar/zcapld');
const contexts = require('./contexts');
const documentLoader = require('./documentLoader');
const {deepClone} = require('./helpers');

const api = {};

//FIXME in the future we will need to get the ledgerId from the genesis block
const ledgerId = 'did:v1:test:uuid:c37e914a-1e2a-4d59-9668-ee93458fd19a';

//FIXME this will need to be constructed using the ledgerId
//and signed with a key delegated from the maintainer
const ledgerWriteProof = {
  type: 'Ed25519Signature2020',
  created: '2021-01-10T23:10:25Z',
  capability: `urn:zcap:root:${encodeURIComponent(ledgerId)}`,
  capabilityAction: 'write',
  invocationTarget: `${ledgerId}/records`,
  proofPurpose: 'capabilityInvocation',
  proofValue: 'z3t9it5yhFHkqWnHKMQ2DWVj7aHDN37f95UzhQYQGYd9LyTSGzufCiTwDWN' +
    'fCdxQA9ZHcTTVAhHwoAji2AJnk2E6',
  verificationMethod: 'did:v1:test:nym:z279yHL6HsxRzCPU78DAWgZVieb8xPK1mJKJBb' +
    'P8T2CezuFY#z279tKmToKKMjQ8tsCgTbBBthw5xEzHWL6GCqZyQnzZr7wUo'
};

const veresOneContexts = [
  contexts.DID_CONTEXT_URL,
  contexts.VERES_ONE_CONTEXT_V1_URL,
  contexts.WEB_LEDGER_CONTEXT_V1_URL,
  contexts.ED25519_2020_CONTEXT_V1_URL
];

api.createWitnessPoolDoc = async ({
  didDocument,
  nodes,
  witnessPoolId,
  maximumWitnessCount,
  contexts = veresOneContexts
}) => ({
  '@context': contexts,
  id: witnessPoolId,
  type: 'WitnessPool',
  controller: didDocument.id,
  maximumWitnessCount,
  primaryWitnessCandidate: nodes.primary.map(p => p.targetNode),
  secondaryWitnessCandidate: nodes.secondary.map(s => s.targetNode)
});

api.updateWitnessPoolDoc = async ({
  existingWitnessPool,
  nodes,
  maximumWitnessCount,
  sequence,
  witnessPoolId,
  contexts = veresOneContexts
}) => {
  const patch = [];
  return {
    '@context': [contexts.JSON_LD_PATCH_CONTEXT_V1_URL, {
      value: {
        '@id': 'jldp:value',
        '@context': contexts
      }
    }],
    target: witnessPoolId,
    sequence,
    patch
  };
};

api.signOperation = async ({
  operation,
  key,
  didMethod = '',
  witnessPoolId
}) => {
  switch(didMethod.toLowerCase()) {
    case 'v1': {
      operation.proof = deepClone(ledgerWriteProof);
      return v1.attachInvocationProof({
        operation,
        capability: `urn:zcap:root:${encodeURIComponent(witnessPoolId)}`,
        capabilityAction: 'write',
        invocationTarget: witnessPoolId,
        key,
        signer: key.signer()
      });
    }
    case 'key': {
      //  FIXME should all ledgers use the same permission pattern as veres-one?
      //  FIXME does this need a ledgerWriteProof in addition to the
      //  document write proof?
      return jsigs.sign(operation, {
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
