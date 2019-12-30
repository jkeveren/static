const c = document.documentElement
	.appendChild(document.createElement('canvas'))
	.getContext('2d', {
		alpha: false,
		desynchronized: true,
	})
;
Object.assign(c.canvas.style, {
	position: 'fixed',
	top: 0,
	width: '100vw',
	height: '100vh',
});

let imageData;

const resize = () => {
	c.canvas.width = innerWidth * devicePixelRatio;
	c.canvas.height = innerHeight * devicePixelRatio;
	imageData = new ImageData(new Uint8ClampedArray(c.canvas.width * c.canvas.height * 4), c.canvas.width);
};
resize();
addEventListener('resize', resize);


const render = async () => {
	const t = Date.now();
	let randomBits;
	for (let i = 0; i < imageData.data.length; i += 4) {
		if (!(i % 16)) {
			randomBits = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		}
		randomBits >>>= 2;
		const randomBrightness = randomBits & 0b11 * 85;
		imageData.data[i] = randomBrightness;
		imageData.data[i + 1] = randomBrightness;
		imageData.data[i + 2] = randomBrightness;
		imageData.data[i + 3] = 255;
	}
	const imageBitmap = await createImageBitmap(imageData, 0, 0, imageData.width, imageData.height);
	c.drawImage(imageBitmap, 0, 0);
	console.log(Date.now() - t);
	requestAnimationFrame(render);
}
requestAnimationFrame(render);