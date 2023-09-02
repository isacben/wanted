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
const acc = 0.25;
const boost = 4.1;

let shot = false;
let landed = false;
let running = false;
let jumping = false;
let falling = false;
let sliding = false;

// ----- Test -----
let x1r = 0;
let y1r = 0;
let x2r = 0;
let y2r = 0;

let hitbox = Sprite({
  color: 'cyan',
});

// ----- Test -----

let T = 0;
const l1 = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,0,0,0,1,0,0,0,0,1,1,1,1,0,1,
  1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,
  1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,
  1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1,
  1,1,1,0,0,0,0,0,0,0,0,2,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,
  1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1,
  1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,
  1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1,
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
  1,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,
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



let spriteSheet;
let player;
let arrows = [];
let people = [];
let tileEngine;


(async () => {
  await load('./img/ss.png', './img/tiles.png');

  tileEngine = TileEngine({
    // tile size
    tilewidth: 32,
    tileheight: 32,
    frameMargin: 10,

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

  spriteSheet = SpriteSheet({
    image: imageAssets['./img/ss.png'], 
    frameWidth: 8,
    frameHeight: 8,
    frameMargin: 1,
    animations: {
      playerIdle: {
        frames: [0,1],
        frameRate: 3,
      },
      playerRun: {
        frames: [2,3,4,3],
        frameRate: 8,
      },
      playerJump: {
        frames: [6],
      },
      playerFall: {
        frames: [7],
      },
      playerSlide: {
        frames:[5]
      },
      guard: {
        frames: [10, 11, 10],
        frameRate: 5
      },
      arrow: {
        frames: 12
      },
      lady: {
        frames: 13,
      },
      old: {
        frames: [14, 15, 14],
        frameRate: 6
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
    animations: spriteSheet.animations
  });

  spawnPerson(7, 2, 'guard');
  spawnPerson(9, 2, 'guard');
  spawnPerson(9, 4, 'old');
  spawnPerson(13, 6, 'lady');
  spawnPerson(7, 2, 'guard');
  spawnPerson(9, 2, 'guard');
  spawnPerson(9, 4, 'old');
  spawnPerson(13, 6, 'lady');

  let loop = GameLoop({ 
    update: function() { 

      //camera(10 + g.shake * (Math.floor(Math.random() * 2) - 1), 10 + g.shake * (Math.floor(Math.random() * 2) - 1));

      //if (g.shake > 0) {
      //  g.shake *= 0.5;
      //}

      // ----- Test -----
      hitbox.x = x1r;
      hitbox.y = y1r;

      // +4 is because we are scaling from 1 pixels (PICO-8) to 4 (this game resolution)
      hitbox.width = (x2r - x1r) + 4;
      hitbox.height = (y2r - y1r) + 4; 
      hitbox.update()
      // ----- Test -----

      T += 1;
      playerUpdate();
      playerShoot();
      player.update();
      playerAnimate();

      updateArrows();
      movePeople();
      
      message = 'x1r: ' + x1r; 
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
      
      renderPeople();
      
      debug.render();

      // ----- Test -----
      hitbox.render();
      // ----- Test -----
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
      player.y -= ((player.y + player.height + 8) % 8) - 1;
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
    player.playAnimation('playerRun');
  } else if (jumping) {
    player.playAnimation('playerJump');
  } else if (falling) {
    player.playAnimation('playerFall');
  } else if (sliding) {
    player.playAnimation('playerSlide');
  } else {
    player.playAnimation('playerIdle');
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
   x1=x - 4;
   x2=x;
   y1=y+16;
   y2=y+h-4;
  } else if (direction === "right") { 
     x1=x+w-4;
     x2=x+w;
     y1=y+16;
     y2=y+h-4;
  } else if (direction === "up") {
     x1=x+8;
     x2=x+w-8;
     y1=y+20;
     y2=y+16;
  } else if (direction === "down") { 
     x1=x+8;
     x2=x+w-8;
     y1=y+h;
     y2=y+h;
  }

  // ----- Test -----
  x1r = x1;
  x2r = x2;
  y1r = y1;
  y2r = y2;
  // ----- Test -----

  if (tileEngine.tileAtLayer('ground', {x: x1, y: y1}) === 1 ||
    tileEngine.tileAtLayer('ground', {x: x1, y: y2}) === 1 ||
    tileEngine.tileAtLayer('ground', {x: x2, y: y1}) === 1 ||
    tileEngine.tileAtLayer('ground', {x: x2, y: y2}) === 1) {
      return true;
  } else {
    return false;
  }
}


//
//
// ***** /arrows *****
//
// 

function updateArrows() {
  arrows.forEach((arrow, i)=> {
    arrow.update();
    arrow.playAnimation('arrow');
    
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
    //y: y + 12,
    dx: 6 * dir,
    scaleX: dir,
    scaleY: 1,
    width: 32,
    height: 32,
    anchor: {x: 0, y: 0},
    //color: '#AB5236',
    animations: spriteSheet.animations,
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
// ***** /people *****
//
// 

function movePeople() {
  people.forEach((person, i)=> {
    person.update();
    
    
    person.dy += gravity;
    person.dx *= friction;

    
    person.dx -= person.acc * person.scaleX;

    // jump
    if (tileEngine.tileAtLayer('ground', person) === 2) {
      if (person.checkJump) {
        person.checkJump = false;
        if (shouldJump()) {
          person.dy -= person.boost;
        }
      }
    } else {
      person.checkJump = true;
    }

    // check collision up and down
    if (person.dy > 0) { // falling      
      person.dy = clamp(-person.max_dy, person.max_dy, person.dy);
      person.acc = 0.11;
      if (collide_map(person, "down")) {
        person.dy = 0;
        person.y -= ((person.y + person.height + 8) % 8) - 1;
      }
    } else if (person.dy < 0) {


        if (collide_map(person, "up")) {
          person.dy = 0;
        }
    }

    // check collision left and right
    if (person.dx < 0 && person.dy <= 0) {
      person.dx = clamp(-person.max_dx, person.max_dx, person.dx);
      
      if (collide_map(person, "left")) {
        person.scaleX = -1
      }
    } else if (person.dx > 0 && person.dy <= 0) {
      person.dx = clamp(-person.max_dx, person.max_dx, person.dx);
      
      if (collide_map(person, "right")) {
        person.scaleX = 1
      }
    }

    person.x += person.dx;
    person.y += person.dy;

    hitPerson(person);

    if (person.health <= 0) {
      destroyGuard(i);
    }

    if (collides(person, player)) {
      console.log("guard touched the player")
      //destroy(i);
      //g.shake = 9;
    }

    switch (person.type) {
      case 'guard':
        person.playAnimation('guard');
        break;
      case 'lady':
        person.playAnimation('lady');
        break;
      case 'old':
        person.playAnimation('old');
        break;
      default:
        break;
    }
    
  });

}

function renderPeople() {
  people.forEach(person => {
    person.render();
  });
}

function spawnPerson(col, row, type) {
  let person = Sprite({
    x: 32 * col,
    y: 32 * row,
    dx: 0,
    dy: 0,
    max_dx: 2,
    max_dy: 4,
    width: 32,
    height: 32,
    scaleX: randDir(),
    anchor: {x: 0.5, y: 0},
    health: 5,
    acc: 0.11,
    boost: 4.7,
    checkJump: true,
    animations: spriteSheet.animations,
    type: type
  });

  people.push(person);
}

function hitPerson(person) {
  arrows.forEach((arrow) => {
    if (collides(arrow, person)) {
      if (person.type === 'guard') {
        person.health -= 1;
      }
      arrow.ttl = 0; 
    }
  });
}
//
//
// ***** /guards *****
//
//


function destroyGuard(guard) {
  people.splice(guard, 1);
}


function randDir() {
  return Math.random() < 0.5 ? -1 : 1
}


//
//
// ***** helpers *****
//
// 

function shouldJump() {
  return Math.random() < 0.75 ? true : false;
}