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
let imageDataData;
let imageDataDataLength;

// Canvas resizing

const handleResize = () => {
	c.canvas.width = innerWidth * devicePixelRatio * resolutionMultiplier;
	c.canvas.height = innerHeight * devicePixelRatio * resolutionMultiplier;
	pixelCount = c.canvas.width * c.canvas.height;
	imageData = new ImageData(new Uint8ClampedArray(pixelCount * 4), c.canvas.width);
	imageDataData = imageData.data;
	imageDataDataLength = imageDataData.length;
	// set alpha bytes to max
	for (let i = 3; i < imageDataDataLength; i += 4) {
		imageDataData[i] = 255;
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

const getRandomValuesMaximum = 65536; // maximum number of values `crypto.getRandomValues()` can create
let lastFrameRenderStartTime = performance.now();

const render = async () => {
	const renderStartTime = performance.now(); // low resolution in firefox
	let pixelDataStartIndex = -2;
	let intensityIndex = 0;
	const intensities = new Uint8ClampedArray(pixelCount);
	for (;intensityIndex < pixelCount; intensityIndex += getRandomValuesMaximum) {
		const intensitiesRemaining = pixelCount - intensityIndex;
		const intensitiesToGet = Math.min(getRandomValuesMaximum, intensitiesRemaining);
		intensities.set(crypto.getRandomValues(new Uint8ClampedArray(intensitiesToGet)), intensityIndex);
	}
	intensityIndex = 0;
	// TODO: maybve use a worker to do this:
	while (pixelDataStartIndex < imageDataDataLength) { // TODO test incrementing pixelDataStartIndex in here
		// KEEP THIS BLOCK EFFICIENT. It gets called ~120 million times per second for a 1920*1080 canvas at 60Hz
		let intensity = intensities[intensityIndex++];
		// duplicate code because iterating is too expensive
		imageDataData[pixelDataStartIndex += 2] = intensity; // += 2 to skip alpha byte of previous pixel
		imageDataData[++pixelDataStartIndex] = intensity;
		imageDataData[++pixelDataStartIndex] = intensity;
	}
	const imageBitmap = await createImageBitmap(imageData, 0, 0, imageData.width, imageData.height);
	c.drawImage(imageBitmap, 0, 0);
	if (displayInfo) {
		const renderTime = performance.now() - renderStartTime;
		infoElement.textContent =
			`Frame Rate: ${(1000 / (renderStartTime - lastFrameRenderStartTime)).toFixed(1)}Hz
			Render Time: ${(renderTime).toFixed(1)}ms
			Peak Pixel Rate: ${Math.round(((1000 / renderTime) * pixelCount) / 10 ** 6)}MHz`
		.replace(/ /g, '\u00a0'); // kinda flickery but nice and simple
		lastFrameRenderStartTime = renderStartTime;
	}
	// wait to avoid blocking
	setTimeout(render); // not using requestAminationFrame because it causes almost every other frame to skip when rendering to 1920*1080 canvas becuase of the long render time
}
render();

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
