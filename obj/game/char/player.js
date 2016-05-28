var canvas;
var context;

//Size of player
var PLAYER_DIM = 50;

//Size of can click icon
Player.CAN_CLICK_DIM = 30;

//Distance from top of player's head to bottom of can click sprite
Player.CAN_CLICK_BUFFER = 5;

//Player movement speed
var PLAYER_SPEED_NORM = 1.85;
var PLAYER_SPEED_DIAG = Math.sqrt(Math.pow(PLAYER_SPEED_NORM, 2)+Math.pow(PLAYER_SPEED_NORM, 2))/2;

//Points at which screen will scroll
var SCROLL_POINT_HOR = 225;
var SCROLL_POINT_VERT = 225;

var KEY_CODE_D = 68;//d
var KEY_CODE_A = 65;//a
var KEY_CODE_W = 87;//w
var KEY_CODE_S = 83;//s
var KEY_CODE_UP = 38;//Up arrow
var KEY_CODE_DOWN = 40;//Down arrow
var KEY_CODE_LEFT = 37;//Left arrow
var KEY_CODE_RIGHT = 39;//Right arrow

var MAX_BATT_CHANGE_TIME = 150;

//Define base color of flashlight
Player.FLASHLIGHT_COLOR_RED = 250;
Player.FLASHLIGHT_COLOR_GREEN = 220;
Player.FLASHLIGHT_COLOR_BLUE = 150;

