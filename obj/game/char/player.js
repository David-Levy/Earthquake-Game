var canvas;
var context;

//Size of player
var PLAYER_DIM = 25;

//Player movement speed
var PLAYER_SPEED_NORM = 8;
var PLAYER_SPEED_DIAG = Math.sqrt(Math.pow(PLAYER_SPEED_NORM, 2)+Math.pow(PLAYER_SPEED_NORM, 2))/2;

//Points at which screen will scroll
var SCROLL_POINT_HOR = 150;
var SCROLL_POINT_VERT = 150;

var KEY_CODE_RIGHT = 68;//d
var KEY_CODE_LEFT = 65;//a
var KEY_CODE_UP = 87;//w
var KEY_CODE_DOWN = 83;//s

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

	//Draw the player
	this.draw = function() {
		context.fillStyle = "blue";
		context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	}

  //Update Player
  this.update = function(keys) {
		//Direction to move player
		var move = {x: 0, y: 0};

		if (keys[KEY_CODE_UP]) {move.y-=PLAYER_SPEED_NORM;}
		if (keys[KEY_CODE_DOWN]) {move.y+=PLAYER_SPEED_NORM;}
		if (keys[KEY_CODE_LEFT]) {move.x-=PLAYER_SPEED_NORM;}
		if (keys[KEY_CODE_RIGHT]) {move.x+=PLAYER_SPEED_NORM;}

		//determine speed of player
		var my_speed = (move.x!=0 && move.y!=0) ? PLAYER_SPEED_DIAG : PLAYER_SPEED_NORM;

		//Move Player
		var scrolled = false;
		if (move.x>0) {
			//Try and scroll the screen if beyond the scroll point
			if (this.bounds.x+my_speed>=this.scroll_point_right) {
				if (this.bounds.x==this.scroll_point_right) {
					scrolled = this.my_maze.scroll_right(my_speed);
				}
				else {
					var scroll_speed = (this.bounds.x+my_speed)-this.scroll_point_right;
					if (this.my_maze.scroll_right(scroll_speed)) {
						scrolled = true;
						this.bounds.x+=(my_speed-scroll_speed);
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
				}
				else {
					var scroll_speed = this.scroll_point_left-(this.bounds.x-my_speed);
					if (this.my_maze.scroll_left(scroll_speed)) {
						scrolled = true;
						this.bounds.x-=(my_speed-scroll_speed);
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
				}
				else {
					var scroll_speed = (this.bounds.y+my_speed)-this.scroll_point_down;
					if (this.my_maze.scroll_down(scroll_speed)) {
						scrolled = true;
						this.bounds.y+=(my_speed-scroll_speed);
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
				}
				else {
					var scroll_speed = this.scroll_point_up-(this.bounds.y-my_speed);
					if (this.my_maze.scroll_up(scroll_speed)) {
						scrolled = true;
						this.bounds.y-=(my_speed-scroll_speed);
					}
				}
			}

			//If the screen was not scrolled move right normally
			if (!scrolled) {this.bounds.y-=my_speed;}
		}
  }
}
