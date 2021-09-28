import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

class Test extends React.Component{
  //测试一下有没有bind的this有何区别
  handleClick_bind = () => {
    console.log(this);
  }
  handleClick() {
    console.log(this);
  }
  handleClick_mount() {
    console.log('挂载的handleclick中的this：\n-------------\n', this, '\n-------------');
    console.log('大概是因为在componentDidMount中调用，在该函数中this指代class');
    console.log('但是在render中的this是在dom中，所以指代window或直接undefined');
  }
  componentDidMount() {
    this.handleClick_mount();
  }
  render() {
    a = '100';
    b = '-2000';
    return (
      <div>
        <button onClick={this.handleClick_bind}> have bind </button>
        <button onClick={this.handleClick}> no bind </button>
        <br/>
        <img src='parameter.png'></img>
      </div>
      
    ) 
  }
}

ReactDOM.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <Test />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
