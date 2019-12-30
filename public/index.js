const c = document.documentElement.appendChild(document.createElement('canvas')).getContext('2d');
Object.assign(c.canvas.style, {
	position: 'fixed',
	top: 0,
	width: '100vw',
	height: '100vh',
});

const resize = () => {
	c.canvas.width = innerWidth * devicePixelRatio;
	c.canvas.height = innerHeight * devicePixelRatio;
};
resize();
addEventListener('resize', resize);

const render = () => {
	const t = Date.now();
	for (let x = 0; x < c.canvas.width; x++) {
		for (let y = 0; y < c.canvas.height; y++) {
			c.fillStyle = Math.round(Math.random()) ? '#fff' : '#000';
			c.fillRect(x, y, 1, 1);
		}
	}
// 	c.drawImage(
// 		,
// 		0,
// 		0
// 	);
	console.log(Date.now() - t);
	requestAnimationFrame(render);
}
requestAnimationFrame(render);
