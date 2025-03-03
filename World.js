// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  uniform float u_Size;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    //v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;

    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =
  `precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform vec4 u_lightColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_lightColorB;
  void main() {
    if (u_whichTexture == -7) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // use normal
    } else if (u_whichTexture == -6) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if (u_whichTexture == -5) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == -4) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == -3) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // use texture1 (u_Sampler1 AKA floor plane)
    } else if (u_whichTexture == -2) { // use color
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) { // use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0); 
    } else if (u_whichTexture == 0) { // use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else { // error, put redish
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // Red/Green Distance Visualization
    //if (r < 1.0) {
    //  gl_FragColor = vec4(1,0,0,1);
    //} else if (r < 2.0) {
    //  gl_FragColor = vec4(0,1,0,1);
    //}

    // Light Falloff Visualization 1/r^2
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0), 12.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    if (u_lightOn) {
      if (u_whichTexture == -2 || u_whichTexture == -5){
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
        if (u_lightColorB) {
          gl_FragColor *= u_lightColor;
        }
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
        if (u_lightColorB) {
          gl_FragColor *= u_lightColor;
        }
      }
    } else {
      gl_FragColor = gl_FragColor;        
    }

  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_lightColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
let u_lightOn;
let u_lightColorB;
let u_lightPos;
let u_cameraPos;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_lightColorB
  u_lightColorB = gl.getUniformLocation(gl.program, 'u_lightColorB');
  if (!u_lightColorB) {
    console.log('Failed to get the storage location of u_lightColorB');
    return;
  }

  // Get the storage location of u_lightColorB
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
  }

  // get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }
  
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedType = POINT;
let g_selectedSegments = 10.0;
let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_FrontLeftLegAngle = 0;
let g_frontLeftLegAnimation = false;
let g_FrontLeftLegPawAngle = 0;
let g_frontLeftLegPawAnimation = false;
let g_normalOn = false;
let g_lightPos = [0, 2.5, -2];
let g_lightOn = true;
let g_lightColorOn = false;
let g_lightR;
let g_lightG;
let g_lightB;

let g_moveLightB = false;
let g_moveLightX = false;
let g_moveLightY = false;
let g_moveLightZ = false;

let g_camera;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Awesomeness: draw a pattern button event
  /*document.getElementById('patternSizeSlide').addEventListener('mouseup', function() { patSize = this.value; });
  document.getElementById('patternNumSlide').addEventListener('mouseup', function() { numInc = parseFloat(this.value); });
  document.getElementById('patternButton').onclick = function() { drawAPattern(); };*/

  // Button events (shape type)
  /*document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0] };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0] };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  document.getElementById("pointButton").onclick = function() { g_selectedType = POINT; };
  document.getElementById("triButton").onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById("circleButton").onclick = function() { g_selectedType = CIRCLE; };

  // Slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });*/

  document.getElementById('normalOn').onclick = function() {g_normalOn=true; };
  document.getElementById('normalOff').onclick = function() {g_normalOn=false; };

  document.getElementById('lightOn').onclick = function() {g_lightOn=true; };
  document.getElementById('lightOff').onclick = function() {g_lightOn=false; };

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderScene(); } });
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderScene(); } });
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderScene(); } });

  document.getElementById('moveLightOn').onclick = function() { g_moveLightB = true; };
  document.getElementById('moveLightOff').onclick = function() { g_moveLightB = false; };

  document.getElementById('lightColorOn').onclick = function() {g_lightColorOn=true; };
  document.getElementById('lightColorOff').onclick = function() {g_lightColorOn=false; };

  document.getElementById('lightColorSlideR').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightR = this.value; renderScene(); } });
  document.getElementById('lightColorSlideG').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightG = this.value; renderScene(); } });
  document.getElementById('lightColorSlideB').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightB = this.value; renderScene(); } });


  document.getElementById('frontLeftLegSlide').addEventListener('mousemove', function() { g_FrontLeftLegAngle = this.value; renderScene(); });
  document.getElementById('animationFrontLeftLegOnButton').onclick = function() {g_frontLeftLegAnimation = true; };
  document.getElementById('animationFrontLeftLegOffButton').onclick = function() {g_frontLeftLegAnimation = false; };

  document.getElementById('frontLeftLegPawSlide').addEventListener('mousemove', function() { g_FrontLeftLegPawAngle = this.value; renderScene(); });
  document.getElementById('animationFrontLeftLegPawOnButton').onclick = function() {g_frontLeftLegPawAnimation = true; };
  document.getElementById('animationFrontLeftLegPawOffButton').onclick = function() {g_frontLeftLegPawAnimation = false; };

  // Size slider events
  //document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  document.getElementById('angleSlideX').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene(); });

  document.getElementById('angleSlideY').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderScene(); });

  // Circle Segment slider events
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function initTextures() {

  // create the image object
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  // register the event handler to be called on loading an image
  image.onload = function() { sendImageToTEXTURE0(image); };
  // tell the browser to load image
  image.src = 'nightsky.jpg';


  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  
  image2.onload = function() { sendImageToTEXTURE1(image2); };
  image2.src = 'grass.jpg';



  var image3 = new Image();
  if (!image3) {
    console.log('Failed to create the image3 object');
    return false;
  }

  image3.onload = function() { sendImageToTEXTURE2(image3); };
  image3.src = 'wood.jpg';


  var image4 = new Image();
  if (!image4) {
    console.log('Failed to create the image4 object');
    return false;
  }

  image4.onload = function() { sendImageToTEXTURE3(image4); };
  image4.src = 'stonebrick.jpg';



  var image5 = new Image();
  if (!image5) {
    console.log('Failed to create the image5 object');
    return false;
  }

  image5.onload = function() { sendImageToTEXTURE4(image5); };
  image5.src = 'mcfire.jpg';
  

  return true;
}

function sendImageToTEXTURE0(image) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log('finished loadTexture');

}

function sendImageToTEXTURE1(image) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE1);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log('finished loadTexture');

}

function sendImageToTEXTURE2(image) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE2);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log('finished loadTexture');

}

function sendImageToTEXTURE3(image) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE3);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler3, 3);

  console.log('finished loadTexture');

}

function sendImageToTEXTURE4(image) {
  // create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  // flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // enable texture unit0
  gl.activeTexture(gl.TEXTURE4);

  // bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


  // set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler4, 4);

  console.log('finished loadTexture');

}

function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();


  document.onkeydown = keydown;

  // Register function (event handler) to be called on a mouse press
  /*canvas.onmousedown = click;

  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };*/

  initTextures();

  g_camera = new Camera();


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //renderScene();

  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);


}

function updateAnimationAngles() {
  if (g_frontLeftLegAnimation) {
    g_FrontLeftLegAngle = (45 * Math.sin(g_seconds));
  }

  if (g_frontLeftLegPawAnimation) {
    g_FrontLeftLegPawAngle = (45 * Math.sin(3 * g_seconds));
  }


  if (g_moveLightB) {
    g_lightPos[0] = 10*Math.sin(g_seconds);
    g_lightPos[2] = 10*Math.cos(g_seconds);
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

/*var g_eye = [0,0.3,-2];
var g_at = [0,0,0];
var g_up = [0,1,0];*/
//var g_camera = new Camera();

function keydown(ev) {
  if (ev.keyCode == 87){ // letter w (forward)
    // forward
    g_camera.moveForward();
    
  } else if (ev.keyCode == 83) { // letter s (backwards)
    // backwards
    g_camera.moveBackwards();
  } else if (ev.keyCode == 68) { // letter d (right)
    // right
    //g_eye[0] -= 0.2;
    g_camera.moveRight();
   //g_camera.eye.elements[0] -= 0.2;
  } else if (ev.keyCode == 65) { // letter a (left)
    // left
    // swap from sub to addition on both left and right if not working as intended
    //g_eye[0] += 0.2;
    g_camera.moveLeft();
    //g_camera.eye.elements[0] += 0.2;
  } else if (ev.keyCode == 81) { // letter q (panLeft)
    // pan left
    g_camera.panLeft();
  } else if (ev.keyCode == 69) { // letter e (panRight)
    // pan right
    g_camera.panRight();
  }

  renderScene();
  console.log(ev.keyCode);
  //console.log('test: ' + g_camera.eye.elements[0]);
}
// g_map: FRONT == top side of array, positive number = number of cubes up, negative number = place one cube that number of cubes high
var g_map = [
  // ----------------- FRONT OF THE SCENE (ACCORDING TO CAMERA LOCATION) ------------------------
  [ 3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  -4,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  4,  4,  4,  4,  4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  4, -5, -5, -5,  4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  4, -5, -6, -5, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  4, -5, -6, -5,  4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  4, -5, -5, -5,  4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  4,  4,  4,  4,  4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1, -2,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0, -10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0, -10,-10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0, -10, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0, -10,-10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0, -10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   3],
  [ 3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,   2],
  [ 2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,  3,  2,   3]
  // ---------------- BACK OF THE SCENE (ACCORDING TO CAMERA LOCATION) ------------------------
];

// g_mapTexture - each index corresponds to a specific cube's textureNum
var g_mapTexture = [
  // ----------------- FRONT OF THE SCENE (ACCORDING TO CAMERA LOCATION) ------------------------
  [-5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -4, -4, -4, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0, -4, -4, -4, -4, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0, -4, -4, -4, -4, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0, -4, -4, -4, -4, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0, -4, -4, -4, -4, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0, -4, -4, -4, -4, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0, -4, -4, -4, -4, -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -4, -6,  -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0, -2,  -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0, -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0, -2,  -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  -5],
  [-5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5, -5]
  // ---------------- BACK OF THE SCENE (ACCORDING TO CAMERA LOCATION) ------------------------
];

function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      if (g_map[x][y] >= 1) { // if the height of the wall is at least 1 cube tall, if 0: don't place a cube
        var body = new Cube();
        body.color = [1.0, 1.0, 0.0, 1.0];
        body.textureNum = g_mapTexture[x][y];
        body.matrix.translate(y-16, -0.65, x-16);
        body.renderfast();
        if (g_map[x][y] > 1) { // if the height of the wall is more than 1 cube tall
          for (height = 2; height <= g_map[x][y]; height++) {
            var body2 = new Cube();
            body2.color = [1.0, 1.0, 0.0, 1.0];
            body2.textureNum = g_mapTexture[x][y];
            body2.matrix.translate(y-16, -0.65 + (height - 1), x-16);
            body2.renderfast();
          }
        }
      } else if (g_map[x][y] < -1 && g_map[x][y] > -32) { // if the number in g_map is negative and within the bounds, place one cube that number of cubes high
        var body = new Cube();
        body.color = [1.0, 1.0, 0.0, 1.0];
        body.textureNum = g_mapTexture[x][y];
        body.matrix.translate(y-16, -0.65 + ((g_map[x][y] * -1) - 1), x-16);
        body.renderfast();
      }
    }
  }
}


/*var g_map = [
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1]
];


function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      if (g_map[x][y] >= 1) {
        var body = new Cube();
        body.color = [1.0, 1.0, 0.0, 1.0];
        body.matrix.translate(y-16, -0.5, x-16);
        body.renderfast();
        for (height = 2; height <= g_map[x][y]; height++) {
          var body2 = new Cube();
          body2.color = [1.0, 1.0, 0.0, 1.0];
          body2.matrix.translate(y-16, (height - 1) + 0.5, x-16);
          body2.renderfast();
        }
      }
    }
  }
}*/


/*
function drawMap() {
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      if (g_map[x][y] == 1) {
        var body = new Cube();
        body.color = [1.0, 1.0, 0.0, 1.0];
        body.matrix.translate(y-16, -0.5, x-16);
        body.renderfast();

        var body2 = new Cube();
        body2.color = [1.0, 1.0, 0.0, 1.0];
        body2.matrix.translate(y-16, 1.5, x-16);
        body2.renderfast();
      }
    }
  }
}
*/


function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2],   g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2],   g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  //globalRotMat.rotate(g_globalAngle, g_globalAngleY, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  var normMat = new Matrix4();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);


  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  // Pass the light color status
  gl.uniform1i(u_lightColorB, g_lightColorOn);

  // Pass the light color values
  gl.uniform4f(u_lightColor, g_lightR, g_lightG, g_lightB, 1.0);

  // Draw the light
  var light = new Cube();
  light.color = [2,2,0,1]; // 2 should counter the adjustments to the color in Cube.js
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1,-0.1,-0.1);
  light.matrix.translate(-0.5,-0.5,-0.5);
  light.renderfast();

  // Draw the floor
  var body = new Cube();
  body.color = [0.9, 0.9, 1.0, 1.0];
  body.textureNum = -3;
  body.matrix.translate(-0.1, -1.0, 0.50); // y value was -0.7
  body.matrix.scale(45, 0, 45);
  body.matrix.translate(-0.5, 0, -0.5);
  body.renderfast();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.55, 0.95, 1.0, 1.0];
  sky.textureNum = 0;
  if (g_normalOn) sky.textureNum = -7;
  sky.matrix.scale(-40, -40, -40);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.renderfast();

  drawMap();

  // draw sphere test
  var testSphere = new Sphere();
  testSphere.color = [1, 1, 1, 1];
  testSphere.textureNum = -2;
  if (g_normalOn) testSphere.textureNum = -7;
  testSphere.matrix.translate(1,1,1);
  testSphere.render();




  // Draw the animal
  var matr = new Matrix4();

    // Draw a test triangle
    //drawTriangle3D( [-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

    // Draw the body cube
    /*var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.matrix.setTranslate(-0.25, -0.75, 0.0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.renderfast();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.setTranslate(0, -0.5, 0.0);
    leftArm.matrix.rotate(-5, 1.0, 0.0, 0.0);
    leftArm.matrix.rotate(-g_yellowAngle, 0,0,1);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.matrix.translate(-0.5,0,0);
    leftArm.renderfast();

    // test box
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix.setTranslate(-0.1,0.1,0.0);
    box.matrix.rotate(-30,1,0,0);
    box.matrix.scale(0.2,0.4,0.2);
    box.renderfast();*/

    // Draw torso
    matr.setIdentity();
    matr.translate(-0.2, -0.2, -0.2);
    matr.scale(0.25, 0.35, 0.9);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);



    // Draw head

    matr.setIdentity();
    matr.translate(-0.25, 0, -0.55);
    matr.scale(0.35, 0.3, 0.35);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw mouth

    matr.setIdentity();
    matr.translate(-0.2, 0, -0.65);
    matr.scale(0.25, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);

    // Draw left ear

    matr.setIdentity();
    matr.translate(-0.23, 0.3, -0.35);
    matr.scale(0.08, 0.08, 0.15);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw right ear

    matr.setIdentity();
    matr.translate(-0.02, 0.3, -0.35);
    matr.scale(0.08, 0.08, 0.15);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);


    // Draw tail section 1

    matr.setIdentity();
    matr.translate(-0.1, 0.118, 0.65)
    matr.rotate(45, 1, 0, 0);
    matr.scale(0.05, 0.05, 0.4);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw tail section 2

    matr.setIdentity();
    matr.translate(-0.1, -0.16, 0.95)
    //matr.rotate(45, 1, 0, 0);
    matr.scale(0.05, 0.05, 0.4);

    drawCube(matr, [0.2, 0.2, 0.2, 1]);



    // Draw front left leg
    matr.setIdentity();

    matr.rotate(g_FrontLeftLegAngle, 1, 0, 0);
    var leftLegCoordsMat = new Matrix4(matr);

    matr.translate(0, -0.435, -0.12);
    matr.scale(0.1, 0.6, 0.1);
    //matr.normalMatrix.setInverseOf(matr.matrix).transpose();
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw front left leg paw
    matr = leftLegCoordsMat;
    matr.rotate(g_FrontLeftLegPawAngle, 1, 0, 0);
    matr.translate(0, -0.19, 0.15);
    matr.rotate(30, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



    // Draw front right leg
    matr.setIdentity();
    matr.translate(-0.25, -0.435, -0.12);
    matr.scale(0.1, 0.6, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw front right leg paw
    matr.setIdentity();
    matr.translate(-0.25, -0.19, 0.15);
    matr.rotate(30, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



    // Draw back left leg
    matr.setIdentity();
    matr.translate(0, -0.335, 0.52);
    matr.scale(0.1, 0.25, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw back left lower leg 
    matr.setIdentity();
    matr.translate(0.007, 0.02, 0.06);
    matr.rotate(15, 1, 0, 0);
    matr.translate(-0.012, -0.45, 0.52);
    matr.scale(0.11, 0.35, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);

    // Draw back left leg paw
    matr.setIdentity();
    matr.translate(0, -0.53, 0.85);
    matr.rotate(80, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



    // Draw back right leg
    matr.setIdentity();
    matr.translate(-0.25, -0.335, 0.52);
    matr.scale(0.1, 0.25, 0.1);
    
    drawCube(matr, [0.2, 0.2, 0.2, 1]);

    // Draw back right lower leg 
    matr.setIdentity();
    matr.translate(-0.243, 0.02, 0.06);
    matr.rotate(15, 1, 0, 0);
    matr.translate(-0.012, -0.45, 0.52);
    matr.scale(0.11, 0.35, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);

    // Draw back right leg paw
    matr.setIdentity();
    matr.translate(-0.25, -0.53, 0.85);
    matr.rotate(80, 1, 0, 0);
    matr.translate(-0.012, -0.45, -0.12);
    matr.scale(0.12, 0.15, 0.1);

    drawCube(matr, [0.9, 0.9, 0.9, 1]);



  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawCube(matrix, color) {
  var newCube = new Cube();
  newCube.color = color;
  newCube.textureNum = -2;
  if (g_normalOn) newCube.textureNum = -7;
  newCube.matrix = matrix;
  newCube.normalMatrix.setInverseOf(newCube.matrix).transpose();
  newCube.renderfast(); // MIGHT NEED TO CHECK LATER
}

var g_shapesList = [];

/*var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];*/

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);
  //console.log('x: ' + x, ' y: ' + y);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderScene();
  
}

function drawRectangleWithTriangles(widthStart, widthEnd, heightStart, heightEnd) {
  drawTriangle([widthStart, heightStart, widthEnd, heightEnd, widthEnd, heightStart]);
  drawTriangle([widthStart, heightStart, widthStart, heightEnd, widthEnd, heightEnd]);
}
