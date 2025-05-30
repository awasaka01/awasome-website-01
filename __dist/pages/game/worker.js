onmessage = (time) => {
	setTimeout(() => { return postMessage(Date.now()); }, time.data);
};
