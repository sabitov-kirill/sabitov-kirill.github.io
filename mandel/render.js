/* Script data */
let
gl,
canvas,
squareVertexPositionBuffer,
shaderProgram,
fractalZoom,
iterationsCount,
mouseDragX,
mouseDragY,
isMouseDragging,
oldMouseX,
oldMouseY,
fractalInsColor,
fractalOutColor,
backColor,
fractalColorBlend;

function hexToRgb(hex) {
// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
hex = hex.replace(shorthandRegex, function (m, r, g, b) {
  return r + r + g + g + b + b;
});

var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
return result ? {
  r: parseInt(result[1], 16) / 255.0,
  g: parseInt(result[2], 16) / 255.0,
  b: parseInt(result[3], 16) / 255.0
} : null;
}

/***
* Creation functions.
***/

/* Shader creation function.
* Arguments:
*   - path to shader file:
*       shaderPath;
*   - shader file type ("vertex", "fragment"):
*       shaderType;
* Returns:
*   (Promise) shader creation promise.
*/
function createShader(shaderPath, shaderType) {
return new Promise(function (resolve, reject) {
  let shd;

  window.fetch(shaderPath)
    .then((response) => {
      return response.text();
    })
    .then((file_text) => {
      if (shaderType == "fragment") shd = gl.createShader(gl.FRAGMENT_SHADER);
      else if (shaderType == "vertex") shd = gl.createShader(gl.VERTEX_SHADER);
      else reject(shd);

      gl.shaderSource(shd, file_text);
      gl.compileShader(shd);

      if (!gl.getShaderParameter(shd, gl.COMPILE_STATUS)) {
        alert(`Shader creation error.\n\nPath: ${shaderPath}. Type: ${shaderType}\n\nLog:\n` + gl.getShaderInfoLog(shd));
        reject(shd);
      }

      resolve(shd);
    });
});
}

/* Shader programm creaion function.
* Arguments:
*   - array of shaders information (Path, Type):
*       shadersInfoArray;
* Returns:
*   (WebGLProgram) shader programm id.  
*/
function shaderProgramCreate(shadersInfoArray) {
return new Promise(function (resolve, reject) {
  let creation_requests = shadersInfoArray.map(shader_info => createShader(shader_info.Path, shader_info.Type));
  let shader_prg;

  Promise.all(creation_requests)
    .then(shaders => {
      shader_prg = gl.createProgram();
      for (let shader of shaders)
        gl.attachShader(shader_prg, shader);
      gl.linkProgram(shader_prg);

      if (!gl.getProgramParameter(shader_prg, gl.LINK_STATUS)) {
        let error_str = "Shader program creation error.\n\nShader list:\n";
        for (let shader_info of shadersInfoArray)
          error_str += `Path: ${shader_info.Path}. Type: ${shader_info.Type}`;
        alert(error_str);
        reject(shader_prg);
      }

      resolve(shader_prg);
    });
});
}

/* Setting location of all uniforms, verecies possition attribute.
* Arguments: None.
* Returns: None.
*/
function uniformsInit() {
  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.resolutionLocation = gl.getUniformLocation(shaderProgram, 'resolution');
  shaderProgram.zoomLocation = gl.getUniformLocation(shaderProgram, 'zoom');
  shaderProgram.offsetLocation = gl.getUniformLocation(shaderProgram, 'offset');
  shaderProgram.iterationLocation = gl.getUniformLocation(shaderProgram, 'iterations');
  shaderProgram.fractalInsColorLocation = gl.getUniformLocation(shaderProgram, 'ins_col');
  shaderProgram.fractalOutColorLocation = gl.getUniformLocation(shaderProgram, 'out_col');
  shaderProgram.backColorLocation = gl.getUniformLocation(shaderProgram, 'back_col');
  shaderProgram.fractalColorBlendLocation = gl.getUniformLocation(shaderProgram, 'col_blend');
}

/* Creating vertex buffer and setting rectangle to its data function.
* Arguments: None.
* Returns: None.
*/
function vertexBufferInit() {
  let vertices =
    [
      1.0, 1.0, 0.0,
      -1.0, 1.0, 0.0,
      1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0
    ];

  squareVertexPositionBuffer = gl.createBuffer();
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

/* WebGL initialisation function.
* Arguments:
*   - screen canvas to get context:
*       canvas;
* Returns: None.
*/
function webGLInit(canvas) {
  /* Creating OpengGL handler */
  try {
    gl = canvas.getContext("experimental-webgl");
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL");
  }
}

/* System initialisation function.
* Arguments: None.
* Returns: None.
*/
function webGLStart() {
  cameraSetDefualt();
  iterationsCount = 12 * 12;
  fractalInsColor = hexToRgb("361111");
  fractalOutColor = hexToRgb("4ecedf");
  backColor = hexToRgb("f7599e");
  fractalColorBlend = 6;

  canvas = document.getElementById("webgl-canvas");
  canvas.hidden = true;
  webGLInit(canvas);
  canvasResize();
  vertexBufferInit();
  shaderProgramCreate([{ Path: './shaders/vertex.glsl', Type: "vertex" }, { Path: './shaders/fragment.glsl', Type: "fragment" }])
    .then((shd_prg) => {
      canvas.hidden = false;
      shaderProgram = shd_prg;
      uniformsInit();

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      drawScene();
      tick();
    });
}

/***
* Each frame functions.
***/

/* Sending all uniforms to shader function.
* Arguments: None.
* Returns: None.
*/
function uniformsSend() {
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.uniform2f(shaderProgram.resolutionLocation, canvas.width, canvas.height);
  gl.uniform1f(shaderProgram.zoomLocation, fractalZoom);
  gl.uniform1i(shaderProgram.iterationLocation, iterationsCount);
  gl.uniform2f(shaderProgram.offsetLocation, mouseDragX, mouseDragY);
  gl.uniform3f(shaderProgram.fractalInsColorLocation, fractalInsColor.r, fractalInsColor.g, fractalInsColor.b);
  gl.uniform3f(shaderProgram.fractalOutColorLocation, fractalOutColor.r, fractalOutColor.g, fractalOutColor.b);
  gl.uniform3f(shaderProgram.backColorLocation, backColor.r, backColor.g, backColor.b);
  gl.uniform1f(shaderProgram.fractalColorBlendLocation, fractalColorBlend);
}

/* Drawing scene function.
* Arguments: None.
* Returns: None.
*/
function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  uniformsSend();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

/* Drawing scene call function.
* Arguments: None.
* Returns: None.
*/
function tick() {
  window.requestAnimationFrame(tick);
  drawScene();
}