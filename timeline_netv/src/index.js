import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './mydiv.css'
import reportWebVitals from './reportWebVitals';
import datum50_5 from './data/matrixs50_5.json'
import datum15_5 from './data/matrixs15_5.json'
import * as d3 from 'd3'; 
import NetV, { height, link, node, nodeLimit, width } from "netv";
import { JuxtMatrix } from './JuxtMatrix';
import { Bipartite } from './Bipartite'
import { NodeLink } from './NodeLink';
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";


const GraphRender = (props) => {
  const graphs = props.datum.matrix;
  const num = graphs[0].nodes;
  const leng = graphs.length;
  const netvdivRef = useRef();
  const graphRef = useRef();
  const whichdiv = useCallback(() => {
    if (props.graphLayout == 'juxtMatrix') 
      return false;
    return true;
  }, [props.graphLayout])
  useEffect(
    () => {
      console.log(graphRef.current)
      if (!whichdiv())
        return;
      let div = netvdivRef.current;
      while (div.hasChildNodes())
        div.removeChild(div.firstChild);
      if (props.graphLayout == 'juxtMatrix')
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
      if (props.graphLayout === 'nodelink')
        NodeLink(netv, graphs, num, leng);
      else if (props.graphLayout === 'bipartite')
        Bipartite(netv, graphs, num, leng);
        
     
      netv.on('zoom', () => { });
      netv.on('pan', () => { });
      netv.draw();
      return () => {
        div.removeChild(div.firstChild)
      }
    }, [props.graphLayout]
  )

  return (
    <div id='render' ref={graphRef}>
      {whichdiv() ? 
        <div id='netvdiv' ref={netvdivRef} >
        </div> 
      :
        <div id='otherdiv' height={'100%'} width={'100%'} >
          {props.graphLayout === 'juxtMatrix' && <JuxtMatrix num={num} leng={leng} graphs={graphs} />}
        </div>}
    </div>
    
  );
}



const Graph = () => {
  // nodelink / matrix / bipartite / juxtMatrix
  const graphlayoutList = ['nodelink', 'matrix', 'bipartite', 'juxtMatrix']
  const codeRef = useRef(null);
  const [graphLayout, setGraphLayout] = useState('juxtMatrix');
  

  const code = '{"graphlayout": "juxtMatrix", "timelayout": "timeline"}';
  return (
    <div id='maindiv'>
      <div id='opdiv' className='box'>
        <CodeMirror
          width={'400px'}
          height={'450px'}
          extensions={[json()]}
          value={code}
          onChange={(value) => {
            let config;
            try {
              config = JSON.parse(value);
              if(typeof config == 'object' && config) {
                if (graphlayoutList.includes(config.graphlayout)) {
                  console.log('in')
                  setGraphLayout(config.graphlayout);
                }
              }
            } catch(e) {
              alert('not valid input');
              return false;
            }
          }}
        />
      </div>
      <div id='renderdiv' className='box'>
        <GraphRender graphLayout={graphLayout} datum={datum15_5} />
      </div>
    </div>
  )
}

ReactDOM.render(
  <Graph/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
