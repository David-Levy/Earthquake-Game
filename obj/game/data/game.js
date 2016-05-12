var canvas;
var context;

//Define a new game object
function Game(maze_width, maze_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  this.start_loc = {row: 0, col: 0};
  this.end_loc = {row: maze_height-1, col: maze_width-1};
  this.maze = new Maze(maze_width, maze_height);
  this.solution = this.maze.solve(this.start_loc, this.end_loc);

  //Drawing method for game
  this.draw = function() {

  }

  //Update game each step
  this.update = function() {

  }
}
