"use strict";


const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");

const universe = document.getElementById("universe");

const physics = window.ThreeBodyPhysics;

if (!canvas || !ctx || !universe || !physics) {
  throw new Error("The simulation could not initialize.");
}


const system = physics.createRandomSystem();

const TIME_STEP = 0.002;

const STEPS_PER_FRAME = 5;

let width = 0;
let height = 0;

let centerX = 0;
let centerY = 0;

console.log("Three-body system initialized.");
console.log("Starting bodies:", system.bodies);



function resizeCanvas() {
  width = universe.clientWidth;
  height = universe.clientHeight;

  centerX = width / 2;
  centerY = height / 2;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);



function updateSimulation() {
  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    physics.stepSystem(system, TIME_STEP);
  }
}


function animate() {
  updateSimulation();

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


const VIEW_SCALE = 180;

function worldToScreen(body) {
  return {
    x: centerX + body.x * VIEW_SCALE,
    y: centerY - body.y * VIEW_SCALE
  };
}



function drawBodies() {
  for (let i = 0; i < system.bodies.length; i++) {
    const body = system.bodies[i];
    const position = worldToScreen(body);

    const colors = ["#8be9fd", "#c4a7ff", "#ffb86c"];
    const color = colors[i];

    ctx.beginPath();
    ctx.arc(position.x, position.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(position.x, position.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}


function animate() {
  ctx.clearRect(0, 0, width, height);

  updateSimulation();

  drawBodies();

  requestAnimationFrame(animate);
}
