'use strict';
var graphlib = require('graphlib'); // Download using  : npm install graphlib
var Graph = require('graphlib').Graph;
var g = [];
g.push(new Graph({ directed: false })); // Let g array has a graph element.
// Define a vertices object, with 2 keys: id and coordinate
var vertices = [
  { id: 'v1', coordinate: [4, 3] },
  { id: 'v2', coordinate: [15, 80] },
  { id: 'v3', coordinate: [-100, 3] },
  { id: 'v4', coordinate: [-5, -2] },
  { id: 'v5', coordinate: [40, -70] },
  { id: 'v6', coordinate: [0, 0] }
];

// This function aims at initialize a graph, setting edges and nodes, takes no input nor output;
function initGraph() {
  let M = vertices.length; // In this case, M = 6
  for (var i = 0; i < M; i++) {
    g[0].setNode(vertices[i].id);
  } // Set nodes in the empty graph using their id
  g[0].setEdge('v1', 'v2');
  g[0].setEdge('v2', 'v3');
  g[0].setEdge('v3', 'v4');
  g[0].setEdge('v4', 'v5');
  g[0].setEdge('v5', 'v6'); // Set edges for this graph
}
initGraph(); // Need to run this function before everything start, no g[0], no g[i]

// Calculate the distance between two vertices, takes 2 input, vertex1 and vertex2 are Objects. With one output, returns the distance value.
function ddistance(vertex1, vertex2) {
  var distance = Math.sqrt(
    Math.pow(vertex1.coordinate[0] - vertex2.coordinate[0], 2) +
      Math.pow(vertex1.coordinate[1] - vertex2.coordinate[1], 2)
  );
  // Vertex1.coordinate[0] returns the coordinate key in vertices object, and x value
  return distance;
}

// Tell whether a graph is connected, take a graph as input, and return true or false
// The rule is: if the length of first group of connected components of a graph equals to the number of nodes, this means all the nodes are in the same component, thus the graph is connected.
function isConnected(graph) {
  if (graphlib.alg.components(graph)[0].length === graph.nodeCount()) {
    return true;
  }
  return false;
}

// Tell whether an edge in a graph is a bridge, takes three inputs(graph,v,w): graph is a certain graph, v and w are two vertices of the object edge, like'v1','v3'
// Methodology: make sure the input graph is firstly connected. Remove this edge, if the graph becomes disconnected, then it is an Edge, if the graph is still connected, then it is not an edge
function isBridge(graph, v, w) {
  var graph0;
  if (isConnected(graph) === false) {
    console.log('This is not a connected graph');
  } else {
    graph0 = graph.removeEdge(v, w);
  }
  if (isConnected(graph0)) {
    graph.setEdge(v, w); // Recover the graph after trial
    return false;
  }
  graph.setEdge(v, w); // Recover the graph after trial
  return true;
}
// Calculate the sum of weight in a graph, takes a graph as input and returns the value of sum
// The key point of this function is to relating the vertices object I created myself to the vertices got from the graph edges.
// Thus I can get the coordinate of vertices from the Object I defined through reading the edges of graph
function weightSum(graph) {
  var M = graph.nodeCount();
  var E = graph.edges();
  var sum = 0;
  var V;
  var W;
  for (var i = 0; i < graph.edgeCount(); i++) {
    for (var j = 0; j < M; j++) {
      if (vertices[j].id === E[i].v) {
        V = j;
      } else if (vertices[j].id === E[i].w) {
        W = j;
      }
    }
    sum += ddistance(vertices[V], vertices[W]);
  }
  return sum;
}

// This is a function needed in dijskra algorithm from graphlib, it takes the edge id 'e' as input, and return the weight of this edge.
function weightFn(e) {
  let M = vertices.length; // In this case, M = 6
  var V;
  var W;
  for (var j = 0; j < M; j++) {
    if (vertices[j].id === e.v) {
      V = j;
    } else if (vertices[j].id === e.w) {
      W = j;
    }
  }
  return ddistance(vertices[V], vertices[W]);
}

