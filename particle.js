class Particle {
  constructor(m, c, s, x, y) {
    this.m = m;
    this.c = c;
    this.r = s/2;
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.trail = [];
  }
  
  applyForce(force) {
    // any force that acts on particle
    if (!isFinite(force.x) || !isFinite(force.y)) return;
    let a = p5.Vector.div(force, this.m);
    a.limit(100);
    this.acc.add(a);
  }
  
  calcG(other) {
    // gravitational force from other particles
    let dx = this.pos.x - other.pos.x;
    let dy = this.pos.y - other.pos.y;
    dx = dx - width * round(dx / width);
    dy = dy - height * round(dy / height);
    let dis = sqrt(dx*dx + dy*dy);
    let force = createVector(dx, dy);
    dis = max(dis, 5);
    force.normalize();
    let strength = (G*this.m*other.m)/(dis*dis + safety);
    force.mult(strength);
    return force;
  }
  
  calcE(other) {
    // electric force from other particles
    let dx = this.pos.x - other.pos.x;
    let dy = this.pos.y - other.pos.y;
    dx = dx - width * round(dx / width);
    dy = dy - height * round(dy / height);
    let dis = sqrt(dx*dx + dy*dy);
    let force = createVector(dx, dy);
    dis = max(dis, 5);
    force.normalize();
    let strength = (E*this.c*other.c*(-1))/(dis*dis + safety);
    force.mult(strength);
    return force;
  }
  
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    let tp = false;
    if (this.pos.x > width) {
      this.pos.x = 0; 
      tp = true;
    }
    if (this.pos.x < 0) {
      this.pos.x = width; 
      tp = true;
    }
    if (this.pos.y > height) {
      this.pos.y = 0; 
      tp = true;
    }
    if (this.pos.y < 0) {
      this.pos.y = height; 
      tp = true;
    }
    if (tp) this.trail.push(null);
    this.trail.push(this.pos.copy());
    if (this.trail.length > 100) {
      this.trail.shift();
    }
  }
  
  display() {
    strokeWeight(0);
    if (this.c >= 0) {
      fill(255, 255 - constrain(this.c, 0, 255), 255 - constrain(this.c, 0, 255))
    } else {
      fill(255 + constrain(this.c, -255, 0), 255 + constrain(this.c, -255, 0), 255)
    }
    ellipse(this.pos.x, this.pos.y, this.r*2);
  }
  
  drag() {
    // prevent slingshotting and extreme speeds, less chaotic
    let drag = this.vel.copy();
    if (this.vel.mag() < 0.0001) return;
    drag.mult(-1);
    drag.normalize();
    let speed = this.vel.mag();
    let dragMag = F * speed * speed;
    drag.mult(dragMag);
    this.applyForce(drag);
  }
  
  showTrail() {
    noFill();
    strokeWeight(2);
    if (this.c >= 0) {
      stroke(255, 100, 100, 120);
    } else {
      stroke(100, 100, 255, 120);
    }
    beginShape();
    for (let p of this.trail) {
      if (p === null) {
        endShape();
        beginShape();
        continue;
      }
      vertex(p.x, p.y);
    }
    endShape();
  }
}
