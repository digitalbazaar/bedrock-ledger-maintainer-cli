/**
 *
 *  Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
*/

const https = require('https');
const {parseNodes, getKey} = require('./helpers');
const {
  createWitnessPoolDoc,
  updateWitnessPoolDoc,
  signOperation
} = require('./operations');

/**
 * The MaintainerApp glues all the various services into a single App.
 *
 * @param {object} options - Options to use.
 * @param {string|Array<string>} options.primary - A list of primary nodes.
 * @param {string|Array<string>} options.secondary - A list of secondary nodes.
 * @param {boolean} options.keepAlive - Whether to keep the httpsAgent alive.
 * @param {boolean} options.rejectUnauthorized - Should the httpsAgent reject
 *   invalid SSL certificates?
 * @param {string} options.veresMode - The mode for the veres one driver.
 * @param {string} [options.maintainerKey] - A path to a key file for the
 *   primary node.
 */
class App {
  constructor({
    primary, secondary, didMethod,
    keepAlive, rejectUnauthorized,
    veresMode, maintainerKey, maximumWitnessCount
  }) {
    this.primary = primary;
    this.secondary = secondary;
    this.keepAlive = keepAlive;
    this.rejectUnauthorized = rejectUnauthorized;
    this.veresMode = veresMode;
    this.didMethod = didMethod;
    this.maintainerKey = maintainerKey;
    this.httpsAgent = new https.Agent({
      keepAlive,
      rejectUnauthorized
    });
    this.maximumWitnessCount = Number.parseInt(maximumWitnessCount);
  }
  // formats the nodes into did keys for the witness pool doc.
  get primaryWitnessCandidate() {
    return this.nodes.primary.map(p => p.targetNode);
  }
  // formats the nodes into did keys for the witness pool doc.
  get secondaryWitnessCandidate() {
    return this.nodes.secondary.map(s => s.targetNode);
  }
  // adds the primary and secondary witnesses together.
  get totalNodeCount() {
    return this.primaryWitnessCandidate.length +
      this.secondaryWitnessCandidate.length;
  }
  // the max number of faults is the (total nodes - 1) / 3
  // this is derived from 3f + 1 = minimum # of nodes for faults
  get maxFaults() {
    return Math.floor((this.totalNodeCount - 1) / 3);
  }
  // we're assuming the first primary node is the one you have
  // a maintainer key for.
  get primaryNode() {
    const [firstPrimaryNode] = this.nodes.primary;
    return firstPrimaryNode;
  }
  // all operations are done one the first primary node's ledger agent.
  get primaryLedgerClient() {
    return this.primaryNode.ledgerClient;
  }
  // gets the witness pool id from the genesis node config
  get witnessPoolId() {
    const {genesisBlock: {event: [config]}} = this.primaryNode;
    const {ledgerConfiguration: {witnessSelectionMethod}} = config;
    if(!witnessSelectionMethod) {
      throw new Error('Expected Genesis node to have a witnessSelectionMethod');
    }
    return witnessSelectionMethod.witnessPool;
  }
  // calculates the minimum number of nodes required
  // to support a certain number of faults in consensus
  minNodes(faults) {
    return faults * 3 + 1;
  }
  // calculates the minimum number of primary nodes required
  // to support a certain number of faults in consensus
  minPrimaryNodes(faults) {
    return faults * 2 + 2;
  }
  // takes the node list and gets ledgerAgents & genesis blocks for them.
  async getNodes() {
    const {primary, secondary, httpsAgent} = this;
    return {
      primary: await parseNodes(primary, httpsAgent),
      secondary: await parseNodes(secondary, httpsAgent)
    };
  }
  // is there an existing genesis pool doc?
  async findWitnessPoolDoc() {
    try {
      const result = await this.primaryLedgerClient.getRecord(
        {id: this.witnessPoolId});
      return result;
    } catch(e) {
      if(e.name === 'NotFoundError') {
        return {found: false};
      }
      throw e;
    }
  }
  async signAndSendOperation({operation, key, didMethod}) {
    console.log('sending operation', JSON.stringify({operation}, null, 2));
    console.log(JSON.stringify({
      primaryNodes: this.primaryWitnessCandidate,
      secondaryNodes: this.secondaryWitnessCandidate,
      totalNodes: this.totalNodeCount,
      maxFaults: this.maxFaults
    }, null, 2));
    const signed = await signOperation({operation, key, didMethod});
    await this.primaryLedgerClient.sendOperation({operation: signed});
  }
  // fetches all the ledger node and config information from all nodes
  async setup() {
    // parse the nodes from the cli command
    this.nodes = await this.getNodes();
    // find the genesis pool of the first primary node
    const {found, meta} = await this.findGenesisPool();
    return {nodes: this.nodes, meta, found};
  }
  async create() {
    const {
      httpsAgent,
      maintainerKey,
      veresMode,
      didMethod,
      maximumWitnessCount
    } = this;
    // get the maintainer key or generate a new one
    const {didDocument, methodFor} = await getKey({
      maintainerKey,
      httpsAgent,
      didMethod,
      veresMode,
      hostname: this.primaryNode.url.host
    });
    const operation = createWitnessPoolDoc({
      witnessPoolId: this.witnessPoolId,
      didDocument,
      nodes: this.nodes,
      maximumWitnessCount
    });
    // use the capabilityInvocation key
    const key = methodFor({purpose: 'capabilityInvocation'});
    // sign the operation and send it to the ledger
    await this.signAndSendOperation({operation, key, didMethod});
  }
  async update({existingWitnessPool}) {
    const {
      httpsAgent,
      maintainerKey,
      veresMode,
      didMethod,
      maximumWitnessCount
    } = this;
    // get the maintainer key or generate a new one
    const {didDocument, methodFor} = await getKey({
      maintainerKey,
      httpsAgent,
      didMethod,
      veresMode,
      hostname: this.primaryNode.url.host
    });
    const operation = updateWitnessPoolDoc({
      didDocument,
      existingWitnessPool,
      nodes: this.nodes,
      maximumWitnessCount
    });
    // use the capabilityInvocation key
    const key = methodFor({purpose: 'capabilityInvocation'});
    // sign the operation and send it to the ledger
    await this.signAndSendOperation({operation, key, didMethod});
  }
}

module.exports = App;
