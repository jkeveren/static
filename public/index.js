const canvas = document.documentElement.appendChild(document.createElement('canvas'));
Object.assign(canvas.style, {
	position: 'fixed',
	top: 0,
	width: '100vw',
	height: '100vh',
});

const gl = canvas.getContext('webgl2');
gl.clearColor(0, 0, 0, 1);

const resize = () => {
	canvas.width = innerWidth * devicePixelRatio;
	canvas.height = innerHeight * devicePixelRatio;
	gl.viewport(0, 0, canvas.width, canvas.height);
};
resize();
addEventListener('resize', resize);

const shaders = [
	[
		gl.VERTEX_SHADER,
		`#version 300 es

			void main(void) {
				gl_PointSize = 1.0;
				gl_Position = vec4(0, 0, 0, 1.0);
			}
		`
	],
	[
		gl.FRAGMENT_SHADER,
		`#version 300 es
			precision mediump float;
			out vec4 finalColor;

			void main(void) {
				finalColor = vec4(1, 1, 1, 1);
			}
		`
	]
];

for (const [i, [shaderType, shaderSource]] of Object.entries(shaders)) {
	const shader = shaders[i] = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}
}

const program = gl.createProgram();
for (const shader of shaders) {
	gl.attachShader(program, shader);
}
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	throw new Error(gl.getProgramInfoLog(program));
}

gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
	throw new Error(gl.getPropreamInfoLog(program));
}

for (const shader of shaders) {
	gl.detachShader(program, shader);
	gl.deleteShader(shader);
}

const render = () => {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const verticesFloatArray = new Float32Array([]);
	const verticesBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesFloatArray, gl.STATIC_DRAW); ///////////// change gl.STATIC_DRAW
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.useProgram(program);

	gl.drawArrays(gl.POINTS, 0, 1);
	requestAnimationFrame(render);
}
requestAnimationFrame(render);