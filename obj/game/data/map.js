var canvas;
var context;

var CELL_DIM = 45;
var BORDER_OFFSET = 20;
var MAP_DRAW_OFFSET = 100;
var BUTTON_WIDTH = 75;
var BUTTON_HEIGHT = 42;
var BUTTON_GAP = 30;
var BUTTON_VERTICAL_OFFSET = 15;

function Map(maze, player) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  this.my_maze = maze;
  this.my_player = player;
  this.bounds = {
    x: (canvas.width/2)-(((canvas.height-(BORDER_OFFSET*2))*1.5)/2),
    y: BORDER_OFFSET,
    width: (canvas.height-(BORDER_OFFSET*2))*1.5,
    height: canvas.height-(BORDER_OFFSET*2)
  };
  this.inset = {
    x: (canvas.width/2) - ((CELL_DIM*this.my_maze.num_col)/2),
    y: MAP_DRAW_OFFSET
  };
  this.player_pos = {floor: 0, row: 0, col: 0};
  this.current_floor = maze.current_floor;
  this.player_opacity = 1;
  this.player_fade_dir = -1;
  this.player_fade_speed = 0.015;
  this.npc_discovered = false;

  //Create buttons
  this.down_button = {
    bounds: {
      x: (canvas.width/2)-BUTTON_WIDTH-(BUTTON_GAP/2),
      y: canvas.height-BORDER_OFFSET-BUTTON_HEIGHT-BUTTON_VERTICAL_OFFSET,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      type: Game.RECT_ID
    }
  };
  this.up_button = {
    bounds: {
      x: (canvas.width/2)+(BUTTON_GAP/2),
      y: canvas.height-BORDER_OFFSET-BUTTON_HEIGHT-BUTTON_VERTICAL_OFFSET,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      type: Game.RECT_ID
    }
  };

  //************************** Draw method for map *****************************
  this.draw = function() {
    //Draw the backround image
    context.drawImage(Sprite.map_bg, this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    context.strokeStyle = "white";
    context.strokeRect(this.inset.x, this.inset.y, CELL_DIM*this.my_maze.num_col, CELL_DIM*this.my_maze.num_row);
    context.strokeStyle = "black";

    //Draw floor indicator
    context.textAlign = "center";
    var floor_text = "Floor: " + (this.current_floor+1) + "/" + this.my_maze.num_floor;
    context.fillStyle = 'black';
    context.font = "25px Trebuchet MS";
    context.fillText(floor_text, canvas.width/2, (MAP_DRAW_OFFSET-BORDER_OFFSET));

    for (var i=0; i<this.my_maze.num_row; i++) {
      for (var j=0; j<this.my_maze.num_col; j++) {
        //If cell is discovered
        if (this.my_maze.cells[this.current_floor][i][j].discovered) {
          //Draw upper wall if it exists
          if (this.my_maze.cells[this.current_floor][i][j].wall[Maze.WALL_ID_UP]) {
            context.beginPath();
            context.moveTo((j*CELL_DIM)+(this.inset.x), (i*CELL_DIM)+(this.inset.y));
            context.lineTo((j*CELL_DIM)+CELL_DIM+(this.inset.x), (i*CELL_DIM)+(this.inset.y));
            context.stroke();
          }
          //Draw lower wall if it exists
          if (this.my_maze.cells[this.current_floor][i][j].wall[Maze.WALL_ID_DOWN]) {
            context.beginPath();
            context.moveTo((j*CELL_DIM)+(this.inset.x), (i*CELL_DIM)+CELL_DIM+(this.inset.y));
            context.lineTo((j*CELL_DIM)+CELL_DIM+(this.inset.x), (i*CELL_DIM)+CELL_DIM+(this.inset.y));
            context.stroke();
          }
          //Draw left wall if it exists
          if (this.my_maze.cells[this.current_floor][i][j].wall[Maze.WALL_ID_LEFT]) {
            context.beginPath();
            context.moveTo((j*CELL_DIM)+(this.inset.x), (i*CELL_DIM)+(this.inset.y));
            context.lineTo((j*CELL_DIM)+(this.inset.x), (i*CELL_DIM)+CELL_DIM+(this.inset.y));
            context.stroke();
          }
          //Draw right wall if it exists
          if (this.my_maze.cells[this.current_floor][i][j].wall[Maze.WALL_ID_RIGHT]) {
            context.beginPath();
            context.moveTo((j*CELL_DIM)+CELL_DIM+(this.inset.x), (i*CELL_DIM)+(this.inset.y));
            context.lineTo((j*CELL_DIM)+CELL_DIM+(this.inset.x), (i*CELL_DIM)+CELL_DIM+(this.inset.y));
            context.stroke();
          }
          //Draw hole marker if it exists
          if (!this.my_maze.cells[this.current_floor][i][j].wall[Maze.WALL_ID_FLOOR]) {
            context.fillStyle = "#BAF018";
            context.fillRect((j*CELL_DIM)+(CELL_DIM/2)+this.inset.x-(CELL_DIM/4), (i*CELL_DIM)+(CELL_DIM/2)+this.inset.y-(CELL_DIM/4), (CELL_DIM/2), (CELL_DIM/2));
          }
          //Draw ramp marker if it exists
          if (!this.my_maze.cells[this.current_floor][i][j].wall[Maze.WALL_ID_CEIL]) {
            context.fillStyle = "green";
            context.fillRect((j*CELL_DIM)+(CELL_DIM/2)+this.inset.x-(CELL_DIM/4), (i*CELL_DIM)+(CELL_DIM/2)+this.inset.y-(CELL_DIM/4), (CELL_DIM/2), (CELL_DIM/2));
          }
          //Draw exit marker if it exists
          if (this.my_maze.cells[this.current_floor][i][j].my_exit!=null) {
            context.fillStyle = "blue";
            context.fillRect((j*CELL_DIM)+(CELL_DIM/2)+this.inset.x-(CELL_DIM/4), (i*CELL_DIM)+(CELL_DIM/2)+this.inset.y-(CELL_DIM/4), (CELL_DIM/2), (CELL_DIM/2));
          }
          //Draw npc marker if it exists
          if (this.my_maze.cells[this.current_floor][i][j].my_npc!=null) {
            context.fillStyle = "purple";
            context.beginPath();
            context.arc(this.inset.x+(CELL_DIM/2)+(j*CELL_DIM), this.inset.y+(CELL_DIM/2)+(i*CELL_DIM), CELL_DIM/4, 0, Math.PI*2, false);
            context.fill();
          }
        }
      }
    }

    //Draw buttons
    context.textAlign = "center";
    var floor_text = "Change Floor";
    context.fillStyle = 'black';
    context.font = "23px Trebuchet MS";
    context.fillText(floor_text, canvas.width/2, this.up_button.bounds.y-15);
    context.fillStyle = "#DFE39A";
    context.fillRect(this.up_button.bounds.x, this.up_button.bounds.y, this.up_button.bounds.width, this.up_button.bounds.height);
    context.drawImage(Sprite.map_ui_up_arrow, this.up_button.bounds.x, this.up_button.bounds.y, this.up_button.bounds.width, this.up_button.bounds.height);
    context.fillRect(this.down_button.bounds.x, this.down_button.bounds.y, this.down_button.bounds.width, this.down_button.bounds.height);
    context.drawImage(Sprite.map_ui_down_arrow, this.down_button.bounds.x, this.down_button.bounds.y, this.down_button.bounds.width, this.down_button.bounds.height);

    //Draw Player position if on the propper floor
    if (this.current_floor==this.my_player.loc.floor) {
      context.globalAlpha = this.player_opacity;
      context.fillStyle = "red";
      context.beginPath();
      context.arc(this.inset.x+(CELL_DIM/2)+(this.my_player.loc.col*CELL_DIM), this.inset.y+(CELL_DIM/2)+(this.my_player.loc.row*CELL_DIM), CELL_DIM/4, 0, Math.PI*2, false);
      context.fill();
      context.globalAlpha = 1;
    }

    //Draw Legend
    context.textAlign = "left";
    context.fillStyle = "red";
    context.beginPath();
    context.arc(this.bounds.x+20+(CELL_DIM/2), this.inset.y+(this.my_maze.num_row*CELL_DIM) + 35, CELL_DIM/4, 0, Math.PI*2, false);
    context.fill();
    context.fillStyle = "black";
    context.fillText("- You Are Here", this.bounds.x+40+(CELL_DIM/2), this.inset.y+(this.my_maze.num_row*CELL_DIM) + 42.5);

    //Only displays legend text if you have discovered a npc
    if (this.my_player.discovered_npc) {
      context.fillStyle = "purple";
      context.beginPath();
      context.arc(this.bounds.x+20+(CELL_DIM/2), this.inset.y+(this.my_maze.num_row*CELL_DIM) + 35 + (CELL_DIM-10), CELL_DIM/4, 0, Math.PI*2, false);
      context.fill();
      context.fillStyle = "black";
      context.fillText("- Survivor", this.bounds.x+40+(CELL_DIM/2), this.inset.y+(this.my_maze.num_row*CELL_DIM) + 42.5 + (CELL_DIM-10));
    }

    //Draw inventory
    context.fillStyle = "black";
    context.fillText(("Batteries:    x" +this.my_player.inventory.battery.length), this.bounds.x+this.bounds.width-175,this.inset.y+(this.my_maze.num_row*CELL_DIM) + 42.5);
    context.fillText(("Health Kits: x" +this.my_player.inventory.med_kit), this.bounds.x+this.bounds.width-175,this.inset.y+(this.my_maze.num_row*CELL_DIM) + 42.5 + (CELL_DIM-10));
  }

  //Update method for map
  this.update = function(mouse_info) {
    //Adjust player fade
    this.player_opacity += (this.player_fade_dir*this.player_fade_speed);
    if (this.player_opacity>=1) {
      this.player_opacity = 1;
      this.player_fade_dir *= -1;
    }
    else if (this.player_opacity<=0) {
      this.player_opacity = 0;
      this.player_fade_dir *= -1;
    }

    if (mouse_info.last_clicked_left && !mouse_info.clicked_left) {
      if (Game.mouse_over(this.up_button, mouse_info)) {
        if (this.current_floor<this.my_maze.num_floor-1) {this.current_floor++;}
      }
      else if (Game.mouse_over(this.down_button, mouse_info)) {
        if (this.current_floor>0) {this.current_floor--;}
      }
    }
    if (mouse_info.last_clicked_right && !mouse_info.clicked_right) {
      return true;
    }

    return false;
  }
}
