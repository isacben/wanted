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
  collides,
  clamp
} from './kontra.mjs';


// Globals

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
let player;
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
  
  player = Sprite({
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

  spawnGuard(32*4, 32*4);
  spawnGuard(32*6, 32*6);
    
  let loop = GameLoop({ 
    update: function() { 
      //camera(10 + g.shake * (Math.floor(Math.random() * 2) - 1), 10 + g.shake * (Math.floor(Math.random() * 2) - 1));

      //if (g.shake > 0) {
      //  g.shake *= 0.5;
      //}

      T += 1;
      playerUpdate();
      playerShoot();
      player.update();
      playerAnimate();

      updateArrows();
      updateGuards();
      
      message = 'X: ' + player.x; 
      // message += ' Y: ' + player.sprite.y; 
      // message += ' DY: ' + player.sprite.dy; 
      debug.text = message;
    },

    render: function() {
      
      tileEngine.render();
      player.render();
      arrows.forEach(arrow => {
        arrow.render();
      });
      
      renderGuards();
      
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


function playerUpdate() {
  // physics
  player.dy += gravity;
  player.dx *= friction;

  if (Math.abs(player.dx) < 0.2) {
    player.dx = 0;
    sliding = false;
  }

  // controls
  if (keyPressed('arrowleft')) {
    if (!falling) {
      running = true;
    } else {
      running = false;
    }

    player.setScale(-1, 1);
    player.dx -= acc;
  }
  
  if (keyPressed('arrowright')) {
    if (!falling) {
      running = true;
    } else {
      running = false;
    }
    player.setScale(1, 1);
    player.dx += acc;
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
    player.dy -= boost;
    landed = false;
  }

  // check collision up and down
  if (player.dy > 0) { // falling
    falling = true;
    landed = false;
    jumping = false;
    player.dy = clamp(-player.max_dy, player.max_dy, player.dy);

    if (collide_map(player, "down")) {
      player.dy = 0;
      landed = true;
      falling = false;
      player.y -= ((player.y + player.height + 1) % 8) - 1;
    }
  } else if (player.dy < 0) {
      jumping = true;
      running = false;

      if (collide_map(player, "up")) {
        player.dy = 0;
      }
  }

  // check collision left and right
  if (player.dx < 0) {
    player.dx = clamp(-player.max_dx, player.max_dx, player.dx);

    if (collide_map(player, "left")) {
      player.dx = 0;

      // wall correction
      player.x -= ((player.x - 17 + 1) % 8) - 1;
    }
  } else if (player.dx > 0) {
    player.dx = clamp(-player.max_dx, player.max_dx, player.dx);
    
    if (collide_map(player, "right")) {
      player.dx = 0;

      // wall correction
      player.x += ((player.width + 1) % 8) - 1;
    }
  }

  player.x += player.dx;
  player.y += player.dy;
}

function playerAnimate() {
  if (running) {
    player.playAnimation('run');
  } else if (jumping) {
    player.playAnimation('jump');
  } else if (falling) {
    player.playAnimation('fall');
  } else if (sliding) {
    player.playAnimation('slide');
  } else {
    player.playAnimation('idle');
  }
}

function playerShoot() {
  onKey('z', function() {
    if (!shot) {
      shot = true;
      addArrow(player.x, player.y, player.scaleX);
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
    arrow.update();
    
    if (collide_map(arrow, "left") || collide_map(arrow, "right")) {
      arrow.ttl = 0;
    }

    deleteArrow(arrow);
  });
}

function addArrow(x, y, dir) {
  let arrow = Sprite({
    x: x,
    y: Math.floor((y+12)/32) * 32, // clamp the arrow to a row
    dx: 6 * dir,
    scaleX: dir,
    scaleY: 1,
    width: 32,
    height: 32,
    anchor: {x: 0, y: 0},
    image: imageAssets['./img/arrow.png'],
    ttl: 70,
  });
  arrows.push(arrow);
}

function deleteArrow(arrow) {
  if (arrow.ttl <= 0) {
    arrows.splice(arrow, 1);
  }
}

//
//
// ***** guards *****
//
// 

function updateGuards() {
  guards.forEach((guard, i)=> {
    guard.update();
    
    guard.dy += gravity;
    guard.dx *= friction;

    
    guard.dx -= guard.acc * guard.scaleX;

    // check collision up and down
    if (guard.dy > 0) { // falling
      //falling = true;
      //landed = false;
      //jumping = false;
      guard.dy = clamp(-guard.max_dy, guard.max_dy, guard.dy);

      if (collide_map(guard, "down")) {
        guard.dy = 0;
        //landed = true;
        //falling = false;
        guard.y -= ((guard.y + guard.height + 1) % 8) - 1;
      }
    } else if (guard.dy < 0) {
        //jumping = true;
        //running = false;

        if (collide_map(guard, "up")) {
          guard.dy = 0;
        }
    }

    // check collision left and right
    if (guard.dx < 0) {
      guard.dx = clamp(-guard.max_dx, guard.max_dx, guard.dx);

      if (collide_map(guard, "left")) {
        guard.scaleX = -1
      }
    } else if (guard.dx > 0) {
      guard.dx = clamp(-guard.max_dx, guard.max_dx, guard.dx);
      
      if (collide_map(guard, "right")) {
        guard.scaleX = 1
      }
    }

    arrows.forEach((arrow) => {
      if (collides(arrow, guard)) {
        guard.health -= 1;
        arrow.ttl = 0; 
      }
    });

    if (guard.health <= 0) {
      destroyGuard(i);
    }

    if (collides(guard, player)) {
      console.log("guard touched the player")
      //destroy(i);
      //g.shake = 9;
    }
  });

}

function renderGuards() {
  guards.forEach(guard => {
    guard.render();
  });
}

function spawnGuard(x, y) {
  let guard = Sprite({
    x: x,
    y: y,
    dx: 0,
    dy: 0,
    max_dx: 2,
    max_dy: 4,
    acc: Math.random() * 0.15 + 0.15,
    width: 32,
    height: 32,
    scaleX: randDir(),
    anchor: {x: 0.5, y: 0},
    image: imageAssets['./img/guard.png'],
    health: 5
  });

  console.log(guard.acc);
  guards.push(guard);
}

function destroyGuard(guard) {
  guards.splice(guard, 1);
}


function randDir() {
  return Math.random() < 0.5 ? -1 : 1
}