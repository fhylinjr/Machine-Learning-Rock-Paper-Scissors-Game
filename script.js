// Name any p5.js functions we use in the global so Glitch can recognize them.
/* global createCanvas, random, background, fill, color, rect, ellipse, square, image
stroke, noStroke, noFill, strokeWeight, colorMode,  width, height, text, HSB, loadImage, loadSound, noLoop, mousePressed, song.loop, setVolume,
line, mouseX, mouseY, mouseIsPressed, windowWidth, windowHeight, sqrt, round, textSize,
frameRate, gameIsOver, rate, gameIsOver2, keyCode, UP_ARROW, DOWN_ARROW,ml5, RIGHT_ARROW, LEFT_ARROW, BACKSPACE, createCapture, VIDEO, collideRectRect */

let backgroundColor,
  scissors,
  rock,
  paper,
  scissors2,
  rock2,
  paper2,
  score1,
  score2,
  paper1,
  rock1,
  scissors1,
  randomCompMoves,
  itemchoices;
let imgRock, imgPaper, imgScissors;
let reverseList = [];
let match;
let song;
let clicked;
// The video
let video;
// For displaying the label
let label = "waiting...";
// The classifier
let classifier;
let modelURL = "https://teachablemachine.withgoogle.com/models/H2MKHfuWD/";

// STEP 1: Load the model!
function preload() {
  classifier = ml5.imageClassifier(modelURL + "model.json");
  song = loadSound(
    "https://cdn.glitch.com/ca3ba5fb-86f4-44d6-81a4-5371fec997bd%2F1-35%20Dream%20Land%20N64.mp3?v=1596042163984"
  );
}

function setup() {
  // Canvas & color settings.
  imgRock = loadImage(
    "https://cdn.glitch.com/ca3ba5fb-86f4-44d6-81a4-5371fec997bd%2FRock.png?v=1595942459497"
  );
  imgPaper = loadImage(
    "https://cdn.glitch.com/ca3ba5fb-86f4-44d6-81a4-5371fec997bd%2FPaper.png?v=1595956603488"
  );
  imgScissors = loadImage(
    "https://cdn.glitch.com/ca3ba5fb-86f4-44d6-81a4-5371fec997bd%2FScissors.png?v=1595956468221"
  );
  width = 400;
  height = 400;
  createCanvas(width, height);
  // Create the video
  video = createCapture(VIDEO);
  video.size(400, 400);
  //video.hide();

  // STEP 2: Start classifying
  classifyVideo();

  colorMode(HSB, 360, 100, 100);
  backgroundColor = 95;
  gameIsOver = false;
  clicked = false;

  // Set frame rate. This makes the scren refresh more or less so move faster or slower.
  frameRate(5);

  // Initialize game variables.
  scissors = new Scissors(width / 5);
  scissors2 = new Scissors((4 * width) / 5);
  rock = new Rock(width / 5);
  rock2 = new Rock((4 * width) / 5);
  paper = new Paper(width / 5);
  paper2 = new Paper((4 * width) / 5);
  score1 = 0;
  score2 = 0;
  randomCompMoves = ["scissors2", "rock2", "paper2"];
  paper1 = "paper";
  rock1 = "rock";
  scissors1 = "scissors";
  itemchoices = [];
}

function draw() {
  background(backgroundColor);
  image(video, 0, 400);
  //textSize(32);
  fill(0);
  text(label, 350, 380);
  // The snake performs the following four methods:
  if (gameIsOver == false) {
    if (clicked == false) {
      text("Click with the mouse to start the Song", 100, 150);
    }
    stroke("black");
    line(width / 2, 0, width / 2, height);
    scissors.showSelf();
    scissors2.showSelf();
    rock.showSelf();
    rock2.showSelf();
    paper.showSelf();
    paper2.showSelf();

    if (itemchoices[0] === "rock") {
      rock.moveSelf();
    } else if (itemchoices[0] === "paper") {
      paper.moveSelf();
    } else if (itemchoices[0] === "scissors") {
      scissors.moveSelf();
    }
    if (itemchoices[1] === "rock2") {
      rock2.moveSelf();
    } else if (itemchoices[1] === "paper2") {
      paper2.moveSelf();
    } else if (itemchoices[1] === "scissors2") {
      scissors2.moveSelf();
    }
    if (scissors.middle || rock.middle || paper.middle) {
      itemComparer();
    }
    for (let i = 0; i < reverseList.length; i++) {
      reverseList[i].reversemoveSelf();
      reverseList[i].middle = false;
      if (reverseList[0].start && reverseList[1].start) {
        reverseList.length = 0;
        chosen = false;
      }
    }
    displayScore();
    winGame();
  } else if (gameIsOver == true) {
    gameOver();
  }
}

// STEP 2 classify the video!
function classifyVideo() {
  classifier.classify(video, gotResults);
}

// STEP 3: Get the classification!
function gotResults(error, results) {
  // Something went wrong!
  if (error) {
    console.error(error);
    return;
  }
  // Store the label and classify again!
  label = results[0].label;
  chooseObject();
  classifyVideo();
}

