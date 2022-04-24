import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Stats from 'stats-js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
	stats.begin();

	// Monitored code goes here

	stats.end();

	requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
