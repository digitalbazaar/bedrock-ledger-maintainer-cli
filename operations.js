const jsigs = require('jsonld-signatures');
const v1 = require('did-veres-one');
const documentLoader = require('./documentLoader');
const {deepClone} = require('./helpers');
const {Ed25519Signature2020} = require('@digitalbazaar/ed25519-signature-2020');
const {CapabilityInvocation} = require('@digitalbazaar/zcapld');

const api = {};

const ledgerId = 'did:v1:test:uuid:c37e914a-1e2a-4d59-9668-ee93458fd19a';

const acceleratorProof = {
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

api.createWitnessPoolDoc = async ({
  didDocument,
  nodes,
  maximumWitnessCount
}) => {

};

api.updateWitnessPoolDoc = async ({
  didDocument,
  existingWitnessPool,
  nodes,
  maximumWitnessCount
}) => {

};

api.signOperation = async ({
  operation,
  key,
  didMethod,
  witnessPoolId
}) => {
  switch(didMethod.toLowerCase()) {
    case 'v1': {
      operation.proof = deepClone(acceleratorProof);
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
      throw new Error(`Unknown didMethod ${didMethod}`);
    }
  }
};

module.exports = api;
