"use strict";


const G = 1;

const MIN_SEPARATION = 1e-8;


function createRandomSystem() {
  const bodies = [];
  const bodyCount = 3;

  for (let i = 0; i < bodyCount; i++) {
    const angle = (i / bodyCount) * Math.PI * 2
      + (Math.random() - 0.5) * 0.6;

    const radius = 0.9 + Math.random() * 0.6;

    bodies.push({
      name: `Body ${i + 1}`,
      mass: 0.8 + Math.random() * 0.8,

      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,

      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8
    });
  }

  const totalMass = bodies.reduce(
    (sum, body) => sum + body.mass,
    0
  );

  const momentumX = bodies.reduce(
    (sum, body) => sum + body.mass * body.vx,
    0
  );

  const momentumY = bodies.reduce(
    (sum, body) => sum + body.mass * body.vy,
    0
  );

  const centreVelocityX = momentumX / totalMass;
  const centreVelocityY = momentumY / totalMass;

  for (const body of bodies) {
    body.vx -= centreVelocityX;
    body.vy -= centreVelocityY;
  }

  return {
    bodies,
    time: 0,
    steps: 0
  };
}


function calculateAccelerations(bodies) {
  const accelerations = bodies.map(() => ({
    x: 0,
    y: 0
  }));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bodyA = bodies[i];
      const bodyB = bodies[j];

      const dx = bodyB.x - bodyA.x;
      const dy = bodyB.y - bodyA.y;

      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < MIN_SEPARATION ** 2) {
        throw new Error(
          "Bodies are too close for reliable Newtonian integration."
        );
      }

      const distance = Math.sqrt(distanceSquared);

      const factor = G / (distanceSquared * distance);

      accelerations[i].x +=
        factor * bodyB.mass * dx;

      accelerations[i].y +=
        factor * bodyB.mass * dy;

      accelerations[j].x -=
        factor * bodyA.mass * dx;

      accelerations[j].y -=
        factor * bodyA.mass * dy;
    }
  }

  return accelerations;
}


function stepSystem(system, dt) {
  const bodies = system.bodies;

  const oldAccelerations = calculateAccelerations(bodies);

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].vx += oldAccelerations[i].x * dt * 0.5;
    bodies[i].vy += oldAccelerations[i].y * dt * 0.5;
  }

  for (const body of bodies) {
    body.x += body.vx * dt;
    body.y += body.vy * dt;
  }

  const newAccelerations = calculateAccelerations(bodies);

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].vx += newAccelerations[i].x * dt * 0.5;
    bodies[i].vy += newAccelerations[i].y * dt * 0.5;
  }

  system.time += dt;
  system.steps++;
}


function calculateTotalEnergy(bodies) {
  let kineticEnergy = 0;
  let potentialEnergy = 0;

  for (const body of bodies) {
    const speedSquared =
      body.vx * body.vx + body.vy * body.vy;

    kineticEnergy +=
      0.5 * body.mass * speedSquared;
  }

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MIN_SEPARATION) {
        throw new Error(
          "Cannot calculate potential energy at zero separation."
        );
      }

      potentialEnergy -=
        G * bodies[i].mass * bodies[j].mass / distance;
    }
  }

  return {
    kinetic: kineticEnergy,
    potential: potentialEnergy,
    total: kineticEnergy + potentialEnergy
  };
}

function calculateTotalMomentum(bodies) {
  return bodies.reduce(
    (momentum, body) => {
      momentum.x += body.mass * body.vx;
      momentum.y += body.mass * body.vy;

      return momentum;
    },
    { x: 0, y: 0 }
  );
}



window.ThreeBodyPhysics = {
  createRandomSystem,
  calculateAccelerations,
  stepSystem,
  calculateTotalEnergy,
  calculateTotalMomentum
};
