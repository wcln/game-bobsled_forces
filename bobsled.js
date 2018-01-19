/**
 * BCLearningNetwork.com
 * Bobsled Forces
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * January 2018
 */

//// VARIABLES ////

var mute = false;
var FPS = 20;

var STAGE_WIDTH, STAGE_HEIGHT;

var gameStarted = false;
var moving = false;

// physics stuff
var velocity_initial = 20; // sled initial velocity (Set by user)
var VELOCITY_FINAL = 0; // final velocity is always zero
var time = 0; // time variable (will be incremented)
var acceleration = 0; // set by user
var mass = 0; // set by user
var force_push = 0; // set by user
var force_friction;
var mu_kinetic;
var PUSHING_TIME = 5; // constant

var start_time;
var last_displacement = 0;

// assumptions
var PIXELS_PER_METRE = 10;


function init() {
 	STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	setupManifest(); // preloadJS
	startPreload();

	stage.update();
}

function update(event) {
 	if (gameStarted) {
    
    // bobsled is moving
    if (moving) {

      let time = (new Date().getTime() / 1000) - start_time; // time in seconds

      // Compute displacement
      // d = vt + 4.9*m*mu*t^2
      let displacement = (velocity_initial * time) + (-4.9 * mass * mu_kinetic * Math.pow(time, 2));

      if (displacement - last_displacement < 0) {
        moving = false;
      } else {
        // update sled x position
        bobsled.x += displacement - last_displacement;

        last_displacement = displacement;
      }
    }
  }

	stage.update(event);
}

function endGame() {
 	gameStarted = false;
}

function initGraphics() {

  initMuteUnMuteButtons();

  // bobsled
  bobsled.x = 10;
  bobsled.y = 345;
  stage.addChild(bobsled);






	initListeners();

  // add go button
  go_button.x = 100;
  go_button.y = 200;
  stage.addChild(go_button);

	gameStarted = true;
	stage.update();
}

function initListeners() {
  // go button
  go_button.on("click", go);

  // reset button
}

/*
 * Adds the mute and unmute buttons to the stage and defines listeners
 */
function initMuteUnMuteButtons() {
	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#000").drawRect(0, 0, muteButton.image.width, muteButton.image.height);
	muteButton.hitArea = unmuteButton.hitArea = hitArea;

	muteButton.x = unmuteButton.x = 5;
	muteButton.y = unmuteButton.y = 5;

	muteButton.cursor = "pointer";
	unmuteButton.cursor = "pointer";

	muteButton.on("click", toggleMute);
	unmuteButton.on("click", toggleMute);

	stage.addChild(unmuteButton);
}

/*
 * Launch the bobsled!
 */
function go() {

  // set physics variables
  force_push = 500;
  mass = 20;
  mu_kinetic = 0.05; // add to this depending on position as well

  // compute initial velocity
  velocity_initial = (force_push * PUSHING_TIME) / mass;

  start_time = new Date().getTime() / 1000; // start time in seconds

  // remove the go button from the stage
  stage.removeChild(go_button);

  moving = true;
}

/*
 * Reset the bobsled for another push
 */
function reset() {
  moving = false;

  // add the go button to the stage
}


//////////////////////// PRELOADJS FUNCTIONS

// bitmap variables
var muteButton, unmuteButton;
var background;
var bobsled;
var go_button;

function setupManifest() {
 	manifest = [
    {
      src: "images/mute.png",
      id: "mute"
    },
    {
      src: "images/unmute.png",
      id: "unmute"
    },
    {
      src: "images/background.png",
      id: "background"
    },
    {
      src: "images/bobsled.png",
      id: "bobsled"
    },
    {
      src: "images/go_button.png",
      id: "go_button"
    }
 	];
}


function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);
  // create bitmaps of images
  if (event.item.id == "mute") {
    muteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "unmute") {
    unmuteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "background") {
    background = new createjs.Bitmap(event.result);
  } else if (event.item.id == "bobsled") {
    bobsled = new createjs.Bitmap(event.result);
  } else if (event.item.id == "go_button") {
    go_button = new createjs.Bitmap(event.result);
  }
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {

}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
  console.log("Finished Loading Assets");

  // ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function

  stage.addChild(background);
  stage.update();
  initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS
