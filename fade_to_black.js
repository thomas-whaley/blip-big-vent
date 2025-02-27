class FadeToBlack {
  constructor(fade_speed, wait_length) {
    this.fade_speed = fade_speed;
    this.wait_length = wait_length;
    this.fade_alpha = 0;
    this.NO_FADE = "NO_FADE";
    this.FADING = "FADING";
    this.WAITING = "WAITING";
    this.REVEALING = "REVEALING";
    this.state = this.NO_FADE;
    
    this.counter = 0;
  }
  
  fade() {
    if (this.state != this.NO_FADE) {
      return;
    }
    this.state = this.FADING;
    this.fade_alpha = 0;
    this.counter = 0;
  }
  
  updateCounters() {
    if (this.state == this.NO_FADE) {
      return;
    }
    else if (this.state == this.FADING) {
      this.fade_alpha += this.fade_speed;
      if (this.fade_alpha >= 255) {
        this.state = this.WAITING;
        this.fade_alpha = 255;
      }
    }
    else if (this.state == this.WAITING) {
      this.counter ++;
      if (this.counter >= this.wait_length) {
        this.state = this.REVEALING;
        this.counter = 0;
      }
    }
    else if (this.state == this.REVEALING) {
      this.fade_alpha -= this.fade_speed;
      if (this.fade_alpha <= 0) {
        this.state = this.NO_FADE;
        this.fade_alpha = 0;
      }
    }
  }
  
  draw() {
    this.updateCounters();
    if (this.state != this.NO_FADE) {
      fill(0, this.fade_alpha);
      rect(0, 0, width, height);
    }
  }
}