/// <reference types="chroma-js"/>
import chroma from "chroma-js";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ANCHOR - Main event
document.addEventListener("DOMContentLoaded", async (event) => {
	document.body.style.backgroundColor = chroma.random().hex();
	console.log("gh");

	
}, { once: true });

ReactDOM.createRoot(
	document.getElementById('app')
).render(<App />);