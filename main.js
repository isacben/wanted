import {
  init,
  initKeys,
  keyPressed,
  onKey,
  Text,
  imageAssets,
  load,
  TileEngine,
  Sprite,
  SpriteSheet,
  GameLoop,
  clamp
} from './kontra.mjs';


// Globals

let T = 0;
const l1 = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

const l2 = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];


let { canvas } = init();
initKeys();

canvas.style.position = 'absolute';
camera(10, 10);

let message = "debug...";
let debug = Text({
  text: message,
  font: '12px Arial',
  color: '#FFF1E8',
  x: 8 * 4,
  y: 8 * 4,
  textAlign: 'left'
});

let playerSpriteSheet;
let playerSprite;
let arrows = [];
let guards = [];
let tileEngine;


(async () => {
  await load('./img/arrow.png', './img/guard.png', './img/robin.png', './img/tiles.png');

  tileEngine = TileEngine({
    // tile size
    tilewidth: 32,
    tileheight: 32,

    // map size in tiles
    width: 16,
    height: 16,

    // tileset object
    tilesets: [{
      firstgid: 1,
      image: imageAssets['./img/tiles.png']
    }],

    // layer object
    layers: [{
      name: 'ground',
      data: l1 
    }]
  });

  playerSpriteSheet = SpriteSheet({
    image: imageAssets['./img/robin.png'], 
    frameWidth: 8,
    frameHeight: 8,
    frameMargin: 1,
    animations: {
      idle: {
        frames: [0,1],
        frameRate: 3,
      },
      run: {
        frames: [2,3,4,3],
        frameRate: 8,
      },
      jump: {
        frames: [6],
      },
      fall: {
        frames: [7],
      },
      slide: {
        frames:[5]
      }
    }
  });
  
  playerSprite = Sprite({
    x: 8 * 4 + 16,
    y: 64 * 4,
    dx: 0,
    dy: 0,
    max_dx: 2,
    max_dy: 4,
    width: 32,
    height: 32,
    anchor: {x: 0.5, y: 0},
    animations: playerSpriteSheet.animations
  });
    
  let loop = GameLoop({ 
    update: function() { 
      //camera(10 + g.shake * (Math.floor(Math.random() * 2) - 1), 10 + g.shake * (Math.floor(Math.random() * 2) - 1));

      //if (g.shake > 0) {
      //  g.shake *= 0.5;
      //}

      T += 1;
      playerUpdate();
      playerShoot();
      playerSprite.update();
      playerAnimate();

      updateArrows();
      //
      // guards.spawn();
      // guards.update();
      
      message = 'X: ' + playerSprite.x; 
      // message += ' Y: ' + player.sprite.y; 
      // message += ' DY: ' + player.sprite.dy; 
      debug.text = message;
    },

    render: function() {
      
      tileEngine.render();
      playerSprite.render();
      arrows.forEach(arrow => {
        arrow.render();
      });
      //
      // guards.sprites.forEach(guard => {
      //   guard.render();
      // });
      //
      debug.render();
    }
  });

  loop.start();
})();

function camera(left, top) {
  canvas.style.left = left + "px";
  canvas.style.top = top + "px";
}


//
//
// ***** player *****
//
// 

const friction = 0.85;
const gravity = 0.2;
const acc = 0.3;
const boost = 4;

let shot = false;
let landed = false;
let running = false;
let jumping = false;
let falling = false;
let sliding = false;
let flip = false;