function displayScore() {
  fill(0); //gives it color black
  noStroke(); //removes border
  text(`Player: ${score1}`, 20, 20);
  text(`Computer: ${score2}`, 300, 20);
}

class Scissors {
  constructor(x) {
    this.size = 40;
    this.x = x;
    this.y = height - 100;
    this.speed = 10;
    this.middle = false;
    this.start = true;
    this.take = true;
  }

  moveSelf() {
    this.start = false;
    if (this.x < width / 2 - 60) {
      this.x += this.speed;
      this.y -= this.speed;
    } else if (this.x > width / 2 + 20) {
      this.x -= this.speed;
      this.y -= this.speed;
    } else {
      this.middle = true;
    }
  }
  reversemoveSelf() {
    if (width / 5 < this.x && this.x < width / 2) {
      console.log("Left");
      this.x -= this.speed;
      this.y += this.speed;
    } else if (width / 2 < this.x && this.x < (4 * width) / 5) {
      console.log("Right");
      this.x += this.speed;
      this.y += this.speed;
    } else {
      this.middle = false;
      this.start = true;
    }
  }

  showSelf() {
    fill(120, 100, 100);
    //noFill();
    image(imgScissors, this.x, this.y, this.size, this.size);
  }
}

class Rock {
  constructor(x) {
    this.size = 40;
    this.x = x;
    this.y = height - 300;
    this.speed = 10;
    this.middle = false;
    this.start = true;
  }

  moveSelf() {
    this.start = false;
    if (this.x < width / 2 - 60) {
      this.x += this.speed;
      this.y += this.speed;
    } else if (this.x > width / 2 + 20) {
      this.x -= this.speed;
      this.y += this.speed;
    } else {
      this.middle = true;
    }
  }
  reversemoveSelf() {
    if (width / 5 < this.x && this.x < width / 2) {
      this.x -= this.speed;
      this.y -= this.speed;
    } else if (width / 2 < this.x && this.x < (4 * width) / 5) {
      this.x += this.speed;
      this.y -= this.speed;
    } else {
      this.middle = false;
      this.start = true;
    }
  }

  showSelf() {
    fill(0, 100, 100);
    //noFill();
    image(imgRock, this.x, this.y, this.size, this.size);
  }
}

class Paper {
  constructor(x) {
    this.size = 40;
    this.x = x;
    this.y = height - 200;
    this.speed = 10;
    this.middle = false;
    this.start = true;
  }

  moveSelf() {
    this.start = false;
    this.take = true;
    if (this.x < width / 2 - 60) {
      this.x += this.speed;
    } else if (this.x > width / 2 + 20) {
      this.x -= this.speed;
    } else {
      this.middle = true;
    }
  }
  reversemoveSelf() {
    if (width / 5 < this.x && this.x < width / 2) {
      this.x -= this.speed;
    } else if (width / 2 < this.x && this.x < (4 * width) / 5) {
      this.x += this.speed;
    } else {
      this.middle = false;
      this.start = true;
    }
  }

  showSelf() {
    fill(60, 100, 100);
    //noFill();
    image(imgPaper, this.x, this.y, this.size, this.size);
  }
}

let chosen = false;
function chooseObject() {
  if (chosen) {
    return;
  }
  console.log("key pressed: ", label);
  let select = random(randomCompMoves);
  if (label === "paper") {
    // paper.moveSelf();
    // if (select === "rock2"){rock2.moveSelf();}
    // else if (select === "paper2"){paper2.moveSelf();}
    // else if (select === "scissors2"){scissors2.moveSelf();}
    chosen = true;
    itemchoices.push(paper1);
    itemchoices.push(select);
    console.log(itemchoices);
    //itemComparer();
  } else if (label === "scissors") {
    // scissors.moveSelf();
    // if (select === "rock2"){rock2.moveSelf();}
    // else if (select === "paper2"){paper2.moveSelf();}
    // else if (select === "scissors2"){scissors2.moveSelf();}
    chosen = true;
    itemchoices.push(scissors1);
    itemchoices.push(select);
    console.log(itemchoices);
    //itemComparer();
  } else if (label === "rock") {
    // rock.moveSelf();
    // if (select === "rock2"){rock2.moveSelf();}
    // else if (select === "paper2"){paper2.moveSelf();}
    // else if (select === "scissors2"){scissors2.moveSelf();}
    chosen = true;
    itemchoices.push(rock1);
    itemchoices.push(select);
    console.log(itemchoices);
    //itemComparer();
  } else {
    console.log("wrong key");
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE) {
    restartGame();
  }
}

