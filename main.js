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

let lives = 3;
let cash = 0;

// ----- Test -----
let x1r = 0;
let y1r = 0;
let x2r = 0;
let y2r = 0;

let hitbox = Sprite({
  color: 'cyan',
});

let pBox = Sprite({
  x: 256,
  y: 256,
  width: 250,
  height: 180,
  anchor: {x: 0.5, y: 0.5},
  color: '#1D2B53',
});

// ----- Test -----

let T = 0;
let state = "title";
let menuPointer = 0;
let menu = [
  "steal from the rich",
  "music",
  "sounds",
  "controls"
];
let lastState = ""
let music = 1;
let fx = 1;

const l1 = [
  ,,,,,,,,,,,,,,1,1,
  1,,,,,,,,,,,,,,,1,
  1,,,,,,,,,,,,,,,1,
  1,,,,,,,,,,1,1,1,1,1,1,
  1,,,,,,,,5,,,,,,,1,
  1,,,,1,1,1,1,1,1,1,1,1,,,1,
  1,1,1,,,,,,,,,,,,,1,
  1,,,5,,,,,,,,,,,,1,
  1,,,1,1,1,1,1,1,1,1,,,,,1,
  1,,,,,,,,,,,,5,,,1,
  1,1,1,,,,,,,,,5,1,1,1,1,
  1,,,,,,,,,,1,1,,,,1,
  1,,,,,,,,,5,,,,,,1,
  1,,,1,1,1,1,1,1,1,1,1,1,,,1,
  1,,5,,,,,,,,,,,5,,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

const ttm = [
  ,,,,,,,,,,,,,,,,
  ,,,,,,,,,,,,,,,,
  ,,,,,,,,,,,,,,,,
  ,,3,1,1,1,1,1,1,1,1,2,1,2,,,
  ,,3,1,,,1,,1,1,1,1,1,2,,,
  ,,3,1,1,1,1,1,1,1,1,1,1,2,,,
];


let { canvas, context } = init();
initKeys();

canvas.style.position = 'absolute';
camera(10, 10);

let spriteSheet;
let player;
let sIcons = [];
let arrows = [];
let people = [];
let coins = [];
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
      }, 
      {
        name: "bg",
        data: ttm
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
      },
      heart: {
        frames: 16
      },
      coin: {
        frames: 17
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
    invisible: 0,
    health: lives,
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

      if (state === "title") {
        updateTitleScreen();
      } else if (state === "controls") {
        updateConScreen();
      } else if (state === "pause") {
        updatePause();
      } else if (state === "game") {
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
        updateSIcons();

        updateArrows();
        movePeople();
        updateCoins();

        menuPointer = 0;
      }
    },

    render: function() {
      if (state === "title") {
        titleScreen();
      } else if (state === "controls") {
        conScreen();
      } else if (state === "pause") {
        pause();
      } else if (state === "game") {
        renderGame();
      }
    }
  });

  loop.start();
})();

function camera(left, top) {
  canvas.style.left = left + "px";
  canvas.style.top = top + "px";
}

function renderGame() {
  tileEngine.renderLayer("ground");
  player.render();
  renderSIcons();
  arrows.forEach(arrow => {
    arrow.render();
  });
  
  renderPeople();
  renderCoins();

  // ----- Test -----
  hitbox.render();
  // ----- Test -----
}

//
//
// ***** /player *****
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
  onKey('x', function() {
    if (landed) {
    player.dy -= boost;
    landed = false;
  }});

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

  // invisibility
  if (player.invisible > 0) {
    if (T % 10 > 7) {
      player.color = '#000000';
    } else{
    player.color = '';
    }

    if (T % 60 === 0) {
      player.invisible--;
    }
  }

  // pause
  onKey(['esc', 'enter'], function() {
    lastState = state;
    state = 'pause';
    menu.push("reset");
  });
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

function playerHit() {
  player.invisible = 3;
  player.health--;

  if (player.health < 1) {
    state = "title";
  }
  
  sIcons.shift();
  reorgSIcons();
}

function initStatus(health) {
  for (let col = 0; col < health; col++) {
    let heart = Sprite({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      type: 'heart',
      animations: spriteSheet.animations
    });
    
    sIcons.push(heart);
  }

  if (sIcons.length === health ) {
    let coin = Sprite({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      type: 'coin',
      animations:spriteSheet.animations
    });
    sIcons.push(coin);
  }

  reorgSIcons();
}

