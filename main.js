$(document).ready(function(){
  var canvas = $("#canvas")[0];
  var context = canvas.getContext("2d");

  //Global constants
  var STATE_PLAYING_GAME = 1;

  //Event Listeners
  var keys = {};
  var mouse_info = {x:0, y:0, clicked_left: false, clicked_right: false};
  document.addEventListener("keydown", function(e) {
	   keys[e.keyCode] = true;
  });
  document.addEventListener("keyup", function(e) {
	  keys[e.keyCode] = false;
  });
  document.addEventListener("mousemove", function(e) {
    var canvas_bounds = canvas.getBoundingClientRect();
	  mouse_info.x = e.clientX - canvas_bounds.left,
    mouse_info.y = e.clientY - canvas_bounds.top
  });
  document.addEventListener("mousedown", function(e) {
    mouse_info.clicked_left = (e.which==1);
    mouse_info.clicked_right = (e.which==3);
  });
  document.addEventListener("mouseup", function(e) {
    mouse_info.clicked_left = false;
    mouse_info.clicked_right = false;
  });
  document.addEventListener("contextmenu", function(e) {
    //This function is only used to prevent the right click menu from appearring
    e.preventDefault();
    return false;
  }, false);

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
    my_state.game.update(keys, mouse_info);
  }

  //Create and start game
  var my_state = new Game_State();
  setInterval(game_loop, 17);
})