//Player Object
function Player(maze, game) {
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

  //Create sprite object for player
  this.my_sprite = new Sprite(Sprite.main_char_images, 10);
  this.sprite_rotation = 0;

  //Create sprite object for can click icon
  this.can_click_sprite = new Sprite(Sprite.can_click_left, 60);
  this.show_can_click = false;

  //Create inventory for player
  this.inventory = {
    battery: new Array(3),
    med_kit: 3
  };
  for (var i=0; i<this.inventory.battery.length; i++) {
    this.inventory.battery[i] = new Battery({x: null, y: null});
  }

  //Create party list
  this.party = new Array(5);
  for (var i=0; i<this.party.length; i++) {
    this.party[i] = false;
  }

  //flag to see if player can change floors
  this.can_change_floor = true;

  //flag if player is currently changing batteries
  this.changing_battery = false;
  this.batt_change_time = MAX_BATT_CHANGE_TIME;

  //destitination if player is not in control
  this.my_destination = {x: 0, y: 0};
  this.my_destination_set = false;

  this.bounds = {
    x: (this.my_maze.start_loc.col*Maze.TILE_SIZE)+(Maze.TILE_SIZE/2)-(PLAYER_DIM/2),
    y: (this.my_maze.start_loc.row*Maze.TILE_SIZE)+(Maze.TILE_SIZE/2)-(PLAYER_DIM/2),
    width: PLAYER_DIM,
    height: PLAYER_DIM,
    type: Game.RECT_ID
  };
	this.prev_loc = {x: this.bounds.x, y: this.bounds.y};

  //Create flashlight
  this.flashlight_color = {
    red: Player.FLASHLIGHT_COLOR_RED,
    green: Player.FLASHLIGHT_COLOR_GREEN,
    blue: Player.FLASHLIGHT_COLOR_BLUE,
    alpha: 0.8,
    brightness: 1
  }
  this.flashlight = new illuminated.Lamp({
    position: new illuminated.Vec2(this.bounds.x+this.bounds.width, this.bounds.y+(this.bounds.height/2)),
    diffuse: 0.8,
    distance: 120,
    radius: 10,
    samples: 3,
    roughness: 0.99,
    color: 'rgba(' + this.flashlight_color.red + ',' + this.flashlight_color.green + ',' + this.flashlight_color.blue + ',' + this.flashlight_color.alpha + ')'
  });

  //Create flashlight bounds
  this.flashlight_bounds = {
    bounds : {
      x: 0,
      y: 0,
      radius: this.flashlight.distance,
      type: Game.CIRCLE_ID
    },
    obj_type: Game.FLASHLIGHT_ID
  };

  //Lighten or darken flashlight
  this.change_flashlight_brightness = function(percent_change) {
    this.flashlight_color.brightness+=percent_change;
    if (this.flashlight_color.brightness>1) {this.flashlight_color.brightness = 1;}
    else if (this.flashlight_color.brightness<0) {this.flashlight_color.brightness = 0;}
    this.flashlight_color.red = Math.round(Math.min(Math.max(0, Player.FLASHLIGHT_COLOR_RED+((this.flashlight_color.brightness-1)*Player.FLASHLIGHT_COLOR_RED)), Player.FLASHLIGHT_COLOR_RED));
    this.flashlight_color.green = Math.round(Math.min(Math.max(0, Player.FLASHLIGHT_COLOR_GREEN+((this.flashlight_color.brightness-1)*Player.FLASHLIGHT_COLOR_GREEN)), Player.FLASHLIGHT_COLOR_GREEN));
    this.flashlight_color.blue = Math.round(Math.min(Math.max(0, Player.FLASHLIGHT_COLOR_BLUE+((this.flashlight_color.brightness-1)*Player.FLASHLIGHT_COLOR_BLUE)), Player.FLASHLIGHT_COLOR_BLUE));
    this.flashlight.color = 'rgba(' + this.flashlight_color.red + ',' + this.flashlight_color.green + ',' + this.flashlight_color.blue + ',' + this.flashlight_color.alpha + ')';
  }

	//Draw the player
	this.draw = function() {
    context.save();
    context.translate(this.bounds.x, this.bounds.y);
    context.translate(this.bounds.width/2, this.bounds.height/2)
    context.rotate(this.sprite_rotation);
    context.drawImage(this.my_sprite.get_image(),-(this.bounds.width)/2, -(this.bounds.height)/2, this.bounds.width, this.bounds.height);
    context.restore();

		//context.fillStyle = "blue";
		//context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

  //Returns true if flashlight is on
  this.is_flashlight_on = function() {
    return this.inventory.battery.length>0 && !this.changing_battery;
  }

  //Checks for collisions and resolves them
  this.resolve_collisions = function(possible_collisions, mouse_info) {
    //flag used to determine if player is touching a hole or ramp
    var touching_floor_change_obj = false;

    for (var i=0; i<possible_collisions.length; i++) {
      if (possible_collisions[i]!=this && Game.collided(this, possible_collisions[i])) {
        //Check for wall type objects
        if (possible_collisions[i].obj_type==Game.WALL_ID || possible_collisions[i].obj_type==Game.NPC_ID) {
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
        //Check if player is close enough to talk to an npc
        else if (possible_collisions[i].obj_type==Game.NPC_TALK_ZONE_ID) {
          if (mouse_info.last_clicked_left==true && mouse_info.clicked_left==false) {
            this.my_game.dialogue = new Dialogue(possible_collisions[i].identity, this.my_game);
            this.my_game.dialogue_pos.floor = possible_collisions[i].loc.floor;
            this.my_game.dialogue_pos.row = possible_collisions[i].loc.row;
            this.my_game.dialogue_pos.col = possible_collisions[i].loc.col;
            this.show_can_click = false;
          }
          else {
            this.show_can_click = true;
          }
        }
      }
    }

    //Reset can change floor flag if not touched hole or ramp
    if (!touching_floor_change_obj) {this.can_change_floor = true;}
  }

  //Update Player
  this.update = function(keys, mouse_info) {
    //update the sprites
    this.my_sprite.update();
    this.can_click_sprite.update();
    this.show_can_click = false;

    this.sprite_rotation = Math.atan2(mouse_info.y-this.bounds.y-(this.bounds.height/2), mouse_info.x-this.bounds.x-(this.bounds.width/2))+(Math.PI/2);

		//Set previous Location
		this.prev_loc = {x: this.bounds.x, y: this.bounds.y};

		//Direction to move player
		var move = {x: 0, y: 0};
    var my_speed;

    //Move based on player input if in normal state
    if (this.my_game.state==Game.STATE_NORMAL) {
      //perform battery applications
      if (this.inventory.battery.length>0) {
        if (!this.changing_battery) {
          this.inventory.battery[0].update();
          //replace batery if out and have spare
          if (this.inventory.battery[0].life == 0) {
            this.inventory.battery.shift();
            this.changing_battery = true;
          }
        }
        else {
          //Delay for player to change battery
          this.batt_change_time--;
          if (this.batt_change_time==0) {
            this.batt_change_time = MAX_BATT_CHANGE_TIME;
            this.changing_battery = false;
          }
        }
      }

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

    //set player sprite to still if not moving
    if (move.x==0 && move.y==0) {this.my_sprite.reset();}

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
