require('coveralls');
const assert = require('assert');
// Const mcmc = require('../index.js');
var mcmc = require('../../lib/index.js');
var Graph = require('graphlib').Graph;

describe('mcmc', () => {
  it('should initialize the g[0] as a graph as designed', () => {
    var g = [];
    g.push(new Graph({ directed: false }));
    mcmc.initGraph();
    assert(true, g[0].edgeCount() === 5);
  }); // Test whether it creates a graph as I designed.

  it('should calculate the distance between two vertices', () => {
    var vertex1 = { coordinate: [0, 2] };
    var vertex2 = { coordinate: [0, 0] };
    var dist = mcmc.ddistance(vertex1, vertex2);
    assert(true, dist === 2);
  }); // Tests whether it returns the correct distance if given two vertices

  it('tell whether the graph is connected', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    g.setEdge('v2', 'v3');
    g.setEdge('v3', 'v4');
    g.setEdge('v4', 'v5');
    var n = mcmc.isConnected(g);
    assert(true, n);
    g.removeEdge('v3', 'v2');
    var m = mcmc.isConnected(g);
    assert(true, !m);
  }); // Test whether it will tell connectness correctly of a known graph

  it('tell whether an edge is a bridge', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    g.setEdge('v2', 'v3');
    g.setEdge('v3', 'v4');
    g.setEdge('v4', 'v5');
    g.setEdge('v3', 'v5');
    var n = mcmc.isBridge(g, 'v2', 'v3');
    assert(true, n);
    var m = mcmc.isBridge(g, 'v3', 'v4');
    assert(true, !m);
  }); // Test whether it will tell it is a bridge or not correctly of a known graph and a given edge

  it('calculate the sum of the edge weight in a graph', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    g.setEdge('v2', 'v3');
    g.setEdge('v3', 'v4');
    g.setEdge('v4', 'v5');
    g.setEdge('v5', 'v6');
    var weightsum = mcmc.weightSum(g);
    assert(true, weightsum === 13);
  }); // Test whether it can calculate the sum of weight in a known graph properly

  it('count how many bridges are there in a graph', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    g.setEdge('v2', 'v3');
    g.setEdge('v3', 'v4');
    g.setEdge('v4', 'v5');
    g.setEdge('v3', 'v5');
    var num = mcmc.bridgeCount(g);
    assert(true, num === 2);
  }); // Test whether it can count the number of bridges of a known graph properly

  it('return the weight of an edge (e)', () => {
    var e = { v: 'v1', w: 'v6' };
    var value = mcmc.weightFn(e);
    assert(5, value);
  }); // Test whether it calculate the weight correctly for an edge(e)

  it('calculate the theta for each state', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    g.setEdge('v2', 'v3');
    g.setEdge('v3', 'v4');
    g.setEdge('v4', 'v5');
    g.setEdge('v3', 'v5');
    var value = mcmc.theta(g, 'v1');
    assert(10, value);
  }); // Test whether it calculates the correct theta for a given state

  it('return a random source', () => {
    var node0 = mcmc.randomSource();
    var node1 = mcmc.randomSource();
    assert(true, node0 !== node1);
  }); // Test whether it create a random source, we check it's id to makesure it's random

  it('return a same graph as input', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    var g1 = mcmc.copyGraph(g);
    assert(true, g1.edges() === g.edges());
  }); // Test whether it returns a same graph as input, we check whether the edges are same in two graphs

  it('proposal distribution', () => {
    var g = new Graph({ directed: false });
    g.setEdge('v1', 'v2');
    g.setEdge('v2', 'v3');
    g.setEdge('v3', 'v4');
    g.setEdge('v4', 'v5');
    g.setEdge('v5', 'v6');
    var g1 = mcmc.propDistribution(g);
    var g2 = mcmc.propDistribution(g1.graPh);
    var q1 = g1.qji;
    var q2 = g2.qji;
    assert(true, q1 !== q2);
  }); // Make sure that the adjacent graphs are never same, since the state has to change according to my proposal distribution

  it('forms a Markov Chain', () => {
    mcmc.initGraph();
    var g = mcmc.mcmc();
    assert(true, g.length === 10000);
  }); // Make sure it forms a Markov Chain with length 10000, as I designed

  it('do statis for the Markov Chain', () => {
    var Chain = mcmc.statisGraph().graphChain;
    assert(true, Chain.length < 1000);
  }); // The length of the output Chain must be shorter since the original Chain since I remove all the duplicate elements and all the elements left are unique
});