export function playerUpdate() {

  

  // physics
  playerSprite.dy += gravity;
  playerSprite.dx *= friction;

  if (Math.abs(playerSprite.dx) < 0.2) {
    playerSprite.dx = 0;
    sliding = false;
  }

  // controls
  if (keyPressed('arrowleft')) {
    if (!falling) {
      running = true;
    } else {
      running = false;
    }

    playerSprite.setScale(-1, 1);
    
    // flip = true;
    // if (playerSprite.scaleX === 1) {
    //   playerSprite.x += 32;
    //   playerSprite.scaleX = -1;
    // }
    
    playerSprite.dx -= acc;
  }
  
  if (keyPressed('arrowright')) {
    if (!falling) {
      running = true;
    } else {
      running = false;
    }
    playerSprite.setScale(1, 1);
    /* flip = false;
    if (playerSprite.scaleX === -1) {
      playerSprite.x -= 32;
      playerSprite.scaleX = 1;
      
    } */
    playerSprite.dx += acc;
  }

  // slide
  if (running &&
      !keyPressed('arrowleft') &&
      !keyPressed('arrowright')) {
    running = false;
    sliding = true;
  }
  
  // jump
  if (keyPressed('x') && landed) {
    playerSprite.dy -= boost;
    landed = false;
  }

  // check collision up and down
  if (playerSprite.dy > 0) { // falling
    falling = true;
    landed = false;
    jumping = false;
    playerSprite.dy = clamp(-playerSprite.max_dy, playerSprite.max_dy, playerSprite.dy);

    if (collide_map(playerSprite, "down")) {
      playerSprite.dy = 0;
      landed = true;
      falling = false;
      playerSprite.y -= ((playerSprite.y + playerSprite.height + 1) % 8) - 1;
    }
  } else if (playerSprite.dy < 0) {
      jumping = true;
      running = false;

      if (collide_map(playerSprite, "up")) {
        playerSprite.dy = 0;
      }
  }

  // check collision left and right
  if (playerSprite.dx < 0) {
    playerSprite.dx = clamp(-playerSprite.max_dx, playerSprite.max_dx, playerSprite.dx);

    if (collide_map(playerSprite, "left")) {
      playerSprite.dx = 0;

      // wall correction
      playerSprite.x -= ((playerSprite.x - 17 + 1) % 8) - 1;
    }
  } else if (playerSprite.dx > 0) {
    playerSprite.dx = clamp(-playerSprite.max_dx, playerSprite.max_dx, playerSprite.dx);
    
    if (collide_map(playerSprite, "right")) {
      playerSprite.dx = 0;

      // wall correction
      playerSprite.x += ((playerSprite.width + 1) % 8) - 1;
    }
  }

  

  playerSprite.x += playerSprite.dx;
  playerSprite.y += playerSprite.dy;

  

}

function playerAnimate() {
  if (running) {
    playerSprite.playAnimation('run');
  } else if (jumping) {
    playerSprite.playAnimation('jump');
  } else if (falling) {
    playerSprite.playAnimation('fall');
  } else if (sliding) {
    playerSprite.playAnimation('slide');
  } else {
    playerSprite.playAnimation('idle');
  }
}

function playerShoot() {
  onKey('z', function() {
    if (!shot) {
      shot = true;
      addArrow(playerSprite.x, playerSprite.y, playerSprite.scaleX);
    }
  });
  onKey('z', function() {
    shot = false;
  }, {"handler": "keyup"}); 
}


//
//
// ***** map *****
//
// 

function collide_map(sprite, direction) {
  let x = sprite.x - 16;
  let y = sprite.y;
  let w = sprite.width;
  let h = sprite.height;

  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;

  if (direction === "left") {
   x1=x-4;
   y1=y;
   x2=x;
   y2=y+h-4;
  } else if (direction === "right") { 
     x1=x+w;
     y1=y;
     x2=x+w+4;
     y2=y+h-4;
  } else if (direction === "up") {
     x1=x+4;
     y1=y-4;
     x2=x+w-12;
     y2=y;
  } else if (direction === "down") { 
     x1=x;
     y1=y+h;
     x2=x+w;
     y2=y+h;
  }

  if (tileEngine.tileAtLayer('ground', {x: x1, y: y1}) > 0 ||
    tileEngine.tileAtLayer('ground', {x: x1, y: y2}) > 0 ||
    tileEngine.tileAtLayer('ground', {x: x2, y: y1}) > 0 ||
    tileEngine.tileAtLayer('ground', {x: x2, y: y2}) > 0) {
      return true;
  } else {
    return false;
  }
}


//
//
// ***** arrows *****
//
// 

function updateArrows() {
  arrows.forEach((arrow, i)=> {
    arrow.ttl -= 2;
    arrow.update();
    
    if (collide_map(arrow, "left") || collide_map(arrow, "right")) {
      deleteArrow(i);
    }

    if (arrow.ttl <= 0) {
      deleteArrow(i);
    }
  });
}

function addArrow(x, y, dir) {
  let arrow = Sprite({
    x: x,
    y: Math.floor((y+12)/32) * 32, // clamp the arrow to a row
    dx: 6 * dir,
    scaleX: dir*4,
    scaleY: 4,
    width: 32,
    height: 32,
    anchor: {x: 0, y: 0},
    image: imageAssets['./img/arrow.png'],
    ttl: 200,
  });
  arrows.push(arrow);
}

function deleteArrow(arrow) {
  arrows.splice(arrow, 1);
}