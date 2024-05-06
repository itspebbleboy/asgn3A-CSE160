// Vertex & Fragment shader source codes
var VSHADER_SOURCE = `
attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// global vars for WebGL context & shader program attributes/uniforms
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_rotateMatrix 

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
  var canvas = document.getElementById('webgl');

  canvas.onmousemove = function (ev){if(ev.buttons == 1)click(ev);}
  gl.enable(gl.DEPTH_TEST);
  gl.clearDepth(1.0);
  

  function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    g_rotateMatrix = new Matrix4().rotate(g_globalAngle,0,1,0);
    //g_rotateMatrix = new Matrix4().rotate(g_globalAngle,1,0,0);
    //g_rotateMatrix = new Matrix4().rotate(g_globalAngle,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, g_rotateMatrix.elements);
    ear_right.render();
    ear_left.render();
    inner_ear_right.render();
    inner_ear_left.render();
    head.render();
    face.render();
    body.render();
    tummy.render();
    right.render();
    left.render();
    lower_right.render();
    lower_left.render();
    right_hand.render();
    left_hand.render();
    right_leg.render();
    left_leg.render();
    right_foot.render();
    left_foot.render();
  }

  var tick = function(){
    let startTime = performance.now();
    if(!g_animate){return;}

    var now = Date.now();
    var elapsed = now - g_time;// in milliseconds
    g_time = now;
    
    updateAnimationAngles(now);
    
    renderScene();
    requestAnimationFrame(tick);// req that the browser calls tick
    let duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps");
  };
  function updateSliderAngles(){
    
  }
  function updateAnimationAngles(now){
    
    var angle_step = oscillation(95,85, 1000, now) - g_head_r;
    g_head_r +=angle_step;
    monkey_head.rotate(angle_step, 0, 0, 1);
    angle_step = oscillation(600, 274, 500, now) - g_arm_r1;
    g_arm_r1+= angle_step;
    right.matrix = new Matrix4(arms).translate(.25,0,0).rotate(324,0,0,1);
    left.matrix = new Matrix4(arms).translate(-.25,0,0).rotate(-324,0,0,1);
    right.matrix.rotate(angle_step,0,0,1);
    left.matrix.rotate(-angle_step,0,0,1);
    
    angle_step = oscillation(360, 274, 500, now) - g_arm_r2;
    lower_right.matrix = new Matrix4(right.matrix).translate(0,.4,0).rotate(203,1,0,0).rotate(358,0,0,1);
    lower_left.matrix = new Matrix4(left.matrix).translate(0,.4,0).rotate(203,1,0,0).rotate(-358,0,0,1);
    lower_right.matrix.rotate(angle_step,0,0,1);
    lower_left.matrix.rotate(-angle_step,0,0,1);
    lower_right.matrix.scale(.3,-.4,.3);
    lower_left.matrix.scale(.3,-.4,.3);
    right_hand.matrix = new Matrix4(lower_right.matrix).translate(0,.9,0).rotate(150,0,0,1).scale(.23,.3,.23);
    left_hand.matrix = new Matrix4(lower_left.matrix).translate(0,.9,0).rotate(-150,0,0,1).scale(.23,.3,.23);


    ear_right.matrix = new Matrix4(monkey_head).translate(.5,.85,-.1).rotate(90,1,0,0).scale(.5,.15,.5);
    ear_left.matrix = new Matrix4(monkey_head).translate(-.5,.85,-.1).rotate(90,1,0,0).scale(.5,.15,.5);
    head.matrix = new Matrix4(monkey_head).translate(0,.75,0).scale(.25,.25,.23);
    face.matrix = new Matrix4(head.matrix).translate(0,0,-.7).scale(.85,.8,.7);
    inner_ear_right.matrix = new Matrix4(ear_right.matrix).translate(0,-.1,0).scale(.7,.7,.7);
    inner_ear_left.matrix = new Matrix4(ear_left.matrix).translate(0,-.1,0).scale(.7,.7,.7);
    
    right.matrix.scale(.3,.5,.3);
    left.matrix.scale(.3,.5,.3);
    

    //cubeA.matrix.rotate(newAngle, 1, 0, 0);
    //cubeB.matrix.rotate(newAngle, 1, 0, 0);
    //cubeA.matrix.rotate(newAngle, 0, 1, 0);
    //cubeB.matrix.rotate(newAngle, 0, 1, 0);
  }
  // init render call
  initGeometry();
  renderScene();

  function actionsForHTMLUI(){
    document.getElementById('angleSlider').addEventListener('input', function() {g_globalAngle = this.value; renderScene();});
    document.getElementById('anim').addEventListener('mousedown', function() {g_animate = !g_animate; initGeometry(); tick();});
    
    document.getElementById('tail_1').addEventListener('input', function() {tail_1 = this.value; initGeometry(); renderScene()});
    document.getElementById('tail_2').addEventListener('input', function() {tail_2 = this.value; initGeometry(); renderScene()});
    document.getElementById('tail_3').addEventListener('input', function() {tail_3 = this.value; initGeometry(); renderScene()});
  }

  tick();
}

function oscillation(high, low, freq, now){
  var amplitude = (high - low) / 2;
  var middle = low + amplitude;
  return middle + amplitude * Math.sin(now/freq);
}
function clearCanvas() {
    renderScene(); // Re-render the canvas, which should now be clear
}


function setupWebGL() {
  // Retrieve <canvas> element & get the rendering context for WebGL
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // for performance
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return false;
  }
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

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  // Set the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  return true;
}


main();


