import * as d3 from 'd3'; 

export function NodeLink(netv, graphs, num, leng) {
  const shape = {width: 400, height: 400};
  let nodeprops, linkprops;
  let lastrecord = new Array(num);
  let record = new Array(num).fill(0);  // -1: disappear, 1: current, 2: appear
  let stay = new Array(num).fill(0);
  const colorMap = {
    '-1': { r: 0, g: 250, b: 154, a: 0.9 },
    '1': { r: 255, g: 0, b: 0, a: 0.9 },
    '2': { r: 255, g: 69, b: 0, a: 0.9 }
  };
  // calculate the position of node and links
  const calprops = (sid, links, record, shape, colorMap) => {
    let nodes = [];
    let nodeprops = [];
    let linkprops = [];
    record.map((d, idx) => {
      if (d !== 0)
        nodes.push({'index': idx});
    })
    let nodepos = JSON.parse(JSON.stringify(nodes));
    d3.forceSimulation(nodepos)
      .force('charge', d3.forceManyBody().strength(-10))   
      .force('center', d3.forceCenter(shape.width / 2, shape.height / 2));
    nodepos.map((d, idx) => {
      nodeprops.push({ 
        id: sid + '-' + nodes[idx].index,
        x: d.x + shape.width / 2 + sid * 200, 
        y: d.y + shape.height / 2, 
        style: {
          fill: colorMap[`${record[nodes[idx].index]}`],
          r: 5,
        },
      });
    });
  
    links.map(d => {
      linkprops.push({
        source: sid + '-' + d.source,
        target: sid + '-' + d.target,
      });
    })
    return [nodeprops, linkprops];
  }

  for (let sid = 0; sid < leng; sid++) {
    for (let i = 0; i < num; i++)
      lastrecord[i] = record[i];
    record.fill(0);
    graphs[sid].link.map(d => {
      record[d.target] = 1;
      record[d.source] = 1;
    })
    if (sid == 0)
      stay = JSON.parse(JSON.stringify(record))
    for (let i = 0; i < num; i++) {
      if (lastrecord[i] > 0 && record[i] === 0) {
        record[i] = -1;
        stay[i] = 0
      }
      else if (lastrecord[i] <= 0 && record[i] === 1)
        record[i] = 2;
    }
    [nodeprops, linkprops] = calprops(sid, graphs[sid].link, record, shape, colorMap);
    netv.addNodes(nodeprops);
    netv.addLinks(linkprops);
  }
  let link2stay = []
  stay.map((d, idx) => {
    if (d == 1) {
      for (let sid = 0; sid < leng - 1; sid++) {
        link2stay.push({
          source: sid + '-' + idx, 
          target: (sid + 1) + '-' + idx,
          style: {
            strokeWidth: 0.5  ,
            strokeColor: {r: 255, g: 0, b: 0, a: 0.5},
            shape: 'curve'
          } 
        });
      }
    }
  });
  netv.addLinks(link2stay);
}
