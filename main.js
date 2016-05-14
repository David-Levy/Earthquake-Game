$(document).ready(function(){
  var canvas = $("#canvas")[0];
  var context = canvas.getContext("2d");

  //Global constants
  var STATE_PLAYING_GAME = 1;

  //Event Listeners
  var keys = {};
  document.addEventListener("keydown", function(e) {
	   keys[e.keyCode] = true;
  });
  document.addEventListener("keyup", function(e) {
	  keys[e.keyCode] = false;
  });

  //Object to contain information about the game's state
  function Game_State() {
    //Initialize game state
    this.state = STATE_PLAYING_GAME;
    //create game instance
    this.game = new Game(20, 10);
  }

  function game_loop() {
    update();
    draw();
  }

  function draw() {
    my_state.game.draw();
  }

  function update() {
    my_state.game.update(keys);
  }

  //Create and start game
  var my_state = new Game_State();
  setInterval(game_loop, 17);
})
