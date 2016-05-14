var canvas;
var context;

//Define a new game object
function Game(maze_width, maze_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  this.start_loc = {row: 0, col: 0};
  this.end_loc = {row: maze_height-1, col: maze_width-1};
  this.collision_tree = new Collision_Tree(0, {x: 0, y:0, width: canvas.width, height: canvas.height});
  this.maze = new Maze(maze_width, maze_height);
  this.player = new Player({x: 38, y: 38}, this.maze);
  this.solution = this.maze.solve(this.start_loc, this.end_loc);

  //Check for collisions
  this.check_collisions = function() {
    this.collision_tree.clear();

    //Insert Player
    this.collision_tree.insert(this.player);

    //Insert walls
    for (var i=0; i<this.maze.drawable_cells.length; i++) {
      for (var j=0; j<this.maze.drawable_cells[i].wall_objs.length; j++) {
        if (this.maze.drawable_cells[i].wall_objs[j]!=null) {
          this.collision_tree.insert(this.maze.drawable_cells[i].wall_objs[j]);
        }
      }
    }

    //Get list of possible collisions with player
    var possible_collisions = this.collision_tree.get_objects(this.player);

    //Resolve collisions
    for (var i=0; i<possible_collisions.length; i++) {
      if (possible_collisions[i]!=this.player && collided(this.player, possible_collisions[i])) {
        this.player.bounds.x = this.player.prev_loc.x;
        this.player.bounds.y = this.player.prev_loc.y;
        this.maze.view.x = this.maze.view_prev_loc.x;
        this.maze.view.y = this.maze.view_prev_loc.y;
        this.maze.update();
        break;
      }
    }
  }

  //Drawing method for game
  this.draw = function() {
    //Draw the maze
    this.maze.draw();

    //Draw the player
    this.player.draw();
  }

  //Update game each step
  this.update = function(keys) {
    //Update the player
    this.player.update(keys);

    //Update the maze
    this.maze.update();

    this.check_collisions();
  }
}

//Returns true if two objects have collided
function collided(obj_a, obj_b) {
  if (obj_a.bounds.x>obj_b.bounds.x+obj_b.bounds.width || obj_a.bounds.x+obj_a.bounds.width<obj_b.bounds.x) {return false;}
  if (obj_a.bounds.y>obj_b.bounds.y+obj_b.bounds.height || obj_a.bounds.y+obj_a.bounds.height<obj_b.bounds.y) {return false;}

  return true;
}