// This function calculates the theta value of a state(graph, source node), I set r = 1, and it returns the theta value based on the function in the project description
function theta(graph, s, r = 1) {
  var M = graph.nodeCount();
  var paths = graphlib.alg.dijkstra(graph, s, weightFn, v => graph.nodeEdges(v));
  var sum = 0;
  for (var k = 0; k < M; k++) {
    sum += paths[Object.keys(paths)[k]].distance;
  }
  sum += r * weightSum(graph);
  return sum;
}

// This function calculate the number of bridges in a graph. it takes (graph) as input, and return the number of bridges
function bridgeCount(graph) {
  var bridgeNum = 0;
  for (var i = 0; i < graph.edgeCount(); i++) {
    if (isBridge(graph, graph.edges()[i].v, graph.edges()[i].w)) {
      // Go through every edge and see whether it is a bridge using isBridge function I created
      bridgeNum++;
    }
  }
  return bridgeNum;
}

// This function aims at find a random source, no input, return a random vertex in vertices object.
function randomSource() {
  let M = vertices.length; // In this case, M = 6
  var random = Math.floor(Math.random() * M);
  return vertices[random].id;
}

// I create this function since I find an error: when I copy a graph, it doen't copy the contents of the graph, but the position instead.
// When I modify the graph, all the graphs I copied before changed. To avoid this, I create this function
// It takes a (graph) as input and output a new graph, with same nodes and edges, but it is independent.
function copyGraph(graph) {
  let newgraph = new Graph({ directed: false });
  graph.nodes().forEach(n => {
    newgraph.setNode(n, graph.node(n));
  });
  graph.edges().forEach(e => {
    newgraph.setEdge(e.v, e.w);
  });
  return newgraph;
}

// This function takes (graph) as input, and returns the proposal distribution of this graph, the next element in Markov Chain
// The output is an object, a new graph, qij and qji
function propDistribution(graph) {
  let M = vertices.length; // In this case, M = 6
  var i;
  var j;
  var v;
  var w;
  var graph2;
  var qij;
  var qji;
  i = Math.floor(Math.random() * M);
  do {
    j = Math.floor(Math.random() * M);
  } while (j === i); // Choose two random vertices, and making sure they are not the same one
  v = vertices[i].id;
  w = vertices[j].id;
  if (graph.hasEdge(v, w)) {
    if (isBridge(graph, v, w)) {
      graph2 = graph; // In this case, if the selected edge is a Brige, the graph itself won't change, instead, the source node will change randomly, thus the state will change anyway.
      qji = 1;
      qij = 1;
    } else {
      qji = 1 / (graph.edgeCount() - bridgeCount(graph));
      qij = 1 / (M * (M - 1) * 0.5 - graph.edgeCount());
      graph2 = graph.removeEdge(v, w); // If the graph has this edge and it is not a bridge, remove this
    }
  } else {
    qji = 1 / (M * (M - 1) * 0.5 - graph.edgeCount());
    qij = 1 / (graph.edgeCount() - bridgeCount(graph));
    graph2 = graph.setEdge(v, w); // If the graph doesn't have this edge, add this edge
  }
  return { graPh: graph2, qji: qji, qij: qij };
}

// This function forms the Markov Chain, takes no input, with an output which is a Markove Chain we want
function mcmc() {
  var T = 300; // I set T = 300
  var former = g[0]; // The 'now' state
  var next; // The 'next' state
  for (var i = 0; i < 9999; i++) {
    next = propDistribution(former);
    var thetai = theta(former, randomSource());
    var thetaj = theta(next.graPh, randomSource());
    let value = (next.qji / next.qij) * Math.exp(-(thetai - thetaj) / T);
    let accept = value > 0.5; // I set it if the value greater than 0.5, accept this state
    if (accept) {
      g[i + 1] = copyGraph(next.graPh);
      former = copyGraph(next.graPh);
    } else {
      i--; // If not accepted, back to the former state and get another proposal distribution
    }
  }
  return g;
}

