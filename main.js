var canvas = $("#canvas")[0];
var context = canvas.getContext("2d");

//Global constants
var STATE_PLAYING_GAME = 1;

//Object to contain information about the game's state
function Game_State() {
  //Initialize game state
  this.state = STATE_PLAYING_GAME;
  //create game instance
  this.game = new Game(127, 57);
}

function game_loop() {
  update();
  draw();
}

function draw() {

}

function update() {

}

var my_state = new Game_State();
my_state.game.maze.draw();
my_state.game.maze.draw_path(my_state.game.solution);
