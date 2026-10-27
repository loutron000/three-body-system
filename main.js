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



const MAX_VIEW_SCALE = 180;
const MIN_VIEW_SCALE = 12;

let viewScale = MAX_VIEW_SCALE;

function calculateCamera() {
  const bodies = system.bodies;

  let totalMass = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (const body of bodies) {
    totalMass += body.mass;
    weightedX += body.mass * body.x;
    weightedY += body.mass * body.y;
  }

  const cameraX = weightedX / totalMass;
  const cameraY = weightedY / totalMass;

  let maxDistanceX = 0;
  let maxDistanceY = 0;

  for (const body of bodies) {
    maxDistanceX = Math.max(
      maxDistanceX,
      Math.abs(body.x - cameraX)
    );

    maxDistanceY = Math.max(
      maxDistanceY,
      Math.abs(body.y - cameraY)
    );
  }

  const availableWidth = width * 0.42;
  const availableHeight = height * 0.42;

  const scaleX = maxDistanceX > 0
    ? availableWidth / maxDistanceX
    : MAX_VIEW_SCALE;

  const scaleY = maxDistanceY > 0
    ? availableHeight / maxDistanceY
    : MAX_VIEW_SCALE;

  const targetScale = Math.max(
    MIN_VIEW_SCALE,
    Math.min(MAX_VIEW_SCALE, scaleX, scaleY)
  );

  viewScale += (targetScale - viewScale) * 0.06;

  return { cameraX, cameraY };
}

function worldToScreen(body, camera) {
  return {
    x: centerX + (body.x - camera.cameraX) * viewScale,
    y: centerY - (body.y - camera.cameraY) * viewScale
  };
}



function drawBodies(camera) {
  const colors = ["#8be9fd", "#c4a7ff", "#ffb86c"];

  for (let i = 0; i < system.bodies.length; i++) {
    const body = system.bodies[i];
    const position = worldToScreen(body, camera);

    const radius = Math.max(2, Math.min(5, viewScale * 0.028));

    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();

    ctx.beginPath();
    ctx.arc(position.x, position.y, radius * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}




function animate() {
  ctx.clearRect(0, 0, width, height);

  updateSimulation();

  const camera = calculateCamera();
  drawBodies(camera);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