// This function do the statistic things of the Markov Chain and get the answer you want. Everything will be log the the console.
function statisGraph() {
  let M = vertices.length; // In this case, M = 6
  var i;
  var j;
  var n;
  var graphChain = mcmc();
  var diffGraphs = []; // An array with the number of same graphs
  var GraphEdgeNum = []; // The number of edges in a graph
  var GraphWeightSum = []; // The number of the total weight of a graph
  const N = graphChain.length;
  for (n = 0; n < N; n++) {
    GraphEdgeNum[n] = graphChain[n].edgeCount();
    GraphWeightSum[n] = weightSum(graphChain[n]);
  }

  // Answer the question,calculate the expected maximum shortest path from vertex0('v1' in this case)
  var ExpMaxShortest = 0;
  for (i = 0; i < N; i++) {
    var paths = graphlib.alg.dijkstra(graphChain[i], 'v1', weightFn, v =>
      graphChain[i].nodeEdges(v)
    );
    ExpMaxShortest += paths[Object.keys(paths)[M - 1]].distance;
  }
  ExpMaxShortest /= N;

  // Calculate the expected number of Edges connected to vertex0( v1 here)
  var ExpectedEdge0 = 0;
  for (i = 0; i < N; i++) {
    ExpectedEdge0 += graphChain[i].nodeEdges('v1').length;
  }
  ExpectedEdge0 /= N;

  // Calculate the expected number of Edges in the entire graph
  var ExpectedEdgeNum = 0;
  for (i = 0; i < N; i++) {
    ExpectedEdgeNum += GraphEdgeNum[i];
  }
  ExpectedEdgeNum /= N;

  // Statis
  diffGraphs[0] = 1;
  for (i = 0; i < graphChain.length - 1; i++) {
    diffGraphs.push(1);
    for (j = i + 1; j < graphChain.length; j++) {
      if (
        GraphEdgeNum[j] === GraphEdgeNum[i] &&
        GraphWeightSum[j] === GraphWeightSum[i]
      ) {
        graphChain.splice(j, 1);
        GraphEdgeNum.splice(j, 1);
        GraphWeightSum.splice(j, 1);
        j--;
        diffGraphs[i]++;
      }
    }
  }
  var max1 = 0;
  var max2;
  var position1 = 0;
  var position2;
  // Find the top 2 maximum value and it's position
  for (i = 0; i < diffGraphs.length; i++) {
    if (diffGraphs[i] > max1) {
      max2 = max1;
      position2 = position1;
      max1 = diffGraphs[i];
      position1 = i;
    }
  }
  return {
    graphChain,
    ExpMaxShortest,
    ExpectedEdge0,
    ExpectedEdgeNum,
    max1,
    max2,
    position1,
    position2
  };
}
var answer = statisGraph();
console.log('Expected maximum shortest path to v1:  ' + answer.ExpMaxShortest);
console.log('*************************');
console.log('Expected number of edges commected to v1:  ' + answer.ExpectedEdge0);
console.log('*************************');
console.log('Expected number of Edges in the entire graph:  ' + answer.ExpectedEdgeNum);
console.log('*************************');
console.log('The most probable graph: ');
console.log(answer.graphChain[answer.position1].edges());
console.log('Number of Most probable graph: ' + answer.max1);
console.log('The second most probable graph: ');
console.log(answer.graphChain[answer.position2].edges());
console.log('Number of 2nd Most probable graph: ' + answer.max2);

module.exports = {
  initGraph: initGraph,
  ddistance: ddistance,
  isConnected: isConnected,
  isBridge: isBridge,
  weightSum: weightSum,
  weightFn: weightFn,
  bridgeCount: bridgeCount,
  theta: theta,
  randomSource: randomSource,
  copyGraph: copyGraph,
  propDistribution: propDistribution,
  mcmc: mcmc,
  statisGraph: statisGraph
};
