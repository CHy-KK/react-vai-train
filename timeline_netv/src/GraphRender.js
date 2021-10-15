import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3'; 
import NetV, { height, link, node, nodeLimit, width } from "netv";
import { JuxtMatrix } from './graphs/JuxtMatrix';
import { Matrix } from './graphs/Matrix';
import { Matrix_dynamic } from './graphs/Matrix_dynamic';
import { Bipartite } from './graphs/Bipartite'
import { NodeLink } from './graphs/NodeLink';
import { NodeLink_dynamic } from './graphs/NodeLink_dynamic';


export const GraphRender = (props) => {
  const netvGraphList = ['nodelink', 'bipartite']
  const config = props.config;
  const graphs = props.datum.matrix;
  const num = graphs[0].nodes;
  const leng = graphs.length;
  const netvdivRef = useRef();
  const graphRef = useRef();
  // let sid = 0;
  const [sid, setSid] = useState(0);
  let sidsyn = 0;

  useEffect(
    () => {
      console.log(config);
      if (config.timeLayout === 'timeline') {
        if (!netvGraphList.includes(config.graphLayout))
          return;
        let div = netvdivRef.current;
        while (div.hasChildNodes())
          div.removeChild(div.firstChild);
        if (config.graphLayout === 'juxtMatrix')
          return;
        let childdiv = document.createElement('div');
        div.appendChild(childdiv);
        
        let netv = new NetV({ 
          container: childdiv,
          nodeLimit: 1000,
          linkLimit: 3000,
          width: 700,
          height: 450,
        });
        if (config.graphLayout === 'nodelink')
          NodeLink(netv, graphs, num, leng);
        else if (config.graphLayout === 'bipartite')
          Bipartite(netv, graphs, num, leng);
          
      
        netv.on('zoom', () => { });
        netv.on('pan', () => { });
        netv.draw();
        return () => {
          div.removeChild(div.firstChild)
        }
      }
      else {
        let nodeprops;
        let lastrecord = new Array(num);
        let record = new Array(num).fill(0);  // -1: disappear, 1: current, 2: appear
        let div, netv, childdiv;
        if (netvGraphList.includes(config.graphLayout)) {
          div = netvdivRef.current;
          while (div.hasChildNodes())
            div.removeChild(div.firstChild);
          childdiv = document.createElement('div');
          div.appendChild(childdiv);
          
          netv = new NetV({ 
            container: childdiv,
            nodeLimit: 1000,
            linkLimit: 3000,
            width: 700,
            height: 450,
          });
        }
          // netv.on('zoom', () => { });
          // netv.on('pan', () => { });

        // 设置定时器
        let intervalId = setInterval( 
          () => {
            // 记录动态变化的node增减情况
            sidsyn = (sidsyn + 1) % leng;
            setSid(sidsyn);
            for (let i = 0; i < num; i++) 
              lastrecord[i] = record[i];
            record.fill(0);
            graphs[sidsyn].link.map(d => {
              record[d.target] = 1;
              record[d.source] = 1;
            })
            for (let i = 0; i < num; i++) {
              if (lastrecord[i] > 0 && record[i] === 0)
                record[i] = -1;
              else if (lastrecord[i] <= 0 && record[i] === 1)
                record[i] = 2;
            }
            // 绘制graph
            if (netvGraphList.includes(config.graphLayout)) {
              if (config.graphLayout === 'nodelink'){
                nodeprops = NodeLink_dynamic(record);
                netv.wipe();
                netv.addNodes(nodeprops);
                netv.addLinks(graphs[sidsyn].link)
                netv.draw();
              }
            }
          }, 
          1000
        );
        return () => {
          if (netvGraphList.includes(config.graphLayout))
            div.removeChild(div.firstChild)
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }, [config]
  )

  return (
    <div id='render' ref={graphRef}>
      {netvGraphList.includes(config.graphLayout) ? 
        <div id='netvdiv' ref={netvdivRef} >
        </div> 
      :
        <div id='otherdiv' height={'100%'} width={'100%'} >
          {config.graphLayout === 'juxtMatrix' && config.timeLayout === 'timeline' 
            && <JuxtMatrix num={num} leng={leng} graphs={graphs} />}
          {(config.graphLayout === 'matrix' || config.graphLayout === 'uptriMatrix' || config.graphLayout === 'downtriMatrix')
            && config.timeLayout === 'timeline'
            && <Matrix num={num} leng={leng} graphs={graphs} type={config.graphLayout} direct={config.direct}/>}
          {(config.graphLayout === 'matrix' || config.graphLayout === 'uptriMatrix' || config.graphLayout === 'downtriMatrix') 
            && config.timeLayout === 'dynamic' 
            && <Matrix_dynamic num={num} links={graphs[sid].link} type={config.graphLayout} direct={config.direct}/>}
        </div>}
    </div>
    
  );
}
