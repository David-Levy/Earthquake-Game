var canvas;
var context;

//Define a new game object
function Game(maze_floor, maze_width, maze_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  this.start_loc = {floor: maze_floor-1, row: 0, col: 0};
  this.end_loc = {floor: 0, row: maze_height-1, col: maze_width-1};
  this.collision_tree = new Collision_Tree(0, {x: 0, y:0, width: canvas.width, height: canvas.height});
  this.maze = new Maze(maze_floor, maze_width, maze_height);
  this.player = new Player({x: 38, y: 38}, this.maze);
  this.solution = this.maze.solve(this.start_loc, this.end_loc);
  for (var i=0; i<this.solution.length; i++) {console.log(this.solution[i]);}
  console.log(this.solution.length);

  //Create lighting objects
  var lighting_objects = new Array();
  //lighting_objects.push(this.player.lighting_obj);
  /*for (var i=0; i<this.maze.cells.length; i++) {
    for (var j=0; j<this.maze.cells[i].length; j++) {
      for (var k=0; k<this.maze.cells[i][j].wall_objs.length; k++) {
        if (this.maze.cells[i][j].wall_objs[k]!=null) {
          lighting_objects.push(this.maze.cells[i][j].wall_objs[k].lighting_obj);
        }
      }
    }
  }*/
  this.lighting = new illuminated.Lighting({
    light: this.player.flashlight,
    objects: lighting_objects
  });
  this.darkmask = new illuminated.DarkMask({ lights: [this.player.flashlight], color: 'rgba(0,0,0,0.976)'}); //Original Value for color alpha: 976

  //Adjusts and updates lighting objects
  this.adjust_lighting = function(mouse_info) {
    var angle = -1*Math.atan2(mouse_info.y-this.player.bounds.y-(this.player.bounds.height/2), mouse_info.x-this.player.bounds.x-(this.player.bounds.width/2));
    //Get velocity
    var velocity = {
    	x: (this.player.flashlight.distance+this.player.bounds.width)*Math.cos(angle),
      y: (this.player.flashlight.distance+this.player.bounds.height)*Math.sin(angle)
    };

    this.player.flashlight.angle = angle;

    this.player.flashlight.position = new illuminated.Vec2(this.player.bounds.x+(this.player.bounds.width/2), this.player.bounds.y+(this.player.bounds.height/2));

    //Compute the shadow and darkness overlay
    this.lighting.compute(canvas.width, canvas.height);
    this.darkmask.compute(canvas.width, canvas.height);
  }

  //Check for collisions
  this.check_collisions = function(keys) {
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
    this.player.resolve_collisions(possible_collisions);
  }

  //Drawing method for game
  this.draw = function() {
    //Draw the maze
    this.maze.draw();

    //Draw the player
    this.player.draw();

    //render lighting
    this.render_lighting();
  }

  //Render the lighting engine
  this.render_lighting = function() {
    context.globalCompositeOperation = "lighter";
    this.lighting.render(context);
    context.globalCompositeOperation = "source-over";
    this.darkmask.render(context);
  }

  //Update game each step
  this.update = function(keys, mouse_info) {
    //Clear list of light interactable objects
    this.lighting.objects = new Array();

    //Update the player
    this.player.update(keys);

    //Update the maze
    this.maze.update(this.lighting);

    //Check for and handle collisions
    this.check_collisions();

    //Compute lighting objects
    this.adjust_lighting(mouse_info);
  }
}

//Returns true if two objects have collided
Game.collided = function(obj_a, obj_b) {
  if (obj_a.bounds.x>obj_b.bounds.x+obj_b.bounds.width || obj_a.bounds.x+obj_a.bounds.width<obj_b.bounds.x) {return false;}
  if (obj_a.bounds.y>obj_b.bounds.y+obj_b.bounds.height || obj_a.bounds.y+obj_a.bounds.height<obj_b.bounds.y) {return false;}

  return true;
}
