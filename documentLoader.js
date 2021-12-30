/**
 *
 *  Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
*/

const {JsonLdDocumentLoader} = require('jsonld-document-loader');
const {contextMap} = require('./contexts');
const jdl = new JsonLdDocumentLoader();

for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}

module.exports = jdl.build();
