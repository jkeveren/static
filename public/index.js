/*

Renders approximated static to page
- Uses CanvasRenderingContext2D.drawImage() for speed.
- Uses only 2 bits of randomness for each pixel to reduce expensive calls to Math.random().
- Could be better by using webgl2 but I don't know enough about webgl to get it to render 2d things nicely.

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

const resolutionMultiplier = 0.5;
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

// Render time display
// - add "time" to querystring

const renderTimeElement = document.createElement('div');
if (location.search.includes('time')) {
	Object.assign(renderTimeElement.style, {
		position: 'fixed',
		color: '#fff',
		background: '#777',
		padding: '0 2px',
		width: 'min-content',
		fontFamily: 'monospace', // get that serif shit outta here
	});
	document.body.appendChild(renderTimeElement);
}

// Render loop

const randomBitsPerPixel = 2; // Must be one of [1, 2, 4, 8]. Number of random bits to use per pixel. Higher is higher quality but requires more random number generation. more than 8 is redundant as there are only 256 levels available
const randomBitsRegenerationIndex = (32 / randomBitsPerPixel) - 1;
const bitMask = (2 ** randomBitsPerPixel) - 1;
const brightnessMultiplier = 255 / bitMask;
const render = async () => {
	const renderStartTime = performance.now()
	let randomBits;
	let pixelDataStartIndex = -2;
// 	let pixelDataStartIndex = 0;
	let brightness;
	for (let pixelIndex = 0; pixelIndex < pixelCount;) {
		// KEEP THIS BLOCK EFFICIENT. It gets called 2 million times for a 1920*1080 canvas
		if (!(pixelIndex++ % randomBitsRegenerationIndex)) { // TODO pregenerate random bits so don't need if statement
			randomBits = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		}
		randomBits >>>= randomBitsPerPixel;
		brightness = (randomBits & bitMask) * brightnessMultiplier;

		// duplicate code because iterating is too expensive
		imageData.data[pixelDataStartIndex += 2] = brightness;
		imageData.data[++pixelDataStartIndex] = brightness;
		imageData.data[++pixelDataStartIndex] = brightness;
	}
	const imageBitmap = await createImageBitmap(imageData, 0, 0, imageData.width, imageData.height);
	c.drawImage(imageBitmap, 0, 0);
	renderTimeElement.textContent = `${(performance.now() - renderStartTime).toFixed(1)}ms`; // could use rolling average for readability but it's not worth the complexity
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