// shift icons in the screen after an icon is removed/added
function reorgSIcons() {
  let extraPixels = 0;
  sIcons.forEach((icon, col) => {
    icon.x = 32 * col - extraPixels;
    extraPixels += 8;
  });
}

function updateSIcons() {
  sIcons.forEach(icon => {
    icon.update();
    icon.playAnimation(icon.type);
  });
}

function renderSIcons() {
  sIcons.forEach(icon => {
    icon.render();
  });

  print(normal, 4, "*" + cash, (sIcons.length * 32) - (sIcons.length * 8) + 12, 8, '#FFF1E8');
}

//
//
// ***** /map *****
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

    deleteArrow(arrow, i);
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

function deleteArrow(arrow, i) {
  if (i > -1 && arrow.ttl <= 0) {
    arrows.splice(i, 1);
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
    if (tileEngine.tileAtLayer('ground', person) === 5) {
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

    if (collides(person, player) &&
      !player.invisible &&
      person.type === 'guard') {
      playerHit();
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
      } else {
        spawnCoins(1, person.x, person.y);
      }
      arrow.ttl = 0; 
    }
  });
}

//
//
// ***** /coins *****
//
// 

function spawnCoins(amount, x, y) {
  for (let i = 0; i < amount; i++) {
    let coin = Sprite({
      x: x,
      y: y,
      dy: 0,
      max_dy: 4,
      width: 32,
      height: 32,
      bounce: 3,
      boost: 3,
      ttl: 200,
      anchor: { x: 0.5, y: 0 },
      animations: spriteSheet.animations
    });

    coins.push(coin);
    coin.dy -= coin.boost; // shoot coin up
  }
}

function updateCoins() {
  coins.forEach((coin, i) => {
    coin.update();
    coin.playAnimation('coin');

    coin.dy += gravity;

    // check collision up and down
    if (coin.dy > 0) { // falling      
      coin.dy = clamp(-coin.max_dy, coin.max_dy, coin.dy);
      
      if (collide_map(coin, "down")) {
        if (coin.bounce > 0 && coin.dy < 1) {
          coin.boost *= 0.6;
          coin.bounce--;
          coin.dy -= coin.boost;
        } else {
          coin.dy = 0;
          coin.y -= ((coin.y + coin.height + 8) % 8) - 1;
        }
        
      }
    } else if (coin.dy < 0) {
        if (collide_map(coin, "up")) {
          coin.dy = 0;
        }
    }

    coin.y += coin.dy;

    // blink coins before they disappear
    if (coin.ttl < 40) {
      if (T % 10 > 6) {
        coin.color = '#000000';
      } else {
        coin.color = '';
      }
    }

    // player collects the coin
    if (collides(coin, player)) {
      coin.ttl = 0;
      cash += 100;
    }

    deleteCoins(coin, i);
  });
}

function renderCoins() {
  coins.forEach(coin => {
    coin.render();
  });
}

