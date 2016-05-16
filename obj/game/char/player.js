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
function Player(start_loc, maze) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

	//Set scroll Points
	this.scroll_point_up = SCROLL_POINT_VERT;
	this.scroll_point_down = canvas.height-PLAYER_DIM-SCROLL_POINT_VERT;
	this.scroll_point_left = SCROLL_POINT_HOR;
	this.scroll_point_right = canvas.width-PLAYER_DIM-SCROLL_POINT_HOR;

	//Hook to current maze
	this.my_maze = maze;

  this.bounds = {x: start_loc.x, y: start_loc.y, width: PLAYER_DIM, height: PLAYER_DIM};
  this.lighting_obj = new illuminated.RectangleObject({ topleft: new illuminated.Vec2(this.bounds.x, this.bounds.y), bottomright: new illuminated.Vec2(this.bounds.x+this.bounds.width, this.bounds.y+this.bounds.height) });
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
    for (var i=0; i<possible_collisions.length; i++) {
      if (possible_collisions[i]!=this && Game.collided(this, possible_collisions[i])) {
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
    }
  }

  //Update Player
  this.update = function(keys) {
		//Set previous Location
		this.prev_loc = {x: this.bounds.x, y: this.bounds.y};

		//Direction to move player
		var move = {x: 0, y: 0};

		if (keys[KEY_CODE_W] || keys[KEY_CODE_UP]) {move.y-=PLAYER_SPEED_NORM;}
		if (keys[KEY_CODE_S] || keys[KEY_CODE_DOWN]) {move.y+=PLAYER_SPEED_NORM;}
		if (keys[KEY_CODE_A] || keys[KEY_CODE_LEFT]) {move.x-=PLAYER_SPEED_NORM;}
		if (keys[KEY_CODE_D] || keys[KEY_CODE_RIGHT]) {move.x+=PLAYER_SPEED_NORM;}

		//determine speed of player
		var my_speed = (move.x!=0 && move.y!=0) ? PLAYER_SPEED_DIAG : PLAYER_SPEED_NORM;

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
