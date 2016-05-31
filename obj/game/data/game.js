//Game bounds type identifiers
Game.RECT_ID = 0;
Game.CIRCLE_ID = 1;

//Game object type identifiers
Game.PLAYER_ID = 0;
Game.WALL_ID = 1;
Game.RAMP_ID = 2;
Game.HOLE_ID = 3;
Game.FLASHLIGHT_ID = 4;
Game.BATTERY_ID = 5;
Game.NPC_ID = 6;
Game.NPC_TALK_ZONE_ID = 7;

//Game state identifiers
Game.STATE_NORMAL = 0;
Game.STATE_CHANGING_FLOORS = 1;
Game.STATE_FADING_IN = 2;

//Game background music urls
Game.BG_MUSIC_URL = 'audio/background/bg';

var canvas;
var context;

//Define a new game object
function Game(maze_floor, maze_width, maze_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  this.state = Game.STATE_NORMAL;
  this.curtain_opacity = 0; //Black overlay used for fade-in fade-out
  this.curtain_fade_speed = 0; //Rate at which curtain fades in and out

  this.collision_tree = new Collision_Tree(0, {x: 0, y:0, width: canvas.width, height: canvas.height});
  this.maze = new Maze(maze_floor, maze_width, maze_height);
  var counter = 0; //used to check number of failed attempts to create path
  do {
    //Catchs a stuck build and redoes it
    if (counter<20) {counter++;}
    else {
      counter = 0;
      this.maze = new Maze(maze_floor, maze_width, maze_height);
    }
    this.maze.pick_start_and_end();
    this.solution = this.maze.solve(this.maze.start_loc, this.maze.end_loc);
  } while (this.solution.length<50);
  this.maze.cells[this.maze.end_loc.floor][this.maze.end_loc.row][this.maze.end_loc.col].my_exit = new Exit({x: 0, y: 0, width: Maze.EXIT_SIZE, height: Maze.EXIT_SIZE});
  this.player = new Player(this.maze, this);

  //Test print of path, returns true if pathing has worked
  //console.log(this.maze.start_loc.floor==this.solution[0].floor && this.maze.start_loc.row==this.solution[0].row && this.maze.start_loc.col==this.solution[0].col && this.maze.end_loc.floor==this.solution[this.solution.length-1].floor && this.maze.end_loc.row==this.solution[this.solution.length-1].row && this.maze.end_loc.col==this.solution[this.solution.length-1].col);

  //Set events
  var npc_order = new Array(5);
  for (var i=0; i<npc_order.length; i++) {npc_order[i] = i;}
  //randomize npc order
  for (var i=0; i<npc_order.length; i++) {
    do {
      var new_place = Math.floor(Math.random()*npc_order.length);
    } while (new_place==i);

    var temp = npc_order[i];
    npc_order[i] = npc_order[new_place];
    npc_order[new_place] = temp;
  }
  //Place npcs
  var npc_avg_dist = this.solution.length/6;
  for (i=0; i<npc_order.length; i++) {
    var random_place;
    var temp_loc;
    var counter = 0;
    do {
      random_place = Math.floor((i+1)*npc_avg_dist)+(((Math.floor(Math.random()*1)+1)*-1)*(Math.floor(Math.random()*(3+Math.floor(counter/10)))));
      temp_loc = {
        floor: this.solution[random_place].floor,
        row: this.solution[random_place].row,
        col: this.solution[random_place].col
      };
      counter++;
    } while (!this.maze.place_npc(temp_loc, npc_order[i]));
  }

  this.dialogue = null; //Placeholder for when dialogue appears
  //Marks tile location of the npc that is talking
  this.dialogue_pos = {
    floor: 0,
    row: 0,
    col: 0
  };

  //Create lighting objects array
  var lighting_objects = new Array();

  this.lighting = new illuminated.Lighting({
    light: this.player.flashlight,
    objects: lighting_objects
  });
  this.darkmask = new illuminated.DarkMask({ lights: [this.player.flashlight], color: 'rgba(0,0,0,0.96)'}); //Original Value for color alpha: 976

  //Start background music
  this.background_music = new Howl({
    urls: [Game.BG_MUSIC_URL+'.mp3', Game.BG_MUSIC_URL+'.ogg'],
    loop: true,
    autoplay: true,
    volume: 0.5
  });

  //Adjusts and updates lighting objects
  this.adjust_lighting = function(mouse_info) {
    //Set angle of light
    var angle = -1*Math.atan2(mouse_info.y-this.player.bounds.y-(this.player.bounds.height/2), mouse_info.x-this.player.bounds.x-(this.player.bounds.width/2));
    this.player.flashlight.angle = angle;

    this.player.flashlight.position = new illuminated.Vec2(this.player.bounds.x+(this.player.bounds.width/2)+(this.player.bounds.width*Math.cos(angle)/2), this.player.bounds.y+(this.player.bounds.height/2)-(this.player.bounds.height*Math.sin(angle)/2));

    this.player.flashlight_bounds.bounds.x = this.player.bounds.x+(this.player.bounds.width/2)+(this.player.flashlight.distance*Math.cos(angle));
    this.player.flashlight_bounds.bounds.y = this.player.bounds.y+(this.player.bounds.height/2)-(this.player.flashlight.distance*Math.sin(angle));

    //Turn light on or off
    this.darkmask.lights = this.player.is_flashlight_on() ? [this.player.flashlight] : new Array();

    /*
    //Insert flashlight bounds into collision tree
    this.collision_tree.insert(this.player.flashlight_bounds);

    //create priority queues of wall objects
    var horizontal_walls = new Array();
    var vertical_walls = new Array();
    var possible_collisions = this.collision_tree.get_objects(this.player.flashlight_bounds);
    var count = 0;
    for (var i=0; i<possible_collisions.length; i++) {
      if ((possible_collisions[i].obj_type==Game.WALL_ID) && Game.collided(this.player.flashlight_bounds, possible_collisions[i])) {
        var wall_found = false;
        //Handle horizontal wall partitions
        if (possible_collisions[i].bounds.width>possible_collisions[i].bounds.height) {
          for (var j=0; j<horizontal_walls.length; j++) {
            if (Math.abs(horizontal_walls[j].get_first().wall.bounds.y-possible_collisions[i].bounds.y)<(Maze.WALL_THICKNESS*2)) {
              horizontal_walls[j].push({wall: possible_collisions[i], priority: possible_collisions[i].bounds.x});
              wall_found = true;
              j = horizontal_walls.length;
            }
          }
          if (!wall_found) {
            horizontal_walls.push(new Priority_Queue());
            horizontal_walls[horizontal_walls.length-1].push({wall: possible_collisions[i], priority: possible_collisions[i].bounds.x});
          }
        }
        //Handle vertical wall partitions
        else {
          for (var j=0; j<vertical_walls.length; j++) {
            if (Math.abs(vertical_walls[j].get_first().wall.bounds.x-possible_collisions[i].bounds.x)<(Maze.WALL_THICKNESS*2)) {
              vertical_walls[j].push({wall: possible_collisions[i], priority: possible_collisions[i].bounds.y});
              wall_found = true;
              j = vertical_walls.length;
            }
          }
          if (!wall_found) {
            vertical_walls.push(new Priority_Queue());
            vertical_walls[vertical_walls.length-1].push({wall: possible_collisions[i], priority: possible_collisions[i].bounds.y});
          }
        }
      }
    }

    this.my_lighting_walls = new Array();
    //construct horizontal wall objects and add them to the lighting model
    for (var i=0; i<horizontal_walls.length; i++) {
      var wall_part = horizontal_walls[i].pop();
      var new_wall = {
        x: wall_part.wall.bounds.x,
        y: wall_part.wall.bounds.y,
        end_x: wall_part.wall.bounds.x+wall_part.wall.bounds.width,
        end_y: wall_part.wall.bounds.y+wall_part.wall.bounds.height
      }
      while (horizontal_walls[i].queue.length>0) {
        wall_part = horizontal_walls[i].pop();

        //if next wall part is not contiguous to the current wall
        if (wall_part.wall.bounds.x>new_wall.end_x+Maze.WALL_THICKNESS) {
          //Fix new wall if dimensions are too big for model
          if (new_wall.end_x-new_wall.x>this.player.flashlight_bounds.bounds.radius*2) {
            if (new_wall.x<this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius) {
              new_wall.x = this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
            }
            if (new_wall.end_x>this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius) {
              new_wall.end_x = this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
            }
          }
          if (new_wall.end_y-new_wall.y>this.player.flashlight_bounds.bounds.radius*2) {
            if (new_wall.y<this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius) {
              new_wall.y = this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
            }
            if (new_wall.end_y>this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius) {
              new_wall.end_y = this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
            }
          }

          this.my_lighting_walls.push({bounds: {x: new_wall.x, y: new_wall.y, width: new_wall.end_x-new_wall.x, height: new_wall.end_y-new_wall.y, type: Game.RECT_ID}});

          new_wall = {
            x: wall_part.wall.bounds.x,
            y: wall_part.wall.bounds.y,
            end_x: wall_part.wall.bounds.x+wall_part.wall.bounds.width,
            end_y: wall_part.wall.bounds.y+wall_part.wall.bounds.height
          }
        }
        //otherwise adjust the current wall
        else {
          if (new_wall.y>wall_part.wall.bounds.y) {new_wall.y = wall_part.wall.bounds.y;}
          if (new_wall.end_x<wall_part.wall.bounds.x+wall_part.wall.bounds.width) {new_wall.end_x = wall_part.wall.bounds.x+wall_part.wall.bounds.width;}
          if (new_wall.end_y<wall_part.wall.bounds.y+wall_part.wall.bounds.height) {new_wall.end_y = wall_part.wall.bounds.y+wall_part.wall.bounds.height;}
        }
      }
      //Fix new wall if dimensions are too big for model
      if (new_wall.end_x-new_wall.x>this.player.flashlight_bounds.bounds.radius*2) {
        if (new_wall.x<this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius) {
          new_wall.x = this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
        }
        if (new_wall.end_x>this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius) {
          new_wall.end_x = this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
        }
      }
      if (new_wall.end_y-new_wall.y>this.player.flashlight_bounds.bounds.radius*2) {
        if (new_wall.y<this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius) {
          new_wall.y = this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
        }
        if (new_wall.end_y>this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius) {
          new_wall.end_y = this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
        }
      }

      this.my_lighting_walls.push({bounds: {x: new_wall.x, y: new_wall.y, width: new_wall.end_x-new_wall.x, height: new_wall.end_y-new_wall.y, type: Game.RECT_ID}});
    }

    //construct vertical wall objects and add them to the lighting model
    for (var i=0; i<vertical_walls.length; i++) {
      var wall_part = vertical_walls[i].pop();
      var new_wall = {
        x: wall_part.wall.bounds.x,
        y: wall_part.wall.bounds.y,
        end_x: wall_part.wall.bounds.x+wall_part.wall.bounds.width,
        end_y: wall_part.wall.bounds.y+wall_part.wall.bounds.height
      }
      while (vertical_walls[i].queue.length>0) {
        wall_part = vertical_walls[i].pop();

        //if next wall part is not contiguous to the current wall
        if (wall_part.wall.bounds.y>new_wall.end_y+Maze.WALL_THICKNESS) {
          //Fix new wall if dimensions are too big for model
          if (new_wall.end_x-new_wall.x>this.player.flashlight_bounds.bounds.radius*2) {
            if (new_wall.x<this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius) {
              new_wall.x = this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
            }
            if (new_wall.end_x>this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius) {
              new_wall.end_x = this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
            }
          }
          if (new_wall.end_y-new_wall.y>this.player.flashlight_bounds.bounds.radius*2) {
            if (new_wall.y<this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius) {
              new_wall.y = this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
            }
            if (new_wall.end_y>this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius) {
              new_wall.end_y = this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
            }
          }

          this.my_lighting_walls.push({bounds: {x: new_wall.x, y: new_wall.y, width: new_wall.end_x-new_wall.x, height: new_wall.end_y-new_wall.y, type: Game.RECT_ID}});

          new_wall = {
            x: wall_part.wall.bounds.x,
            y: wall_part.wall.bounds.y,
            end_x: wall_part.wall.bounds.x+wall_part.wall.bounds.width,
            end_y: wall_part.wall.bounds.y+wall_part.wall.bounds.height
          }
        }
        //otherwise adjust the current wall
        else {
          if (new_wall.x>wall_part.wall.bounds.x) {new_wall.x = wall_part.wall.bounds.x;}
          if (new_wall.end_x<wall_part.wall.bounds.x+wall_part.wall.bounds.width) {new_wall.end_x = wall_part.wall.bounds.x+wall_part.wall.bounds.width;}
          if (new_wall.end_y<wall_part.wall.bounds.y+wall_part.wall.bounds.height) {new_wall.end_y = wall_part.wall.bounds.y+wall_part.wall.bounds.height;}
        }
      }
      //Fix new wall if dimensions are too big for model
      if (new_wall.end_x-new_wall.x>this.player.flashlight_bounds.bounds.radius*2) {
        if (new_wall.x<this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius) {
          new_wall.x = this.player.flashlight_bounds.bounds.x-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
        }
        if (new_wall.end_x>this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius) {
          new_wall.end_x = this.player.flashlight_bounds.bounds.x+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
        }
      }
      if (new_wall.end_y-new_wall.y>this.player.flashlight_bounds.bounds.radius*2) {
        if (new_wall.y<this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius) {
          new_wall.y = this.player.flashlight_bounds.bounds.y-this.player.flashlight_bounds.bounds.radius+this.player.flashlight.radius;
        }
        if (new_wall.end_y>this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius) {
          new_wall.end_y = this.player.flashlight_bounds.bounds.y+this.player.flashlight_bounds.bounds.radius-this.player.flashlight.radius;
        }
      }

      this.my_lighting_walls.push({bounds: {x: new_wall.x, y: new_wall.y, width: new_wall.end_x-new_wall.x, height: new_wall.end_y-new_wall.y, type: Game.RECT_ID}});
    }

    //Adjust walls if they overlap
    for (var i=0; i<this.my_lighting_walls.length; i++) {
      for (var j=i+1; j<this.my_lighting_walls.length; j++) {
        if (Game.collided(this.my_lighting_walls[i], this.my_lighting_walls[j])) {
          //Determine which wall is horizontal and which is vertical
          var horiz_index;
          var vert_index;
          if (this.my_lighting_walls[i].bounds.width>this.my_lighting_walls[i].bounds.height) {
            horiz_index = i;
            vert_index = j;
          }
          else {
            horiz_index = j;
            vert_index = i;
          }

          //check horizontal wall position relative to the vertical wall
          var overlap_top = false;
          var overlap_bottom = false;
          var overlap_left = false;
          var overlap_right = false;

          //if horizontal wall is overlapping top of the vertical wall
          if (this.my_lighting_walls[horiz_index].bounds.y+this.my_lighting_walls[horiz_index].bounds.height<this.my_lighting_walls[vert_index].bounds.y+this.my_lighting_walls[vert_index].bounds.height) {
            overlap_top = true;
            //console.log("Hit 1");
          }
          //if horizontal wall is overlapping bottom of the vertical wall
          if (this.my_lighting_walls[horiz_index].bounds.y>this.my_lighting_walls[vert_index].bounds.y) {
            overlap_bottom = true;
            //console.log("Hit 2");
          }
          //if horizontal wall is overlapping left side of the vertical wall
          if (this.my_lighting_walls[horiz_index].bounds.x+this.my_lighting_walls[horiz_index].bounds.width<this.my_lighting_walls[vert_index].bounds.x+this.my_lighting_walls[vert_index].bounds.width) {
            overlap_left = true;
            //console.log("Hit 3");
          }
          //if horizontal wall is overlapping right side of the vertical wall
          if (this.my_lighting_walls[horiz_index].bounds.x>this.my_lighting_walls[vert_index].bounds.x) {
            overlap_right = true;
            //console.log("Hit 4");
          }
          console.log(overlap_top && overlap_bottom && overlap_left && overlap_right);

          //Adjust for overlaps
          if (overlap_top && overlap_right && !overlap_bottom && !overlap_left) {
            this.my_lighting_walls[vert_index].bounds.y = this.my_lighting_walls[horiz_index].bounds.y;
            this.my_lighting_walls[horiz_index].bounds.x = this.my_lighting_walls[vert_index].bounds.x+this.my_lighting_walls[vert_index].bounds.width-1;
          }
          else if (overlap_top && overlap_left && !overlap_bottom && !overlap_right) {
            this.my_lighting_walls[vert_index].bounds.y = this.my_lighting_walls[horiz_index].bounds.y;
            this.my_lighting_walls[horiz_index].bounds.width = this.my_lighting_walls[vert_index].bounds.x-this.my_lighting_walls[horiz_index].bounds.x+1;
          }
          else if (overlap_bottom && overlap_left && !overlap_top && !overlap_right) {
            this.my_lighting_walls[vert_index].bounds.height = (this.my_lighting_walls[horiz_index].bounds.y+this.my_lighting_walls[horiz_index].bounds.height)-this.my_lighting_walls[vert_index].bounds.y;
            this.my_lighting_walls[horiz_index].bounds.width = this.my_lighting_walls[vert_index].bounds.x-this.my_lighting_walls[horiz_index].bounds.x+1;
          }
          else if (overlap_bottom && overlap_right && !overlap_top && !overlap_left) {
            this.my_lighting_walls[vert_index].bounds.height = (this.my_lighting_walls[horiz_index].bounds.y+this.my_lighting_walls[horiz_index].bounds.height)-this.my_lighting_walls[vert_index].bounds.y;
            this.my_lighting_walls[horiz_index].bounds.x = this.my_lighting_walls[vert_index].bounds.x+this.my_lighting_walls[vert_index].bounds.width-1;
          }
          else if (overlap_top && overlap_left && overlap_right && !overlap_bottom) {
            this.my_lighting_walls[vert_index].bounds.y = this.my_lighting_walls[horiz_index].bounds.y+this.my_lighting_walls[horiz_index].bounds.height;
          }
          else if (overlap_bottom && overlap_left && overlap_right && !overlap_top) {
            this.my_lighting_walls[vert_index].bounds.height = this.my_lighting_walls[horiz_index].bounds.y-this.my_lighting_walls[vert_index].bounds.y;
          }
          else if (overlap_left && overlap_top && overlap_bottom && !overlap_right) {
            this.my_lighting_walls[horiz_index].bounds.width = this.my_lighting_walls[vert_index].bounds.x-this.my_lighting_walls[horiz_index].bounds.x;
          }
          else if (overlap_right && overlap_top && overlap_bottom && !overlap_left) {
            this.my_lighting_walls[horiz_index].bounds.x = this.my_lighting_walls[vert_index].bounds.x+this.my_lighting_walls[vert_index].bounds.width;
          }
        }
      }
    }

    //Add lighting walls to model
    for (var i=0; i<this.my_lighting_walls.length; i++) {
      this.lighting.objects.push(new illuminated.RectangleObject({ topleft: new illuminated.Vec2(this.my_lighting_walls[i].bounds.x, this.my_lighting_walls[i].bounds.y), bottomright: new illuminated.Vec2(this.my_lighting_walls[i].bounds.x+this.my_lighting_walls[i].bounds.width, this.my_lighting_walls[i].bounds.y+this.my_lighting_walls[i].bounds.height) }));
    }*/

    //Compute the shadow and darkness overlay
    this.lighting.compute(canvas.width, canvas.height);
    this.darkmask.compute(canvas.width, canvas.height);
  }

  this.adjust_sound = function() {
    //change floor sounds if player just changed floors
    if (this.curtain_opacity==1 && this.state==Game.STATE_FADING_IN) {
      this.maze.sound_manager.change_floor(this.maze.current_floor);
    }

    //Check onscreen cells for playable sounds
    for (var i=0; i<this.maze.drawable_cells.length; i++) {
      if (this.maze.drawable_cells[i].my_npc!=null) {
        var distance = {
          x: (this.maze.drawable_cells[i].my_npc.bounds.x+(this.maze.drawable_cells[i].my_npc.bounds.width/2))-(this.player.bounds.x+(this.player.bounds.width/2)),
          y: (this.maze.drawable_cells[i].my_npc.bounds.y+(this.maze.drawable_cells[i].my_npc.bounds.height/2))-(this.player.bounds.y+(this.player.bounds.height/2))
        };
        //If the sound is in range
        if (Math.pow(distance.x, 2)+Math.pow(distance.y, 2)<=Math.pow(Player.HEARING_RADIUS, 2)) {
          //If sound is not playing, play sound
          if (!this.maze.drawable_cells[i].my_npc.my_sound.playing) {
            this.maze.drawable_cells[i].my_npc.my_sound.playing = true;
            this.maze.drawable_cells[i].my_npc.my_sound.sound.play();
          }

          //Adjust sound position
          this.maze.drawable_cells[i].my_npc.my_sound.sound.pos3d(((distance.x/Player.HEARING_RADIUS)*Pos_Sound_Manager.SOUND_3D_RANGE), ((distance.y/Player.HEARING_RADIUS)*Pos_Sound_Manager.SOUND_3D_RANGE), 0);
        }
        //stop sound if out of range
        else {
          if (this.maze.drawable_cells[i].my_npc.my_sound.playing) {
            this.maze.drawable_cells[i].my_npc.my_sound.playing = false;
            this.maze.drawable_cells[i].my_npc.my_sound.sound.stop();
          }
        }
      }
    }

    //check list of offscreen sounds for playable sounds
    for (var i=0; i<this.maze.offscreen_sounds.length; i++) {
      var distance = {
        x: ((((this.maze.offscreen_sounds[i].loc.col-this.maze.view_start_cell.col)*Maze.TILE_SIZE)-this.maze.view_tile_offset.width)+(Maze.TILE_SIZE/2))-(this.player.bounds.x+(this.player.bounds.width/2)),
        y: ((((this.maze.offscreen_sounds[i].loc.row-this.maze.view_start_cell.row)*Maze.TILE_SIZE)-this.maze.view_tile_offset.height)+(Maze.TILE_SIZE/2))-(this.player.bounds.y+(this.player.bounds.height/2))
      };
      //If the sound is in range
      if (Math.pow(distance.x, 2)+Math.pow(distance.y, 2)<=Math.pow(Player.HEARING_RADIUS, 2)) {
        //Start sound if it wasn't previously playing
        if (!this.maze.offscreen_sounds[i].playing) {
          this.maze.offscreen_sounds[i].playing = true;
          this.maze.offscreen_sounds[i].sound.play();
        }

        //Change sound position
        this.maze.offscreen_sounds[i].sound.pos3d(((distance.x/Player.HEARING_RADIUS)*Pos_Sound_Manager.SOUND_3D_RANGE), ((distance.y/Player.HEARING_RADIUS)*Pos_Sound_Manager.SOUND_3D_RANGE), 0);
      }
      //stop sound if out of range
      else {
        if (this.maze.offscreen_sounds[i].playing) {
          this.maze.offscreen_sounds[i].playing = false;
          this.maze.offscreen_sounds[i].sound.stop();
        }
      }
    }
  }

  //Check for collisions
  this.check_collisions = function(mouse_info) {
    this.collision_tree.clear();

    //Insert Player
    this.collision_tree.insert(this.player);

    //Insert walls, npcs, and npc talk zones
    for (var i=0; i<this.maze.drawable_cells.length; i++) {
      for (var j=0; j<this.maze.drawable_cells[i].wall_objs.length; j++) {
        if (this.maze.drawable_cells[i].wall_objs[j]!=null) {
          this.collision_tree.insert(this.maze.drawable_cells[i].wall_objs[j]);
        }
      }

      if (this.maze.drawable_cells[i].my_npc!=null) {
        this.collision_tree.insert(this.maze.drawable_cells[i].my_npc);
        this.collision_tree.insert(this.maze.drawable_cells[i].my_npc.talk_zone);
      }
    }

    //Get list of possible collisions with player
    var possible_collisions = this.collision_tree.get_objects(this.player);

    //Resolve collisions
    this.player.resolve_collisions(possible_collisions, mouse_info);
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

    //Draw the can click icon if enabled
    if (this.player.show_can_click) {
      context.drawImage(this.player.can_click_sprite.get_image(), this.player.bounds.x+(this.player.bounds.width/2)-(Player.CAN_CLICK_DIM/2), this.player.bounds.y-Player.CAN_CLICK_BUFFER-Player.CAN_CLICK_DIM, Player.CAN_CLICK_DIM, Player.CAN_CLICK_DIM);
    }

    //draw dialogue
    if (this.dialogue!=null) {
      this.dialogue.draw();
    }

    //Draw curtain overlay if not completely transparent
    if (this.curtain_opacity>0) {
      context.globalAlpha = this.curtain_opacity;
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
    }

    //this.collision_tree.draw();
    /*context.strokeStyle = "green";
    for (var i=0; i<this.my_lighting_walls.length; i++) {
      context.strokeRect(this.my_lighting_walls[i].bounds.x, this.my_lighting_walls[i].bounds.y, this.my_lighting_walls[i].bounds.width, this.my_lighting_walls[i].bounds.height);
    }
    context.stroke();*/
  }

  //Render the lighting engine
  this.render_lighting = function() {
    if (this.player.is_flashlight_on()) {
      context.globalCompositeOperation = "lighter";
      this.lighting.render(context);
    }
    context.globalCompositeOperation = "source-over";
    this.darkmask.render(context);
  }

  //Update game each step
  this.update = function(keys, mouse_info) {
    //Clear list of light interactable objects
    this.lighting.objects = new Array();

    //Update the player
    if (this.dialogue==null) {
      this.player.update(keys, mouse_info);

      //Update the maze
      this.maze.update(this.lighting);

      //Check for and handle collisions
      this.check_collisions(mouse_info);

      //Compute lighting objects
      this.adjust_lighting(mouse_info);

      //Adjust sound positions
      this.adjust_sound();
    }

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

    //Update dialogue if it is present
    if (this.dialogue!=null) {
      var in_dialogue = this.dialogue.update(mouse_info);
      if (!in_dialogue) {
        //Remove character from map if they are now in your party
        if (this.player.party[this.dialogue.which_character]) {
          //stop sound from playing
          this.maze.sound_manager.remove_sound(this.maze.cells[this.dialogue_pos.floor][this.dialogue_pos.row][this.dialogue_pos.col].my_npc.my_sound);

          this.maze.cells[this.dialogue_pos.floor][this.dialogue_pos.row][this.dialogue_pos.col].my_npc = null;
        }
        this.dialogue = null;
        this.maze.sound_manager.resume_all();
      }
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
    return Math.pow(obj_a.bounds.x-obj_b.bounds.x, 2)+Math.pow(obj_a.bounds.y-obj_b.bounds.y, 2)<Math.pow(obj_a.bounds.radius+obj_b.bounds.radius, 2);
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

//Returns true if the cursor is within the given object
Game.mouse_over = function(object, mouse_info) {
  //If object is a rectangle
  if (object.bounds.type==Game.RECT_ID) {
    return mouse_info.x>object.bounds.x && mouse_info.x<object.bounds.x+object.bounds.width && mouse_info.y>object.bounds.y && mouse_info.y<object.bounds.y+object.bounds.height;
  }
  //If object is a circle
  else {
    return Math.pow(object.bounds.x-mouse_info.x, 2)+Math.pow(object.bounds.y-mouse_info.y, 2)<Math.pow(object.bounds.radius, 2);
  }
}