function deleteCoins(coin, i) {
  if (i > -1 && coin.ttl <= 0) {
    coins.splice(i, 1);
  }
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
// ***** /states *****
//
//

function updateTitleScreen() {
  onKey('arrowup', function() {
    menuPointer--;
    if (menuPointer < 0) menuPointer = menu.length - 1;
  });

  onKey('arrowdown', function() {
    menuPointer++;
    if (menuPointer > menu.length - 1) menuPointer = 0;
  });

  menuControl();

  T++;
}

function titleScreen() {
  lastState = "title";
  tileEngine.renderLayer("bg");

  print(title, 8, "WANTED", 106, 86 + 28, "#000000");
  print(title, 8, "WANTED", 110, 80 + 28, "#AB5236");

  menu.forEach((label, i) => {
    if (menuPointer === i) {
      print(normal, 4, ">", 100 + 4*Math.sin(T/12), 280 + i*28, "#008751");
      print(normal, 4, label, 130, 280 + i*28, "#FFF1E8", "#008751");
    } else {
      print(normal, 4, label, 130, 280 + i*28, "#FFF1E8");
    }
  });

  print(normal, 4, "2023 Isaac Benitez", 120, 450, "#C2C3C7");
}

function updateConScreen() {
  onKey(['esc', 'enter'], function() {
    state = lastState;
  });
}

function conScreen() {
  print(normal, 4, "Z      Shoot", 120, 250, "#FFF1E8");
  print(normal, 4, "X      Jump", 120, 278, "#FFF1E8");
  print(normal, 4, "<      Left", 120, 306, "#FFF1E8");
  print(normal, 4, ">      Right", 120, 334, "#FFF1E8");
  print(normal, 4, "Ent  Select", 120, 364, "#FFF1E8");
  print(normal, 4, "ESC  back", 120, 388, "#FFF1E8");

}

function updatePause() {
  onKey('esc', function() {
    state = lastState;
    menu.push("reset");
  });
  
  menuControl();
}

function pause() {
  menu[0] = "continue";
  renderGame();
  pBox.render();
  menu.forEach((label, i) => {
    if (menuPointer === i) {
      print(normal, 4, ">", 180, 190 + i*28);
      print(normal, 4, label, 208, 190 + i*28, "#FFF1E8");
    } else {
      print(normal, 4, label, 200, 190 + i*28, "#FFF1E8");
    }
  });
}

function menuControl() {
  onKey(['enter', 'z', 'x', 'space'], function() {
    switch (menuPointer) {
      case 0:
        if (state === "title") {
          initGame();
        } else {
          menu.pop();
        }
        state = "game";
        menuPointer = 0;
        break;
      case 1:
        music = 1 - music;
        break;
      case 2:
        fx = 1 - fx;
        break;
      case 3:
        lastState = state;
        state = "controls";
        menuPointer = 0;
        break;
      default: // reset
        lastState = "title";
        state = "title";
        menuPointer = 0;
        menu[0] = "Steal from the rich";
        menu.pop();
        break;
    }
  });

  (music) ? menu[1] = "music on" : menu[1] = "music off";
  (fx) ? menu[2] = "Sound on" : menu[2] = "Sound off";
}

//
//
// ***** /helpers *****
//
// 

function initGame() {
  T = 0;
  player.health = lives;
  cash = 0;
  sIcons = [];
  initStatus(player.health);
}

function shouldJump() {
  return Math.random() < 0.75 ? true : false;
}

function print(font, size, string, posX, posY, color, bgColor) {
  context.imageSmoothingEnabled = false;

  let needed = [];
  string = string.toUpperCase();

  for (let i = 0; i < string.length; i++) {
    let letter = font[string.charAt(i)];
    if (letter) {
        needed.push(letter);
    }
  }
  
  context.fillStyle = color;
  let currX = 0;
  for (let i = 0; i < needed.length; i++) {
      let letter = needed[i];
      let currY = 0;
      let addX = 0;

      if (bgColor) {
        context.fillStyle = bgColor;
        context.fillRect(posX + currX - 4,
          posY + currY - 4, 5 * size, 28);
          context.fillStyle = color;
      }

      for (let y = 0; y < letter.length; y++) {
          let row = letter[y];
          for (let x = 0; x < row.length; x++) {
              if (row[x]) {
                  context.fillRect(posX + currX + x * size,
                    posY + currY, size, size);
              }
          }
          addX = Math.max(addX, row.length * size);
          currY += size;
      }
      currX += size + addX;
  }
}


//
//
// ***** /font *****
//
// 

const normal = {
  '0': [
      [1,1,1],
      [1,,1],
      [1,,1],
      [1,,1],
      [1,1,1],
  ],
  '1': [
    [1,1],
    [,1],
    [,1],
    [,1],
    [1,1,1],
  ],
  '2': [
    [1,1,1],
    [,,1],
    [1,1,1],
    [1],
    [1,1,1],
  ],
  '3': [
    [1,1,1],
    [,,1],
    [,1,1],
    [,,1],
    [1,1,1],
  ],
  '4': [
    [1,,1],
    [1,,1],
    [1,1,1],
    [,,1],
    [,,1],
  ],
  '5': [
    [1,1,1],
    [1],
    [1,1,1],
    [,,1],
    [1,1,1],
  ],
  '6': [
    [1],
    [1],
    [1,1,1],
    [1,,1],
    [1,1,1],
  ],
  '7': [
    [1,1,1],
    [,,1],
    [,,1],
    [,,1],
    [,,1],
  ],
  '8': [
    [1,1,1],
    [1,,1],
    [1,1,1],
    [1,,1],
    [1,1,1],
  ],
  '9': [
    [1,1,1],
    [1,,1],
    [1,1,1],
    [,,1],
    [,,1],
  ],
  'A': [
      [1,1,1],
      [1,,1],
      [1,1,1],
      [1,,1],
      [1,,1]
  ],
  'B': [
      [1,1,1],
      [1, ,1],
      [1,1],
      [1,,1],
      [1,1,1]
  ],
  'C': [
    [,1,1],
    [1],
    [1],
    [1],
    [,1,1]
  ],
  'D': [
    [1,1],
    [1,,1],
    [1,,1],
    [1,,1],
    [1,1,1]
  ],
  'E': [
    [1,1,1],
    [1],
    [1,1],
    [1],
    [1,1,1]
  ],
  'F': [
    [1,1,1],
    [1],
    [1,1],
    [1],
    [1]
  ],
  'G': [
    [,1,1],
    [1],
    [1],
    [1,,1],
    [1,1,1]
  ],
  'H': [
    [1,,1],
    [1,,1],
    [1,1,1],
    [1,,1],
    [1,,1]
  ],
  'I': [
    [1,1,1],
    [,1],
    [,1],
    [,1],
    [1,1,1]
  ],
  'J': [
    [1,1,1],
    [,1],
    [,1],
    [,1],
    [1,1]
  ],
  'K': [
    [1,,1],
    [1,,1],
    [1,1],
    [1,,1],
    [1,,1]
  ],
  'L': [
    [1],
    [1],
    [1],
    [1],
    [1,1,1]
  ],
  'M': [
    [1,1,1],
    [1,1,1],
    [1,,1],
    [1,,1],
    [1,,1]
  ],
  'N': [
    [1,1],
    [1,,1],
    [1,,1],
    [1,,1],
    [1,,1]
  ],
  'O': [
    [,1,1],
    [1,,1],
    [1,,1],
    [1,,1],
    [1,1]
  ],
  'P': [
    [1,1,1],
    [1,,1],
    [1,1,1],
    [1],
    [1]
  ],
  'Q': [
    [,1],
    [1,,1],
    [1,,1],
    [1,1],
    [,1,1]
  ],
  'R': [
    [1,1,1],
    [1,,1],
    [1,1],
    [1,,1],
    [1,,1]
  ],
  'S': [
    [,1,1],
    [1],
    [1,1,1],
    [,,1],
    [1,1]
  ],
  'T': [
    [1,1,1],
    [,1],
    [,1],
    [,1],
    [,1]
  ],
  'U': [
    [1,,1],
    [1,,1],
    [1,,1],
    [1,,1],
    [,1,1]
  ],
  'V': [
    [1,,1],
    [1,,1],
    [1,,1],
    [1,1,1],
    [,1]
  ],
  'W': [
    [1,,1],
    [1,,1],
    [1,,1],
    [1,1,1],
    [1,1,1]
  ],
  'X': [
    [1,,1],
    [1,,1],
    [,1],
    [1,,1],
    [1,,1]
  ],
  'Y': [
    [1,,1],
    [1,,1],
    [1,1,1],
    [,,1],
    [1,1,1]
  ],
  'Z': [
    [1,1,1],
    [,,1],
    [,1],
    [1],
    [1,1,1]
  ],
  '*': [
    [],
    [1,,1],
    [,1],
    [1,,1]
  ],
  ' ': [
    [,]
  ],
  '<': [
    [,,1],
    [,1,1],
    [1,1,1],
    [,1,1],
    [,,1]
  ],
  '>': [
    [1],
    [1,1],
    [1,1,1],
    [1,1],
    [1]
  ]
}

const title = {
  'W': [
    [1,,1,1,,1,1],
    [1,1,,1,1,,1,1],
    [1,1,,1,1,,1,1],
    [1,1,,1,1,,1,1],
    [1,1,,1,1,,1,1],
    [1,1,,1,1,,1],
    [1,1,1,1,1,1,1],
    [,1,1,,1,1],
  ],
  'A': [
    [1,1,1,1,1],
    [,1,,1,1],
    [1,1,,1,1],
    [1,1,1,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [,,,1]
  ],
  'N': [
    [1,,1,1],
    [1,1,1,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1],
    [1,1,,1],
    [1,1,,1,1]
  ],
  'T': [
    [1,1,1,1,1],
    [1,1,1,1],
    [,,1],
    [,1,1],
    [,1,1],
    [,1,1],
    [,1,1],
    [,,1,1]
  ],
  'E': [
    [,,1,1,1],
    [,1,,1,1],
    [1,1],
    [1,1,,,1],
    [1,1,1,1,1],
    [1,1],
    [1,1,,,1],
    [,1,1,1]
  ],
  'D': [
    [1,1,1,1],
    [1,1,1,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,1,,1,1],
    [1,,1,1]
  ]
}
