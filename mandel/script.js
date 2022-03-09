/***
 * Events handle functions
 ***/

window.addEventListener('resize', canvasResize, false);

/* Setting viewer to default possition function.
* Arguments: None.
* Returns: None.
*/
function cameraSetDefualt() {
  mouseDragX = 0;
  mouseDragY = 0;
  fractalZoom = 1;
}

/* Canvas resize function.
*   - event handle:
*      e;
* Returns: None.
*/
function canvasResize(e) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
}

/* Mouse dragging function. 
*   - event handle:
*      e;
* Returns: None.
*/
function mouseDragging(e) {
  if (isMouseDragging) {
    mouseDragX += -0.003 * (e.clientX - oldMouseX) / fractalZoom;
    mouseDragY += 0.003 * (e.clientY - oldMouseY) / fractalZoom;
    oldMouseX = e.clientX; oldMouseY = e.clientY;
  }
}

function iterationsChange(value) {
  let iterations_changer = document.getElementById("iterations_changer");

  iterations_changer.value = value;
  if (iterations_changer.value > 0 && Number.isInteger(Number(iterations_changer.value))) {
    iterationsCount = iterations_changer.value;
    iterations_changer.classList.remove("wrong");
  } else {
    iterations_changer.classList.add("wrong");
  }
}

function zoomChange(e) {
  value = Math.max(fractalZoom * (e.deltaY > 0 ? 1.25 : 0.8), 0.1);
  let zoom_changer = document.getElementById("zoom_changer");

  zoom_changer.value = Number(value).toFixed(1);
  if (zoom_changer.value > 0.1) {
    fractalZoom = zoom_changer.value;
    zoom_changer.classList.remove("wrong");
  } else {
    zoom_changer.value = 0.1;
    zoom_changer.classList.add("wrong");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  webGLStart();

  const handleMove = (event) => mouseDragging(event);
  const handleMoveEnd = () => isMouseDragging = false;
  const handleMoveStart = (touch) => { 
    isMouseDragging = true;
    oldMouseX = touch.clientX;
    oldMouseY = touch.clientY;
  };

  let canvas = document.getElementById("webgl-canvas");
  canvas.addEventListener('resize', canvasResize);

  canvas.addEventListener('wheel', zoomChange);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mousedown', handleMoveStart);
  canvas.addEventListener('mouseup', handleMoveEnd);

  canvas.addEventListener('touchstart', (event) => handleMoveStart(event.touches[0]));
  canvas.addEventListener('touchmove', (event) => handleMove(event.touches[0]));
});