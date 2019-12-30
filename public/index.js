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
	cursor: 'none'
});

let imageData;
const resolutionMultiplier = 0.5;
const resize = () => {
	c.canvas.width = innerWidth * devicePixelRatio * resolutionMultiplier;
	c.canvas.height = innerHeight * devicePixelRatio * resolutionMultiplier;
	imageData = new ImageData(new Uint8ClampedArray(c.canvas.width * c.canvas.height * 4), c.canvas.width);
};
resize();
addEventListener('resize', resize);

let frames = 0;
setInterval(() => {
	console.clear();
	console.log(`Framerate: ${frames}`);
	frames = 0;
}, 1000);

const render = async () => {
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
	frames++;
	requestAnimationFrame(render);
}
requestAnimationFrame(render);