'use strict';

const baseW = 1000;
const baseH = 500;
let c;

function setup() {
  c = color(245, 172, 151);
  createCanvas(baseW, baseH);
  
  fill(c);
  noStroke();
  
  generate(1);
}


let seed = 0;
let divisionLimit = 18;

// chances
let c_divide = 0.5; // divide a cell further?
let c_fill = 0.66; // fill a cell? (vs. leaving it empty)
let c_twoDivisions = 0.5; // use two divisions? (vs. three)


let displayMode = 0;
let showBalls = true;
let showGridFilled = false;
let showGridEmpty = false;
let skipPartial = false;

function nextDisplayMode() {
  displayMode = (displayMode + 1) % 5;
  console.log("displayMode=" + displayMode);
  switch (displayMode) {
    case 0: showBalls = true;  showGridFilled = false; showGridEmpty = false; break;
    case 1: showBalls = true;  showGridFilled = true;  showGridEmpty = false; break;
    case 2: showBalls = true;  showGridFilled = true;  showGridEmpty = true;  break;
    case 3: showBalls = false; showGridFilled = true;  showGridEmpty = false; break;
    case 4: showBalls = false; showGridFilled = true;  showGridEmpty = true;  break;
  }
}

let runCount = 0;
let cellCount = 0;
let fillCount = 0;
let lastSeed = 0;

function generate(seed = 0) {
  console.log("generating. seed=" + seed);
  Math.seedrandom(seed);
  lastSeed = seed;
  runCount = 0;
  cellCount = 0;
  fillCount = 0;
  clear();
  runOnCell(0, 0, baseW-1, baseH-1);
  info(`seed: ${seed}\ndivisionLimit: ${divisionLimit}\ncells: ${cellCount}\nfilled: ${fillCount}`);
}

function regenerate() {
  generate(lastSeed);
}

function generateRandom() {
  generate(Date.now());
}

function runOnCell(left, top, width, height, depth=0) {
  if (width < baseW/divisionLimit) return;
  
  runCount++;
  logd(`running on ${Math.floor(left)}, ${Math.floor(top)}, ${Math.floor(width)}, ${Math.floor(height) }`, depth);
  
  let divs = decide(c_twoDivisions) ? 2 : 3; // number of divisions
  let canDivide = Math.floor(width/divs) >= baseW/divisionLimit;
  let shouldDivide = decide(c_divide);
  if (runCount == 1) { shouldDivide = true; }
  
  if (canDivide && shouldDivide) { // recur
    logd("-> divide by " + divs, depth);
    let a = width / divs; // side length of new cell
    for ( let j=0; j<Math.ceil(height/a); j++ ) {
      for ( let i=0; i<divs; i++) {
        runOnCell(left + i*a, top + j*a, a, a, depth+1);
      }
    }
  } else {
    let shouldFill = decide(c_fill);
    if (skipPartial) { if (left+width > baseW || top+height > baseH) return; }
    cellCount++;
    if (shouldFill) {
      logd("-> fill", depth);
      fillCount++;
      if (showBalls) {
        fill(c);
        noStroke();
        ellipseMode(CORNER);
        ellipse(left, top, width, width);
      }
      if (showGridFilled) {
        noFill();
        stroke(c);
        rect(left, top, width, height)
      }
    } else {
      logd("-> leave empty", depth);
      if (showGridEmpty) {
        noFill();
        stroke(c);
        rect(left, top, width, height)
      }
    }
  }
}

function decide(chance = 0.5) {
  return Math.random() < chance;
}

function draw() {
  // ellipse(mouseX, mouseY, 80, 80);
}

function info(text) {
  document.querySelector('#info').innerHTML = text;
}

function logd(text, depth=0) {
  console.log("   ".repeat(depth) + text);
}

document.addEventListener('keydown', e => {
  console.log(e.key, e.keyCode, e);
  
  if (e.key == 'f') { // f .. fullscreen
    if (!document.webkitFullscreenElement) {
      document.querySelector('body').webkitRequestFullscreen();
    } else { document.webkitExitFullscreen(); }
  }
  
  else if (e.key == ' ') {
    generateRandom();
  }
  
  else if (e.key == 'g') {
    nextDisplayMode();
    regenerate();
  }
  
  else if (e.key == 'h') {
    skipPartial = !skipPartial;
    regenerate();
  }
  
  else if (e.key == 'ArrowUp') {
    divisionLimit++;
    regenerate();
  }
  else if (e.key == 'ArrowDown') {
    divisionLimit--;
    if (divisionLimit < 2) { divisionLimit = 2; }
    regenerate();
  }
});