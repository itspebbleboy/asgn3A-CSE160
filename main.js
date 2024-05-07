// vertex shader source codes
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec4 a_Color;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Color = a_Color;
  }`;

// fragment shader source code
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_WhichTexture;
  void main() {
    gl_FragColor = u_FragColor;
    if (u_WhichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_WhichTexture == -1) {
      gl_FragColor = u_FragColor;
    } else if (u_WhichTexture == 0) {
      //gl_FragColor = v_Color;
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else{
      gl_FragColor = vec4(1,0,0,1); //error, redish
    }
  }`;

// global vars for WebGL context & shader program attributes/uniforms
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let g_rotateMatrix = 25;
let g_time;

let num_texts = 2;
let u_Samplers = [];
let gl_TEXTURES;
let textures = ["./blueflower.jpg"];
let u_WhichTexture = 0;

// Camera
var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

/* 
REQUIREMENTS FOR ASGN 3A
    0.5 pts Have a ground created with a flattened cube and sky from a big cube.
    1 pts   Texture working on at least one object.
    0.5 pts Texture on some objects and color on some other objects. All working together.
    1 pts   Multiple textures
*/

function main() {
  if (!setupWebGL()) {
      return;
  }
  if (!connectVariablesToGLSL()) {
      return;
  }
  actionsForHTMLUI();
  document.onkeydown = keydown;
  initTextures();
  gl.clearColor(75/255, 97/255, 84/255, 1.0);

  function initGeometry(){
    cube = new Cube(); 
  }

  function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // making the projection  matrix 
    var projMat = new Matrix4()
    projMat.setPerspective(50, 1*canvas.width/canvas.height,.1,100);
    gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements); // roate it based off that global rotate matrix

    // making the view matrix 
    var viewMat = new Matrix4()
    viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2] , g_up[0],g_up[1],g_up[2]);
    gl.uniformMatrix4fv(u_ViewMatrix,false,viewMat.elements); // roate it based off that global rotate matrix

    // rotate matrix
    g_rotateMatrix = new Matrix4().rotate(1,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, g_rotateMatrix.elements);
    
    cube.color = [50/255,50/255,50/255,1];
    cube.matrix.translate(-0.5,-0.2,0);
    cube.render();
    
  }

  var tick = function(){
    let startTime = performance.now();

    var now = Date.now();
    var elapsed = now - g_time;// in milliseconds
    g_time = now;
      
    // init render call
    initGeometry();
    renderScene();
    requestAnimationFrame(tick);// req that the browser calls tick
    let duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps");
  };

  requestAnimationFrame(tick);


  function actionsForHTMLUI(){
    //events go here
    
  }
  
  function keydown(ev){
    if(ev.keyCode==68){ // D
        g_eye[0] += 0.5;
    }else if(ev.keyCode ==65){ // A
        g_eye[0] -= 0.5;
    }else if(ev.keyCode == 87){ // W
        g_eye[2] -= 0.5;
    }else if(ev.keyCode == 83){ //S
        g_eye[2] += 0.5;
    }else{
        console.log("invalid key");
    }
    
    renderScene();
}
  //tick();
}
function clearCanvas() {
    renderScene(); // Re-render the canvas, which should now be clear
}



function loadTexture(image, texNum) {
  let texture = gl.createTexture();
  if (!texture) {
    console.error("Failed to create texture");
    return -1;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);   // flip the image's y axis
  gl.activeTexture(gl_TEXTURES[texNum]);  // enable the texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture); // bind texture obj to the target 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // set the texture parameters 
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // set the texture image
  gl.uniform1i(u_Samplers[texNum], texNum); // set the texture unit 0 to the sampler
}

function initTextures() {
  for (let i = 0; i < textures.length; i++) {
    let img = new Image();
    img.src = textures[i];
    img.onload = function() { loadTexture(img, i); }
  }
}


function setupWebGL() {
  // Retrieve <canvas> element & get the rendering context for WebGL
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // for performance
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return false;
  }
  gl_TEXTURES = [gl.TEXTURE0];
  return true;
}


function connectVariablesToGLSL() {
  // init shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return false;
  }

  // get storage locations of a_Position & u_FragColor
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  if (a_Position < 0 || !u_FragColor) {
    console.log('Failed to get the storage location of a_Position or u_FragColor');
    return false;
  }
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return false;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) { 
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return false;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  for (let i = 0; i < num_texts; i++) {
    let u_Sampler = gl.getUniformLocation(gl.program, `u_Sampler${i}`);
    if (!u_Sampler) {
      console.error(`Failed to get the storage location of u_Sampler${i}`);
      return -1;
    }
    u_Samplers.push(u_Sampler);
  }

  u_WhichTexture = gl.getUniformLocation(gl.program, "u_WhichTexture");
  if (!u_WhichTexture) {
    console.error('Failed to get the storage location of u_WhichTexture');
    return -1;
  }
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  // set the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  return true;
}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log('Failed to get ' + htmlID + ' from HTML');
        return;
    }
    htmlElm.innerHTML = text;
}
main();