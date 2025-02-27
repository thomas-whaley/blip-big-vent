WebMidi
  .enable()
  .then(onMidiEnabled)
  .catch(err => print(err));

let gyroX = 0;
let rotation = 0;

function onMidiEnabled() {
  // Inputs
  // WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));
  let myInput = WebMidi.inputs.filter(input => input.name.startsWith("CPB"))[0];
  myInput.addListener("controlchange", e => {
    // console.log(e.data);
    if (e.data[1] == 1) {
      gyroX = e.data[2];
    }
  });
}

const WordType = Object.freeze({
    HEAVEN: Symbol("HEAVEN"),
    FUTURE: Symbol("FUTURE"),
    EARTH:  Symbol("EARTH"),
    VOID:   Symbol("VOID")
});

function getWordType(n) {
  if (n >= 0 && n <= 0.25) {
    return WordType.EARTH;
  }
  if (n >= 0.25 && n <= 0.5) {
    return WordType.HEAVEN;
  }
  if (n >= 0.5 && n <= 0.75) {
    return WordType.VOID;
  }
  if (n >= 0.75 && n <= 1) {
    return WordType.FUTURE;
  }
}

function onWordHeard(word) {
  let wordType = getWordType(rotation);
  createWord(word, wordType);
}

// let recognitions = new SpeechDetection('en-US', onWordHeard);

let colliders;
let words;
let fonts = {};

let ventSound;
let earthHitSounds = [];

let camera_shake;

let isVenting = false;
let ventingCounter = 0;

let fadeToBlack = new FadeToBlack(1, 255);

function preload() {
  fonts["default"] = loadFont("assets/font/IBMPlexMono-Regular.ttf");
  fonts[WordType.HEAVEN] = loadFont("assets/font/heaven.ttf");
  fonts[WordType.FUTURE] = loadFont("assets/font/future.ttf");
  fonts[WordType.EARTH] = loadFont("assets/font/earth.ttf");
  fonts[WordType.VOID] = loadFont("assets/font/void.ttf");
  
  ventSound = loadSound("assets/sounds/Vent.mp3");
  earthHitSounds.push(loadSound("assets/sounds/Earth-Hit-1.mp3"));
  earthHitSounds.push(loadSound("assets/sounds/Earth-Hit-2.mp3"));
  earthHitSounds.push(loadSound("assets/sounds/Earth-Hit-3.mp3"));
}

function transformCoords(coords) {
  let sx = width / 1920;
  let sy = height / 1080;
  
  return coords.map(p => [p[0] * sx, p[1] * sy]);
}

function makeWalls() {
  colliders = new Group();
  let sprTop = new colliders.Sprite(
    transformCoords(heaven_bounding_box)
  );
  sprTop.collider = 'static';
  sprTop.visible = false;
  
  let sprBottom = new colliders.Sprite(
    transformCoords(earth_bounding_box)
  );
  sprBottom.collider = 'static';
  sprBottom.visible = false;
}

function makeBG() {
  let bg = new Sprite();
  bg.image = 'assets/bg/BG-1.2.png';
  
  bg.scale.x = width / 1920;
  bg.scale.y = height / 1080;
  bg.width = width;
  bg.height = height;
  bg.collider = 'none';
  bg.x = width / 2;
  bg.y = height / 2;
}

function createWord(word, word_type) {
  let font = fonts[word_type];
  
  let sprite = new words.Sprite();
  sprite.word_type = word_type;
  sprite.y = height * 0.2;
  sprite.x = width;
  sprite.friction = 10;
  // sprite.color = 'yellow';
  // sprite.stroke = 'white';
  sprite.textColor = 'white';
  sprite.has_collided = false;
  
  sprite.mass = 10; //word.length * 2;
  // // sprite.bounciness = 0.5;
  if (sprite.word_type == WordType.EARTH) {
    sprite.mass = 100;
    sprite.gravityScale = 10;
    sprite.applyForce(-width * 0.7, 0);
  }
  if (sprite.word_type == WordType.HEAVEN) {
    sprite.mass = 10;
    sprite.gravityScale = -1;
    sprite.applyForce(-width * 0.7, 0);
  }
  if (sprite.word_type == WordType.VOID) {
    sprite.mass = 500;
    sprite.gravityScale = 10;
    sprite.applyForce(-width * 0.3, height * 0.5);
  }
  if (sprite.word_type == WordType.FUTURE) {
    sprite.mass = 2;
    sprite.gravityScale = 0;
    sprite.applyForce(-width * 1, 0);
  }
  
  let bounds = font.textBounds(word);
  sprite.width = bounds.w;
  sprite.height = bounds.h;
  
  sprite.update = () => {
    if (sprite.word_type == WordType.FUTURE) {
      sprite.applyForce(-20, -2);
    }
    
    // Camera shake
    if (sprite.word_type == WordType.EARTH) {
      if (!sprite.has_collided && sprite.collides(colliders)) {
        sprite.has_collided = true;
        camera_shake.impact();
        
        // let soundIndex = int(random() * earthHitSounds.length);
        // earthHitSounds[soundIndex].amp(0.3);
        // earthHitSounds[soundIndex].play();
      }
    }
    
    if (isVenting) {
      sprite.applyForce(-width * 0.05, 0);
    }
  }
  
  sprite.draw = () => {
    textFont(font);
    push();
    let scale_y = max(1 - abs(sprite.velocity.x * 0.02), 0.5);
    scale(1, scale_y);
    fill(255);
    
  
    // if (sprite.word_type == WordType.HEAVEN) {
    //   drawingContext.shadowColor = color(255);
    //   drawingContext.shadowBlur = 10;
    // }
    
    text(word, -sprite.width * 0.5 - bounds.advance, sprite.height * 0.5);
    pop();
  };
}

function mouseReleased(event) {
  fullscreen(!fullscreen());
}

function keyPressed(event) {
  if (key == " ") {
    vent();
  }
}

function vent() {
  if (isVenting) {
    return;
  }
  ventSound.play();
  isVenting = true;
  ventingCounter = 600;
}

function setup() {
  textSize(28);
  new Canvas(1280, 720);
  noCursor();
  words = new Group();
  
  // p5play.renderStats = true;
  
  world.gravity.x = 0;
  world.gravity.y = 1;
  makeWalls();
  makeBG();
  world.timeScale = 0.6;
  
  camera_shake = new CameraShake(1);
}

function handleCounters() {
  if (isVenting) {
    ventingCounter --;
    if (ventingCounter <= 0) {
      isVenting = false;
    }
    
    if (ventingCounter < 255) {
      fadeToBlack.fade();
    }
  }
}

function draw() {
  
  handleCounters();
  
  words.cull(width * 1.1);
  
  if (frameCount % 60 == 0) {
    createWord("heaven", WordType.HEAVEN);
    createWord("void", WordType.VOID);
    createWord("earth", WordType.EARTH);
    createWord("future", WordType.FUTURE);
  }
  
  // if (frameCount % (60 * 20) == 0) {
  //   recognitions.reset();
  // }
  
  camera_shake.update();
  camera.on();
  allSprites.draw();
  camera.off();
  fadeToBlack.draw();
  
  rotation = lerp(rotation, gyroX / 127, 0.1);
}