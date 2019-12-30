const c = document.documentElement
	.appendChild(document.createElement('canvas'))
	.getContext('2d')
;
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

const render = async () => {
	const t = Date.now();
	const imageData = new ImageData(new Uint8ClampedArray(c.canvas.width * c.canvas.height * 4), c.canvas.width);
	for (let i = 0; i < imageData.data.length; i += 4) {
		const random = Math.random() * 255;
		imageData.data[i] = random;
		imageData.data[i + 1] = random;
		imageData.data[i + 2] = random;
		imageData.data[i + 3] = 255;
	}
	const imageBitmap = await createImageBitmap(imageData, 0, 0, imageData.width, imageData.height);
	c.drawImage(imageBitmap, 0, 0);
	console.log(Date.now() - t);
	requestAnimationFrame(render);
}
requestAnimationFrame(render);
