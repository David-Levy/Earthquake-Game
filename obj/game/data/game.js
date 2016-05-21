//Game bounds type identifiers
Game.RECT_ID = 0;
Game.CIRCLE_ID = 1;

//Game object type identifiers
Game.PLAYER_ID = 0;
Game.WALL_ID = 1;
Game.RAMP_ID = 2;
Game.HOLE_ID = 3;

//Game state identifiers
Game.STATE_NORMAL = 0;
Game.STATE_CHANGING_FLOORS = 1;
Game.STATE_FADING_IN = 2;

var canvas;
var context;

//Define a new game object
function Game(maze_floor, maze_width, maze_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  this.state = Game.STATE_NORMAL;
  this.curtain_opacity = 0; //Black overlay used for fade-in fade-out
  this.curtain_fade_speed = 0; //Rate at which curtain fades in and out

  this.start_loc = {floor: maze_floor-1, row: 0, col: 0};
  this.end_loc = {floor: 0, row: maze_height-1, col: maze_width-1};
  this.collision_tree = new Collision_Tree(0, {x: 0, y:0, width: canvas.width, height: canvas.height});
  this.maze = new Maze(maze_floor, maze_width, maze_height);
  this.player = new Player({x: 38, y: 38}, this.maze, this);
  this.solution = this.maze.solve(this.start_loc, this.end_loc);

  //Create lighting objects array
  var lighting_objects = new Array();

  this.lighting = new illuminated.Lighting({
    light: this.player.flashlight,
    objects: lighting_objects
  });
  this.darkmask = new illuminated.DarkMask({ lights: [this.player.flashlight], color: 'rgba(0,0,0,0.96)'}); //Original Value for color alpha: 976

  //Adjusts and updates lighting objects
  this.adjust_lighting = function(mouse_info) {
    //Set angle of light
    var angle = -1*Math.atan2(mouse_info.y-this.player.bounds.y-(this.player.bounds.height/2), mouse_info.x-this.player.bounds.x-(this.player.bounds.width/2));
    this.player.flashlight.angle = angle;

    this.player.flashlight.position = new illuminated.Vec2(this.player.bounds.x+(this.player.bounds.width/2)+(this.player.bounds.width*Math.cos(angle)/2), this.player.bounds.y+(this.player.bounds.height/2)-(this.player.bounds.height*Math.sin(angle)/2));

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
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    //Draw the maze
    this.maze.draw();

    //Draw the player
    this.player.draw();

    //render lighting
    this.render_lighting();

    //Draw curtain overlay if not completely transparent
    if (this.curtain_opacity>0) {
      context.globalAlpha = this.curtain_opacity;
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
    }
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

    //Adjust curtain fade
    this.curtain_opacity+=this.curtain_fade_speed;
    if (this.curtain_opacity>=1) {
      this.curtain_opacity=1;
      this.curtain_fade_speed*=-1;
      this.state = Game.STATE_FADING_IN;
    }
    else if (this.curtain_opacity<=0 && this.state==Game.STATE_FADING_IN) {
      this.curtain_opacity = 0;
      this.curtain_fade_speed = 0;
      this.state = Game.STATE_NORMAL;
    }
  }
}

//Returns true if two objects have collided
Game.collided = function(obj_a, obj_b) {
  //If both objects are rectangles
  if (obj_a.bounds.type==Game.RECT_ID && obj_b.bounds.type==Game.RECT_ID) {
    if (obj_a.bounds.x>obj_b.bounds.x+obj_b.bounds.width || obj_a.bounds.x+obj_a.bounds.width<obj_b.bounds.x) {return false;}
    if (obj_a.bounds.y>obj_b.bounds.y+obj_b.bounds.height || obj_a.bounds.y+obj_a.bounds.height<obj_b.bounds.y) {return false;}

    return true;
  }
  //If both objects are circles
  else if (obj_a.bounds.type==Game.CIRCLE_ID && obj_b.bounds.type==Game.CIRCLE_ID) {
    return Math.sqrt(Math.pow(obj_a.bounds.x-obj_b.bounds.x, 2)+Math.pow(obj_a.bounds.y-obj_b.bounds.y, 2))<obj_a.bounds.radius+obj_b.bounds.radius;
  }
  //If object a is a rectangle and object b is a circle
  else if (obj_a.bounds.type==Game.RECT_ID && obj_b.bounds.type==Game.CIRCLE_ID) {
    return (obj_b.bounds.x>obj_a.bounds.x-obj_b.bounds.radius) && (obj_b.bounds.x<obj_a.bounds.x+obj_a.bounds.width+obj_b.bounds.radius) && (obj_b.bounds.y>obj_a.bounds.y-obj_b.bounds.radius) && (obj_b.bounds.y<obj_a.bounds.y+obj_a.bounds.height+obj_b.bounds.radius);
  }
  //If object a is a circle and object b is a rectangle
  else if (obj_a.bounds.type==Game.CIRCLE_ID && obj_b.bounds.type==Game.RECT_ID) {
    return (obj_a.bounds.x>obj_b.bounds.x-obj_a.bounds.radius) && (obj_a.bounds.x<obj_b.bounds.x+obj_b.bounds.width+obj_a.bounds.radius) && (obj_a.bounds.y>obj_b.bounds.y-obj_a.bounds.radius) && (obj_a.bounds.y<obj_b.bounds.y+obj_b.bounds.height+obj_a.bounds.radius);
  }
}
