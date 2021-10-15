import * as d3 from 'd3'; 

export function Bipartite(netv, graphs, num, leng) {
  let nodeprops = []; 
  let linkprops = [];
  let nodes = new Array(num).fill(0);
  let leftnodes = new Array(num).fill(0);
  let sid = 0;
  const padding = {left: 50, top: 50};
  const yScale = d3.scaleLinear()
    .domain([0, num])
    .range([padding.top, 10 * num + padding.top]);
  for (; sid < leng; sid++) {
    leftnodes = JSON.parse(JSON.stringify(nodes))
    nodes.fill(0);
    graphs[sid].link.map(d => {
      leftnodes[d.source] = 1;
      nodes[d.target] = 1;
      linkprops.push({
        source: sid + '-' + d.source,
        target: (sid + 1) + '-' + d.target,
      });
    });
    leftnodes.map((d, idx) => {
      nodeprops.push({
        id: sid + '-' + idx,
        x: (sid + 1) * padding.left,
        y: yScale(idx),
        style: {
          shape: 'rect',  
          fill: {r: 0, g: 191, b: 255, a: d},
          width: 8,
          height: 8,
        },
      })
    });
  }
  nodes.map((d, idx) => {
    nodeprops.push({
      id: sid + '-' + idx,
      x: (sid + 1) * padding.left,
      y: yScale(idx),
      style: {
        shape: 'rect',  
        fill: {r: 0, g: 191, b: 255, a: d},
        width: 8,
        height: 8,
      },
    })
  });
  netv.addNodes(nodeprops);
  netv.addLinks(linkprops);
}
