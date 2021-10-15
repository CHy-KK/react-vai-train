import * as d3 from 'd3'; 
export const NodeLink_dynamic = (record) => {
  const colorMap = {
    '-1': { r: 0, g: 250, b: 154, a: 0.9 },
    '1': { r: 255, g: 0, b: 0, a: 0.9 },
    '2': { r: 255, g: 69, b: 0, a: 0.9 }
  };
  const shape = {width: 400, height: 400};
  let nodes = [];
  let nodeprops = [];
  record.map((d, idx) => {
    if (d !== 0)
      nodes.push({'index': idx});
  })
  let nodepos = JSON.parse(JSON.stringify(nodes));
  d3.forceSimulation(nodepos)
    .force('charge', d3.forceManyBody().strength(-10))   
    .force('center', d3.forceCenter(shape.width / 2, shape.height / 2));
  nodepos.map((d, idx) => {

    let tmp = { 
      id: nodes[idx].index, 
      x: d.x + shape.width / 2, 
      y: d.y + shape.height / 2, 
      style: {
        fill: colorMap[`${record[nodes[idx].index]}`],
        r: 5
      },
    };
    nodeprops.push(tmp)
  });

  return nodeprops;
}
