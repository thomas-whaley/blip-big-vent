class CameraShake {
  constructor(shake_amount) {
    this.shake_amount = shake_amount
    this.origin_x = camera.x;
    this.origin_y = camera.y;
    this.offset_x = 0;
    this.offset_y = 0;
    
    camera.zoom = 1.05;
  }
  
  impact() {
    this.offset_x += random(0, this.shake_amount);
    this.offset_y += random(-this.shake_amount, -this.shake_amount * 0.5);
  }
  
  update() {
    camera.x += this.offset_x;
    camera.y += this.offset_y;

    this.offset_x = lerp(this.offset_x, 0, 0.2);
    this.offset_y = lerp(this.offset_y, 0, 0.2);

    camera.x = lerp(camera.x, this.origin_x, 0.2);
    camera.y = lerp(camera.y, this.origin_y, 0.2);
  }
}