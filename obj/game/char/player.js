var canvas;
var context;

//Size of player
var PLAYER_DIM = 25;

//Player movement speed
var PLAYER_SPEED_NORM = 2.5;
var PLAYER_SPEED_DIAG = Math.sqrt(Math.pow(PLAYER_SPEED_NORM, 2)+Math.pow(PLAYER_SPEED_NORM, 2))/2;

//Points at which screen will scroll
var SCROLL_POINT_HOR = 150;
var SCROLL_POINT_VERT = 150;

var KEY_CODE_D = 68;//d
var KEY_CODE_A = 65;//a
var KEY_CODE_W = 87;//w
var KEY_CODE_S = 83;//s
var KEY_CODE_UP = 38;//Up arrow
var KEY_CODE_DOWN = 40;//Down arrow
var KEY_CODE_LEFT = 37;//Left arrow
var KEY_CODE_RIGHT = 39;//Right arrow

//Player Object
function Player(start_loc, maze, game) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

	//Set scroll Points
	this.scroll_point_up = SCROLL_POINT_VERT;
	this.scroll_point_down = canvas.height-PLAYER_DIM-SCROLL_POINT_VERT;
	this.scroll_point_left = SCROLL_POINT_HOR;
	this.scroll_point_right = canvas.width-PLAYER_DIM-SCROLL_POINT_HOR;

	//Hook to current maze
	this.my_maze = maze;

  //Hook game to player
  this.my_game = game;

  //flag to see if player can change floors
  this.can_change_floor = true;

  //destitination if player is not in control
  this.my_destination = {x: 0, y: 0};
  this.my_destination_set = false;

  this.bounds = {
    x: start_loc.x,
    y: start_loc.y,
    width: PLAYER_DIM,
    height: PLAYER_DIM,
    type: Game.RECT_ID
  };
	this.prev_loc = {x: this.bounds.x, y: this.bounds.y};

  //Create flashlight
  this.flashlight = new illuminated.Lamp({
    position: new illuminated.Vec2(this.bounds.x+this.bounds.width, this.bounds.y+(this.bounds.height/2)),
    distance: 120,
    radius: 10,
    samples: 3,
    roughness: 0.99
  });

	//Draw the player
	this.draw = function() {
		context.fillStyle = "blue";
		context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

  //Checks for collisions and resolves them
  this.resolve_collisions = function(possible_collisions) {
    //flag used to determine if player is touching a hole or ramp
    var touching_floor_change_obj = false;

    for (var i=0; i<possible_collisions.length; i++) {
      if (possible_collisions[i]!=this && Game.collided(this, possible_collisions[i])) {
        //Check for wall type objects
        if (possible_collisions[i].obj_type==Game.WALL_ID) {
          //If object has collided from the top or bottom
          if (this.prev_loc.x<possible_collisions[i].bounds.x+possible_collisions[i].bounds.width && this.prev_loc.x+this.bounds.width>possible_collisions[i].bounds.x) {
            if (this.prev_loc.y<possible_collisions[i].bounds.y) {
              this.bounds.y = possible_collisions[i].bounds.y-this.bounds.height-1;
            }
            else {
              this.bounds.y = possible_collisions[i].bounds.y+possible_collisions[i].bounds.height+1;
            }
          }
          //If object has collided from the left or right
          else if (this.prev_loc.y<possible_collisions[i].bounds.y+possible_collisions[i].bounds.height && this.prev_loc.y+this.bounds.height>possible_collisions[i].bounds.y) {
            if (this.prev_loc.x<possible_collisions[i].bounds.x) {
              this.bounds.x = possible_collisions[i].bounds.x-this.bounds.width-1;
            }
            else {
              this.bounds.x = possible_collisions[i].bounds.x+possible_collisions[i].bounds.width+1;
            }
          }
          //Special handling for if object collides from a corner
          else {
            if (this.prev_loc.x<possible_collisions[i].bounds.x) {
              this.bounds.x = possible_collisions[i].bounds.x-this.bounds.width-1;
            }
            else {
              this.bounds.x = possible_collisions[i].bounds.x+possible_collisions[i].bounds.width+1;
            }

            if (this.prev_loc.y<possible_collisions[i].bounds.y) {
              this.bounds.y = possible_collisions[i].bounds.y-this.bounds.height-1;
            }
            else {
              this.bounds.y = possible_collisions[i].bounds.y+possible_collisions[i].bounds.height+1;
            }
          }
        }
        //Check if player has collided with a hole or ramp
        else if (possible_collisions[i].obj_type==Game.HOLE_ID || possible_collisions[i].obj_type==Game.RAMP_ID) {
          touching_floor_change_obj = true;
          if (this.can_change_floor) {
            //Set player destination to center of the ramp or hole if not already set
            this.my_destination = {
              x: possible_collisions[i].bounds.x+(possible_collisions[i].bounds.width/2)-(this.bounds.width/2),
              y: possible_collisions[i].bounds.y+(possible_collisions[i].bounds.height/2)-(this.bounds.height/2)
            };
            if (this.my_game.curtain_fade_speed==0) {
              this.my_game.curtain_fade_speed = 1/(Math.sqrt(Math.pow(this.my_destination.x-this.bounds.x, 2) + Math.pow(this.my_destination.y-this.bounds.y, 2))/PLAYER_SPEED_DIAG);
            }

            if (Math.abs(this.bounds.x-this.my_destination.x)>PLAYER_SPEED_DIAG || Math.abs(this.bounds.y-this.my_destination.y)>PLAYER_SPEED_DIAG) {
              this.my_game.state = Game.STATE_CHANGING_FLOORS;
            }
            else {
              if (possible_collisions[i].obj_type==Game.HOLE_ID){this.my_maze.current_floor--;}
              else {this.my_maze.current_floor++;}
              this.bounds.x = this.my_destination.x;
              this.bounds.y = this.my_destination.y;
              this.my_game.state = Game.STATE_FADING_IN;
              this.can_change_floor = false;
            }
          }
        }
      }
    }

    //Reset can change floor flag if not touched hole or ramp
    if (!touching_floor_change_obj) {this.can_change_floor = true;}
  }

  //Update Player
  this.update = function(keys) {
		//Set previous Location
		this.prev_loc = {x: this.bounds.x, y: this.bounds.y};

		//Direction to move player
		var move = {x: 0, y: 0};
    var my_speed;

    //Move base on player input if in normal state
    if (this.my_game.state==Game.STATE_NORMAL) {
  		if (keys[KEY_CODE_W] || keys[KEY_CODE_UP]) {move.y-=PLAYER_SPEED_NORM;}
  		if (keys[KEY_CODE_S] || keys[KEY_CODE_DOWN]) {move.y+=PLAYER_SPEED_NORM;}
  		if (keys[KEY_CODE_A] || keys[KEY_CODE_LEFT]) {move.x-=PLAYER_SPEED_NORM;}
  		if (keys[KEY_CODE_D] || keys[KEY_CODE_RIGHT]) {move.x+=PLAYER_SPEED_NORM;}

      //determine speed of player
  		my_speed = (move.x!=0 && move.y!=0) ? PLAYER_SPEED_DIAG : PLAYER_SPEED_NORM;
    }
    else if (this.my_game.state==Game.STATE_CHANGING_FLOORS) {
      my_speed = PLAYER_SPEED_DIAG;
      move = {
        x: this.my_destination.x-this.bounds.x,
        y: this.my_destination.y-this.bounds.y
      }
    }

		//Move Player
		var scrolled = false;
		if (move.x>0) {
			//Try and scroll the screen if beyond the scroll point
			if (this.bounds.x+my_speed>=this.scroll_point_right) {
				if (this.bounds.x==this.scroll_point_right) {
					scrolled = this.my_maze.scroll_right(my_speed);
          if (scrolled) {this.prev_loc.x-=my_speed;}
				}
				else {
					var scroll_speed = (this.bounds.x+my_speed)-this.scroll_point_right;
					if (this.my_maze.scroll_right(scroll_speed)) {
						scrolled = true;
						this.bounds.x+=(my_speed-scroll_speed);
            this.prev_loc.x-=scroll_speed;
					}
				}
			}

			//If the screen was not scrolled move right normally
			if (!scrolled) {this.bounds.x+=my_speed;}
		}
		else if(move.x<0) {
			//Try and scroll the screen if beyond the scroll point
			if (this.bounds.x-my_speed<=this.scroll_point_left) {
				if (this.bounds.x==this.scroll_point_left) {
					scrolled = this.my_maze.scroll_left(my_speed);
          if (scrolled) {this.prev_loc.x+=my_speed;}
				}
				else {
					var scroll_speed = this.scroll_point_left-(this.bounds.x-my_speed);
					if (this.my_maze.scroll_left(scroll_speed)) {
						scrolled = true;
						this.bounds.x-=(my_speed-scroll_speed);
            this.prev_loc.x+=scroll_speed;
					}
				}
			}

			//If the screen was not scrolled move left normally
			if (!scrolled) {this.bounds.x-=my_speed;}
		}
		if (move.y>0) {
			//Try and scroll the screen if beyond the scroll point
			if (this.bounds.y+my_speed>=this.scroll_point_down) {
				if (this.bounds.y==this.scroll_point_down) {
					scrolled = this.my_maze.scroll_down(my_speed);
          if (scrolled) {this.prev_loc.y-=my_speed;}
				}
				else {
					var scroll_speed = (this.bounds.y+my_speed)-this.scroll_point_down;
					if (this.my_maze.scroll_down(scroll_speed)) {
						scrolled = true;
						this.bounds.y+=(my_speed-scroll_speed);
            this.prev_loc.y-=scroll_speed;
					}
				}
			}

			//If the screen was not scrolled move left normally
			if (!scrolled) {this.bounds.y+=my_speed;}
		}
		else if(move.y<0) {
			//Try and scroll the screen if beyond the scroll point
			if (this.bounds.y-my_speed<=this.scroll_point_up) {
				if (this.bounds.y==this.scroll_point_up) {
					scrolled = this.my_maze.scroll_up(my_speed);
          this.prev_loc.y+=my_speed;
				}
				else {
					var scroll_speed = this.scroll_point_up-(this.bounds.y-my_speed);
					if (this.my_maze.scroll_up(scroll_speed)) {
						scrolled = true;
						this.bounds.y-=(my_speed-scroll_speed);
            this.prev_loc.y+=scroll_speed;
					}
				}
			}

			//If the screen was not scrolled move right normally
			if (!scrolled) {this.bounds.y-=my_speed;}
		}
  }
}
