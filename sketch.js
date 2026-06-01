// class lists

let particles = [];
let mfields = [];

// seed

let seed_curr = 6767;

// mode

let trail = true;
let jiggle = false;

// constants

let G = 0.67;
let E = 6.7*2/3;
let F = 0.1;
let safety = 25;

// user control checks

let positive = true; //check whether next spawn is positive or negative...
let field;
let tfield;
let dragStart;
let dragging = false;



function setup() {
  createCanvas(1000, 500);
  field = createVector(0, 0);
  tfield = createVector(0, 0);
  dragStart = createVector(0, 0);
  initSimulation();
}

function draw() {
  background(0);
  fill('white');
  text('toggle between +/- for next spawned particle!', 10, 20);
  if (positive) {
    text('currently: positive', 10, 40);
  } else {
    text('currently: negative', 10, 40);
  }
  text('c to clear', 10, 60);
  text('click m to toggle mode', 10, 80);
  if (jiggle) {
    text('currently: jiggle mode', 10, 100);
  } else {
    text('currently: normal mode', 10, 100);
  }
  text('click r to restart with same seed, n to restart with new seed', 10, 120);
  text('current seed: ' + seed_curr, 10, 140);
  text('click t to toggle trail', 10, 160);
  text('click e to explode!', 10, 180);
  
  drawField();
  
  // merging
  
  for (let i = particles.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {

      let d = p5.Vector.dist(
        particles[i].pos,
        particles[j].pos
      );

      if (d < particles[i].r + particles[j].r) {

        let totalMass =
          particles[i].m + particles[j].m;

        let newCharge =
          particles[i].c + particles[j].c;

        let newPos =
          p5.Vector.add(
            particles[i].pos,
            particles[j].pos
          ).div(2);

        let merged =
          new Particle(
            totalMass,
            newCharge,
            2*sqrt(particles[i].r * particles[i].r + particles[j].r * particles[j].r),
            newPos.x,
            newPos.y
          );

        merged.vel =
          p5.Vector.add(
            particles[i].vel.copy().mult(particles[i].m),
            particles[j].vel.copy().mult(particles[j].m)
          ).div(totalMass);

        particles.splice(i,1);
        particles.splice(j,1);

        particles.push(merged);

        break;
      }
    }
  }
  
  // interparticle forces + user field force
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = 0; j < particles.length; j++) {
      if (i !== j) {
        let grav = particles[j].calcG(particles[i]);
        let elec = particles[j].calcE(particles[i]);
        particles[i].applyForce(grav);
        particles[i].applyForce(elec);
      }
    }
    if (dragging) {
      //field is tfield
      particles[i].applyForce(tfield);
    } else {
      //field is field
      particles[i].applyForce(field);
    }
  }
  
  // lorentz force, particle changes, display
  
  for (let particle of particles) {
    for (let mfield of mfields) {
      if (mfield.contains(particle)) {
        let lor = mfield.calcLor(particle);
        particle.applyForce(lor);
      }
    }
    particle.update();
    if (trail) {
      particle.showTrail();
    }
    particle.display();
    particle.drag();
  }
  for (let mfield of mfields) {
    mfield.display();
  }
}

function mousePressed() {
  dragStart.set(mouseX, mouseY);
  dragging = true;
}

function mouseReleased() {
  dragging = false;
  if (dist(dragStart.x, dragStart.y, mouseX, mouseY) < 5) {
    // represents a click, add new particle
    if (positive) {
      particles.push(new Particle(random(128, 256), random(0, 255), random(10,25), mouseX, mouseY));
    } else {
      particles.push(new Particle(random(128,256), random(-255, 0), random(10,25), mouseX, mouseY));
    }
  } else {
    //represents a drag, change field
    field = tfield.copy();
  }
}

function mouseDragged() {
  //constantly calculaing change in field while dragging to show how the field changes
  tfield = ((field.copy()).add(createVector(mouseX, mouseY).sub(dragStart))).div(8);
  tfield.setMag(constrain(tfield.mag(), 0, 8));
}

function keyPressed() {
  //keybinds
  if (key === '+') {
    positive = true;
  }
  if (key === '-') {
    positive = false;
  }
  if (key === 'c') {
    particles = [];
  }
  if (key === 'm') {
    jiggle = !jiggle;
    if (jiggle) {
      G = 0.67;
      E = 20;
      F = 0.2;
    } else {
      G = 0.67;
      E = 6.7*2/3;
      F = 0.1;
    }
  }
  if (key === 'r') {
    // restart with same seed
    initSimulation();
  }
  if (key === 'n') {
    // restart with new seed
    seed_curr = floor(random(1000000));
    initSimulation();
  }
  if (key === 't') {
    trail = !trail;
  }
  if (key === 'e') {
    let new_particles = [];
    for (let p of particles) {
      if (p.r < 4 || p.m < 4) continue;
      let angle = random(TWO_PI);
      let offset = p5.Vector.fromAngle(angle);
      offset.setMag(p.r);
      let p1 = new Particle(
        p.m / 4,
        Math.round(p.c / 2),
        p.r,
        p.pos.x + offset.x,
        p.pos.y + offset.y
      );
      let p2 = new Particle(
        p.m / 4,
        Math.round(p.c / 2),
        p.r,
        p.pos.x - offset.x,
        p.pos.y - offset.y
      );
      p1.vel = p.vel.copy();
      p2.vel = p.vel.copy();
      let kick = p5.Vector.fromAngle(angle);
      kick.setMag(2);
      p1.vel.add(kick);
      p2.vel.sub(kick);
      new_particles.push(p1);
      new_particles.push(p2);
    }

    particles = new_particles;
  }
}

function drawField() {
  // read the name
  let spacing = 40;

  stroke(100);
  strokeWeight(1);

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      let pos = createVector(x, y);
      let f;
      if (dragging) {
        f = tfield.copy();
      } else {
        f = field.copy();
      }
      f.mult(4);
      push();
      translate(pos.x, pos.y);
      line(0, 0, f.x, f.y);
      rotate(f.heading());
      translate(f.mag(), 0);
      triangle(0, 0, -5, 2, -5, -2);
      pop();
    }
  }
}

// new seed
function initSimulation() {

  randomSeed(seed_curr);
  noiseSeed(seed_curr);

  particles = [];
  mfields = [];

  for (let i = 0; i < 8; i++) {
    particles.push(new Particle(random(128,256), random(-255,255), random(10,25), random(width/4,width*3/4), random(height/4,height*3/4)));
  }

  mfields.push(new Field(width/2-150, height/2-150, 300, 300, -0.02));
}
