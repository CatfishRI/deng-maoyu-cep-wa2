// magnetic field

class Field {
  constructor(x, y, w, h, f) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.f = f;
  }
  
  calcLor(other) {
    //lorentz force
    let force = createVector(
      other.vel.y,
      -other.vel.x
    );
    force.mult(this.f * -other.c);
    return force;
  }
  
  contains(other) {
    //check whether particle is inside
    return (
      other.pos.x > this.x &&
      other.pos.x < this.x + this.w &&
      other.pos.y > this.y &&
      other.pos.y < this.y + this.h
    );
  }
  
  display() {
    fill(100,100,0, 100);
    rect(this.x, this.y, this.w, this.h);

    let cx = this.x + this.w/2;
    let cy = this.y + this.h/2;
    
    stroke('white');
    fill('black');
    strokeWeight(1);
    
    // show direction of magnetic field    
    if (this.f > 0) {
      circle(cx, cy, 12);
    } else {
      line(cx - 8, cy - 8, cx + 8, cy + 8);
      line(cx + 8, cy - 8, cx - 8, cy + 8);
    }
  }
}