function itemComparer() {
  if (itemchoices[0] === "paper" && itemchoices[1] === "paper2") {
    score1 += 0;
    score2 += 0;
    fill(0);
    noStroke();
    text("Paper draws Paper !", 120, 20);
    reverseList.push(paper);
    reverseList.push(paper2);
  } else if (itemchoices[0] === "rock" && itemchoices[1] === "rock2") {
    score1 += 0;
    score2 += 0;
    fill(0);
    noStroke();
    text("Rock draws Rock !", 120, 20);
    reverseList.push(rock);
    reverseList.push(rock2);
    // rock.reversemoveSelf();
    // rock2.reversemoveSelf();
  } else if (itemchoices[0] === "scissors" && itemchoices[1] === "scissors2") {
    score1 += 0;
    score2 += 0;
    fill(0);
    noStroke();
    text("Scissors draws Scissors !", 120, 20);
    reverseList.push(scissors);
    reverseList.push(scissors2);
    // scissors.reversemoveSelf();
    // scissors2.reversemoveSelf();
  } else if (itemchoices[0] === "paper" && itemchoices[1] === "rock2") {
    score1 += 1;
    score2 += 0;
    fill(0);
    noStroke();
    text("Paper covers Rock ! !", 120, 20);
    reverseList.push(paper);
    reverseList.push(rock2);
    // paper.reversemoveSelf();
    // rock2.reversemoveSelf();
  } else if (itemchoices[0] === "paper" && itemchoices[1] === "scissors2") {
    score1 += 0;
    score2 += 1;
    fill(0);
    noStroke();
    text("Scissors cuts Paper !", 120, 20);
    reverseList.push(paper);
    reverseList.push(scissors2);
    // paper.reversemoveSelf();
    // scissors2.reversemoveSelf();
  } else if (itemchoices[0] === "rock" && itemchoices[1] === "paper2") {
    score1 += 0;
    score2 += 1;
    fill(0);
    noStroke();
    text("Paper covers Rock !", 120, 20);
    reverseList.push(rock);
    reverseList.push(paper2);
    // rock.reversemoveSelf();
    // paper2.reversemoveSelf();
  } else if (itemchoices[0] === "rock" && itemchoices[1] === "scissors2") {
    score1 += 1;
    score2 += 0;
    fill(0);
    noStroke();
    text("Rock smashes Scissors !", 120, 20);
    reverseList.push(rock);
    reverseList.push(scissors2);
    // rock.reversemoveSelf();
    // scissors2.reversemoveSelf();
  } else if (itemchoices[0] === "scissors" && itemchoices[1] === "paper2") {
    score1 += 1;
    score2 += 0;
    fill(0);
    noStroke();
    text("Scissors cut Paper !", 120, 20);
    reverseList.push(scissors);
    reverseList.push(paper2);
    // scissors.reversemoveSelf();
    // paper2.reversemoveSelf();
  } else if (itemchoices[0] === "scissors" && itemchoices[1] === "rock2") {
    score1 += 0;
    score2 += 1;
    fill(0);
    noStroke();
    text("Rock smashes Scissors !", 120, 20);
    reverseList.push(scissors);
    reverseList.push(rock2);
    // scissors.reversemoveSelf();
    // rock2.reversemoveSelf();
  }
  itemchoices.length = 0;
}

function restartGame() {
  // Canvas & color settings.
  background(backgroundColor);
  stroke("black");
  line(width / 2, 0, width / 2, height);

  // Initialize game variables.
  scissors = new Scissors(width / 5);
  scissors2 = new Scissors((4 * width) / 5);
  rock = new Rock(width / 5);
  rock2 = new Rock((4 * width) / 5);
  paper = new Paper(width / 5);
  paper2 = new Paper((4 * width) / 5);
  scissors.showSelf();
  scissors2.showSelf();
  rock.showSelf();
  rock2.showSelf();
  paper.showSelf();
  paper2.showSelf();
  score1 = 0;
  score2 = 0;
  gameIsOver = false;
  song.stop();
  song.loop();

  image(video, 0, 0);
  //textSize(32);
  fill(0);
  text(label, 350, 380);
}

function gameOver() {
  //What did you want to do after game over Restart the entire game?
  if (match === "W") {
    textSize(30);
    text(`YOU WON !!!`, width / 4, 60);
    textSize(15);
    text(`Press BACKSPACE Key to Restart Game`, 50, height / 2);
    song.stop();
  } else if (match === "L") {
    textSize(30);
    text(`YOU LOST !!!`, width / 4, 60);
    textSize(15);
    text(`Press BACKSPACE Key to Restart Game`, 50, height / 2);
    song.stop();
  }
}

function winGame() {
  //This just gives a letter to determine whether or not the person won he game or not
  if (score1 >= 5 && score1 > score2) {
    gameIsOver = true;
    match = "W";
  } else if (score1 - score2 >= 3) {
    gameIsOver = true;
    match = "W";
  } else if (score2 - score1 >= 3) {
    gameIsOver = true;
    match = "L";
  } else if (score2 >= 5 && score2 > score1) {
    gameIsOver = true;
    match = "L";
  }
}

function mousePressed() {
  clicked = true;
  song.stop();
  song.loop();
  song.Volume(0.5);
}
