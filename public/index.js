/*

Renders approximated static to page
- Uses CanvasRenderingContext2D.drawImage() for speed.
- Could be better by using webgl2 but I don't know enough about webgl to get it to render 2d things nicely yet.

*/

// Canvas preparation

const c = document.body
	.appendChild(document.createElement('canvas'))
	.getContext('2d', {
		alpha: false,
		desynchronized: true,
	})
;

Object.assign(c.canvas.style, {
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100vw',
	height: '100vh'
});

const resolutionMultiplier = 0.5; // to create bluryness
let pixelCount;
let imageData;

// Canvas resizing

const handleResize = () => {
	c.canvas.width = innerWidth * devicePixelRatio * resolutionMultiplier;
	c.canvas.height = innerHeight * devicePixelRatio * resolutionMultiplier;
	pixelCount = c.canvas.width * c.canvas.height;
	imageData = new ImageData(new Uint8ClampedArray(pixelCount * 4), c.canvas.width);
	// set alpha bytes to max
	for (let i = 3; i < imageData.data.length; i += 4) {
		imageData.data[i] = 255;
	}
};
handleResize();
addEventListener('resize', handleResize);

// Info element
// - add "info" to querystring

const infoElement = document.createElement('div');
const displayInfo = location.search.includes('info');
if (displayInfo) {
	Object.assign(infoElement.style, {
		position: 'fixed',
		color: '#fff',
		background: '#777',
		padding: '0 2px',
		width: 'min-content',
		fontFamily: 'monospace', // get that serif shit outta here
	});
	document.body.appendChild(infoElement);
} else {
	console.info(`Pro tip: go to ${location.origin}/?info to display nerdy stuff.`);
}

// Render loop

const randomByteCount = 65536; // maximum number of values `crypto.getRandomValues()` can create
const randomBytes = new Uint8ClampedArray(randomByteCount);
let lastFrameRenderStartTime = performance.now();
const render = async () => {
	const renderStartTime = performance.now(); // low resolution in firefox
	let pixelDataStartIndex = -2;
	let randomByteIndex = randomByteCount;
	const data = imageData.data;
	const dataLength = data.length;
	while (pixelDataStartIndex < dataLength) {
		// KEEP THIS BLOCK EFFICIENT. It gets called ~120 million times per second for a 1920*1080 canvas at 60Hz
		// generate new randomBytes once all have been used
		if (randomByteIndex++ === randomByteCount) {
			randomByteIndex = 0;
			crypto.getRandomValues(randomBytes);
		}
		let intensity = randomBytes[randomByteIndex];
		// duplicate code because iterating is too expensive
		data[pixelDataStartIndex += 2] = intensity; // += 2 to skip alpha byte of previous pixel
		data[++pixelDataStartIndex] = intensity;
		data[++pixelDataStartIndex] = intensity;
	}
	const imageBitmap = await createImageBitmap(imageData, 0, 0, imageData.width, imageData.height);
	c.drawImage(imageBitmap, 0, 0);
	if (displayInfo) {
		const renderTime = performance.now() - renderStartTime;
		infoElement.textContent =
			`Frame Rate: ${Math.round(1000 / (renderStartTime - lastFrameRenderStartTime))}Hz
			Render Time: ${(renderTime).toFixed(1)}ms
			Peak Pixel Rate: ${Math.round(((1000 / renderTime) * pixelCount) / 10 ** 6)}MHz
			`
		.replace(/ /g, '\u00a0'); // kinda flickery but nice and simple
		lastFrameRenderStartTime = renderStartTime;
	}
	requestAnimationFrame(render);
}
requestAnimationFrame(render);

// Fullscreen controls

const toggleFullscreen = async event => {
	if (innerHeight === screen.height && innerWidth === screen.width) {
		document.exitFullscreen();
	} else {
		await document.documentElement.requestFullscreen(); // documentElement to keep render time counter element visible.
	}
};

for (const [eventName, handler] of Object.entries({
	dblclick: toggleFullscreen,
	keydown(event) {if(event.key === 'f') toggleFullscreen()},
})) {
	addEventListener(eventName, handler, true);
}

// Cursor hiding

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
