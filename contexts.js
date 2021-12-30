/**
 *
 *  Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
*/

const ed25519Ctx = require('ed25519-signature-2020-context');
const webLedgerCtx = require('web-ledger-context');
const jsonldPatchCtx = require('json-ld-patch-context');
const veresOneCtx = require('veres-one-context');
const didCtx = require('@digitalcredentials/did-context');
const zcapCtx = require('zcap-context');

const contextMap = new Map();

// add contexts to the documentLoader
contextMap.set(zcapCtx.constants.CONTEXT_URL, zcapCtx.CONTEXT);
contextMap.set(ed25519Ctx.constants.CONTEXT_URL, ed25519Ctx.CONTEXT);
contextMap.set(
  webLedgerCtx.constants.WEB_LEDGER_CONTEXT_V1_URL,
  webLedgerCtx.contexts.get(
    webLedgerCtx.constants.WEB_LEDGER_CONTEXT_V1_URL)
);
contextMap.set(
  jsonldPatchCtx.constants.JSON_LD_PATCH_CONTEXT_V1_URL,
  jsonldPatchCtx.contexts.get(
    jsonldPatchCtx.constants.JSON_LD_PATCH_CONTEXT_V1_URL)
);
contextMap.set(
  veresOneCtx.constants.VERES_ONE_CONTEXT_V1_URL,
  veresOneCtx.contexts.get(
    veresOneCtx.constants.VERES_ONE_CONTEXT_V1_URL)
);
contextMap.set(
  didCtx.constants.DID_CONTEXT_URL,
  didCtx.contexts.get(
    didCtx.constants.DID_CONTEXT_URL)
);

// export the constants for use in records & operations
const contexts = {
  ED25519_2020_CONTEXT_V1_URL: ed25519Ctx.constants.CONTEXT_URL,
  WEB_LEDGER_CONTEXT_V1_URL: webLedgerCtx.constants.WEB_LEDGER_CONTEXT_V1_URL,
  JSON_LD_PATCH_CONTEXT_V1_URL:
    jsonldPatchCtx.constants.JSON_LD_PATCH_CONTEXT_V1_URL,
  VERES_ONE_CONTEXT_V1_URL: veresOneCtx.constants.VERES_ONE_CONTEXT_V1_URL,
  DID_CONTEXT_URL: didCtx.constants.DID_CONTEXT_URL,
  ZCAP_CONTEXT_V1_URL: zcapCtx.constants.CONTEXT_URL
};

const didDocumentContexts = [
  contexts.DID_CONTEXT_URL,
  contexts.WEB_LEDGER_CONTEXT_V1_URL,
  contexts.ED25519_2020_CONTEXT_V1_URL
];

const v1DidDocumentContexts = [
  contexts.DID_CONTEXT_URL,
  contexts.VERES_ONE_CONTEXT_V1_URL,
  contexts.WEB_LEDGER_CONTEXT_V1_URL,
  contexts.ED25519_2020_CONTEXT_V1_URL
];

const ledgerOperationContexts = [
  contexts.WEB_LEDGER_CONTEXT_V1_URL,
  contexts.ZCAP_CONTEXT_V1_URL,
  contexts.ED25519_2020_CONTEXT_V1_URL
];

module.exports = {
  contexts,
  contextMap,
  didDocumentContexts,
  v1DidDocumentContexts,
  ledgerOperationContexts
};
