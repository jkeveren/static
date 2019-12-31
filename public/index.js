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
	height: '100vh'
});

const resolutionMultiplier = 0.5;
let pixelCount;
let imageData;
const handleResize = () => {
	c.canvas.width = innerWidth * devicePixelRatio * resolutionMultiplier;
	c.canvas.height = innerHeight * devicePixelRatio * resolutionMultiplier;
	pixelCount = c.canvas.width * c.canvas.height;
	imageData = new ImageData(new Uint8ClampedArray(pixelCount * 4), c.canvas.width);
};
handleResize();
addEventListener('resize', handleResize);

let frames = 0;
setInterval(() => {
	console.clear();
	console.log(`Framerate: ${frames}`);
	frames = 0;
}, 1000);

const render = async () => {
	let randomBits;
	let pixelDataStartIndex = 0;
	for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex++) {
		if (!(pixelIndex % 15)) {
			randomBits = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		}
		randomBits >>>= 2;
		const randomBrightness = (randomBits & 0b11) * 85;
		imageData.data[pixelDataStartIndex++] = randomBrightness; // way faster when not in for loop
		imageData.data[pixelDataStartIndex++] = randomBrightness;
		imageData.data[pixelDataStartIndex++] = randomBrightness;
		imageData.data[pixelDataStartIndex++] = 255;
	}
	const imageBitmap = await createImageBitmap(imageData, 0, 0, imageData.width, imageData.height);
	c.drawImage(imageBitmap, 0, 0);
	frames++;
	requestAnimationFrame(render);
}
requestAnimationFrame(render);

let fullscreen = false;
const toggleFullscreen = async event => {
	if (fullscreen = !fullscreen) {
		await c.canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
};

for (const [eventName, handler] of Object.entries({
	dblclick: toggleFullscreen,
	keydown(event) {if (event.key === 'f') toggleFullscreen()}
})) {
	addEventListener(eventName, handler, true);
}

let hideCursorTimeoutId = setTimeout(() => {}, 0);
const showCursor = () => {
	c.canvas.style.cursor = 'default';
	clearTimeout(hideCursorTimeoutId);
	hideCursorTimeoutId = setTimeout(() => {
		c.canvas.style.cursor = 'none';
	}, 2000);
};
showCursor();

addEventListener('mousemove', showCursor);

// fix blurryness?
