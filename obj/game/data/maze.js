var canvas;
var context;

//Global constants
var INFINITY = Number.MAX_SAFE_INTEGER; //representation of infinity
//Wall values
var WALL_VAL_UP = 1;
var WALL_VAL_RIGHT = 2;
var WALL_VAL_DOWN = 4;
var WALL_VAL_LEFT = 8;
var WALL_VAL_CEIL = 16;
var WALL_VAL_FLOOR = 32;

//Wall ids
var WALL_ID_UP = 0;
var WALL_ID_RIGHT = 1;
var WALL_ID_DOWN = 2;
var WALL_ID_LEFT = 3;
var WALL_ID_CEIL = 4;
var WALL_ID_FLOOR = 5;

//Drawing size for cell
var CELL_DIM = 10;

//Drawing constants
var HOLE_SIZE = 50;
var RAMP_SIZE = 50;
var TILE_SIZE = 200;
var WALL_THICKNESS = 15;

//Max number of partitions per floor
var FLOOR_MAX_PARTITIONS = 4;
var FLOOR_PARTITION_SIZE_BUFFER = 0.40;

//********************* Constructor for each cell **************************
function Cell(my_loc, my_index) {
  //Create all four walls in cell
  this.wall = new Array(6);
  for(var i=0; i<this.wall.length; i++) {this.wall[i]=true;}

  //Create empty array of wall objects
  this.wall_objs = new Array(6);
  for(var i=0; i<this.wall_objs.length; i++) {this.wall_objs[i]=null;}

  //value used to identify which image will be printed at cell
  this.wall_value = WALL_VAL_UP+WALL_VAL_DOWN+WALL_VAL_LEFT+WALL_VAL_RIGHT+WALL_VAL_CEIL+WALL_VAL_FLOOR;

  //Location of the cell in the grid
  this.loc = {row : my_loc.row, col: my_loc.col, floor: my_loc.floor};

  //Position of cell on screen
  this.screen_pos = {x: this.loc.col*TILE_SIZE, y: this.loc.row*TILE_SIZE};

  //Mark location of cell in disjoint set array
  this.set_index = my_index;

  //Create array of adjacent and accessable cells
  this.adjacent = new Array();

  //Initialize distance from start point to infinity
  this.distance = INFINITY;

  //Draw function for this cell
  this.draw = function() {
    //Draw walls
    for (var i=0; i<this.wall_objs.length; i++) {
      if (this.wall_objs[i]!=null) {this.wall_objs[i].draw();}
    }
  }

  //Add wall objects to cell
  this.add_wall_objs = function() {
    if (this.wall[WALL_ID_UP]) {
      this.wall_objs[WALL_ID_UP] = new Wall({x: this.screen_pos.x, y:this.screen_pos.y, width: TILE_SIZE, height: WALL_THICKNESS});
    }
    if (this.wall[WALL_ID_DOWN]) {
      this.wall_objs[WALL_ID_DOWN] = new Wall({x: this.screen_pos.x, y:this.screen_pos.y+TILE_SIZE-WALL_THICKNESS, width: TILE_SIZE, height: WALL_THICKNESS});
    }
    if (this.wall[WALL_ID_LEFT]) {
      this.wall_objs[WALL_ID_LEFT] = new Wall({x: this.screen_pos.x, y:this.screen_pos.y, width: WALL_THICKNESS, height: TILE_SIZE});
    }
    if (this.wall[WALL_ID_RIGHT]) {
      this.wall_objs[WALL_ID_RIGHT] = new Wall({x: this.screen_pos.x+TILE_SIZE-WALL_THICKNESS, y:this.screen_pos.y, width: WALL_THICKNESS, height: TILE_SIZE});
    }
    if (!this.wall[WALL_ID_CEIL]) {
      this.wall_objs[WALL_ID_CEIL] = new Ramp({x: this.screen_pos.x+(TILE_SIZE/2)-(RAMP_SIZE/2), y: this.screen_pos.y+(TILE_SIZE/2)-(RAMP_SIZE/2), width: RAMP_SIZE, height: RAMP_SIZE});
    }
    if (!this.wall[WALL_ID_FLOOR]) {
      this.wall_objs[WALL_ID_FLOOR] = new Hole({x: this.screen_pos.x+(TILE_SIZE/2)-(HOLE_SIZE/2), y: this.screen_pos.y+(TILE_SIZE/2)-(HOLE_SIZE/2), width: HOLE_SIZE, height: HOLE_SIZE});
    }
  }

  //Change screen position of a cell
  this.set_pos = function(new_pos) {
    this.screen_pos.x = new_pos.x;
    this.screen_pos.y = new_pos.y;

    //Update position of elements in cell
    if (this.wall_objs[WALL_ID_UP]!=null && this.wall_objs[WALL_ID_UP]!=undefined) {
      this.wall_objs[WALL_ID_UP].bounds.x = this.screen_pos.x;
      this.wall_objs[WALL_ID_UP].bounds.y = this.screen_pos.y;
    }
    if (this.wall_objs[WALL_ID_DOWN]!=null && this.wall_objs[WALL_ID_DOWN]!=undefined) {
      this.wall_objs[WALL_ID_DOWN].bounds.x = this.screen_pos.x;
      this.wall_objs[WALL_ID_DOWN].bounds.y = this.screen_pos.y+TILE_SIZE-WALL_THICKNESS;
    }
    if (this.wall_objs[WALL_ID_LEFT]!=null && this.wall_objs[WALL_ID_LEFT]!=undefined) {
      this.wall_objs[WALL_ID_LEFT].bounds.x = this.screen_pos.x;
      this.wall_objs[WALL_ID_LEFT].bounds.y = this.screen_pos.y;
    }
    if (this.wall_objs[WALL_ID_RIGHT]!=null && this.wall_objs[WALL_ID_RIGHT]!=undefined) {
      this.wall_objs[WALL_ID_RIGHT].bounds.x = this.screen_pos.x+TILE_SIZE-WALL_THICKNESS;
      this.wall_objs[WALL_ID_RIGHT].bounds.y = this.screen_pos.y;
    }
    if (this.wall_objs[WALL_ID_CEIL]!=null && this.wall_objs[WALL_ID_CEIL]!=undefined) {
      this.wall_objs[WALL_ID_CEIL].bounds.x = this.screen_pos.x+(TILE_SIZE/2)-(RAMP_SIZE/2);
      this.wall_objs[WALL_ID_CEIL].bounds.y = this.screen_pos.y+(TILE_SIZE/2)-(RAMP_SIZE/2);
    }
    if (this.wall_objs[WALL_ID_FLOOR]!=null && this.wall_objs[WALL_ID_FLOOR]!=undefined) {
      this.wall_objs[WALL_ID_FLOOR].bounds.x = this.screen_pos.x+(TILE_SIZE/2)-(HOLE_SIZE/2);
      this.wall_objs[WALL_ID_FLOOR].bounds.y = this.screen_pos.y+(TILE_SIZE/2)-(HOLE_SIZE/2);
    }
  }
}

//************************ Constructor for maze *****************************
function Maze(my_floor, my_width, my_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //console.log("Maze Creation Begin");
  //Set map view properties
  this.view = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    x_min: 0,
    y_min: 0,
    x_max: (my_width*TILE_SIZE)-canvas.width,
    y_max: (my_height*TILE_SIZE)-canvas.height
  };
  this.view_prev_loc = {x: 0, y:0};
  this.drawable_cells = new Array();
  this.view_num_tiles = {width: Math.floor(this.view.width/TILE_SIZE), height: Math.floor(this.view.height/TILE_SIZE)};

  //Set the number of floors, rows and columns in maze
  this.num_floor = my_floor;
  this.num_col = my_width;
  this.num_row = my_height;

  //Set current floor to top floor
  this.current_floor = this.num_floor-1;

  //Create array of cells
  var cell_count = 0;
  this.cells = new Array(this.num_floor);
  for (var i=0; i<this.num_floor; i++) {
    this.cells[i] = new Array(this.num_row);
    for (var j=0; j<this.num_row; j++) {
      this.cells[i][j] = new Array(this.num_col);
      for (var k=0; k<this.num_col; k++) {
        this.cells[i][j][k] = new Cell({floor: i, row: j, col: k}, cell_count);
        cell_count++;
      }
    }
  }

  //Create disjoint set to track connections between cells
  var total_num_cells = this.num_floor*this.num_row*this.num_col;
  this.paths = new Disjoint_Set(total_num_cells);

  //Create floors of mostly connected paths
  for (var curr_floor=this.num_floor-1; curr_floor>=0; curr_floor--) {
    var num_parts = Math.floor(Math.random()*(FLOOR_MAX_PARTITIONS-2)) + 2;
    var target_set_num = this.paths.get_num_sets()-((this.num_row*this.num_col)-num_parts);

    //Join cells until there is only one paths
    while (this.paths.get_num_sets()>target_set_num) {
      //Grab a random cell and see if it can be joined to an adjacent cell
      var temp_loc = {floor: curr_floor, row: Math.floor(Math.random()*this.num_row), col: Math.floor(Math.random()*this.num_col)};
      var adj_cells = new Array();

      //Get the average length of connected paths
      var lowest_connected_length = INFINITY;
      var num_connected_paths = 0;
      //console.log(curr_floor*this.num_row*this.num_col + ", " + (curr_floor+1)*this.num_row*this.num_col);
      for (var i=curr_floor*this.num_row*this.num_col; i<(curr_floor+1)*this.num_row*this.num_col; i++) {
        var temp_val = this.paths.get_set_size(i);
        if (temp_val<lowest_connected_length) {
          lowest_connected_length = temp_val;
          num_connected_paths++;
        }
      }

      //Set flag if all surrounding cells are above the lowest length
      var all_adj_at_length = true;
      if (temp_loc.row-1>=0 && this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row-1][temp_loc.col].set_index)==lowest_connected_length && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row-1][temp_loc.col].set_index)) {
        all_adj_at_length = false;
      }
      if (temp_loc.row+1<this.num_row && this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row+1][temp_loc.col].set_index)==lowest_connected_length && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row+1][temp_loc.col].set_index)) {
        all_adj_at_length = false;
      }
      if (temp_loc.col-1>=0 && this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col-1].set_index)==lowest_connected_length && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row][temp_loc.col-1].set_index)) {
        all_adj_at_length = false;
      }
      if (temp_loc.col+1<this.num_col && this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col+1].set_index)==lowest_connected_length && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row][temp_loc.col+1].set_index)) {
        all_adj_at_length = false;
      }
      //console.log(curr_floor + ", " + this.paths.get_num_sets() + ", " + target_set_num);

      if (this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index)==lowest_connected_length) {
        //adds cell north to adjacency list if it exists and is in a different set
        if (temp_loc.row-1>=0 && (all_adj_at_length || (this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row-1][temp_loc.col].set_index)==lowest_connected_length)) && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row-1][temp_loc.col].set_index)) {
          adj_cells.push({floor: temp_loc.floor, row: temp_loc.row-1, col: temp_loc.col});
        }
        //adds cell south to adjacency list if it exists and is in a different set
        if (temp_loc.row+1<this.num_row && (all_adj_at_length || (this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row+1][temp_loc.col].set_index)==lowest_connected_length)) && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row+1][temp_loc.col].set_index)) {
          adj_cells.push({floor: temp_loc.floor, row: temp_loc.row+1, col: temp_loc.col});
        }
        //adds cell to the west to adjacency list if it exists and is in a different set
        if (temp_loc.col-1>=0 && (all_adj_at_length || (this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col-1].set_index)==lowest_connected_length)) && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row][temp_loc.col-1].set_index)) {
          adj_cells.push({floor: temp_loc.floor, row: temp_loc.row, col: temp_loc.col-1});
        }
        //adds cell to the east to adjacency list if it exists and is in a different set
        if (temp_loc.col+1<this.num_col && (all_adj_at_length || (this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col+1].set_index)==lowest_connected_length)) && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row][temp_loc.col+1].set_index)) {
          adj_cells.push({floor: temp_loc.floor, row: temp_loc.row, col: temp_loc.col+1});
        }
      }

      var chosen = Math.floor(Math.random()*adj_cells.length);
      //If there is at least one available adjacent cell, pick a cell and join it to the set
      //if (adj_cells.length>0 && this.paths.get_set_size(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index)<max_set_length && this.paths.get_set_size(this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].set_index)<max_set_length) {
      if (adj_cells.length>0) {
        this.paths.join(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].set_index);
        //console.log("Joined " + temp_loc.row + ", " + temp_loc.col + " and " + adj_cells[chosen].row + ", " + adj_cells[chosen].col);

        //Destroy propper walls
        if (temp_loc.row>adj_cells[chosen].row) {
          //If the chosen cell is north of the currently selected cell
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_UP] = false;
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_UP;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_DOWN] = false;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_DOWN;
        }
        else if (temp_loc.row<adj_cells[chosen].row) {
          //If the chosen cell is south of the currently selected cell
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_DOWN] = false;
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_DOWN;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_UP] = false;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_UP;
        }
        else if (temp_loc.col>adj_cells[chosen].col) {
          //If the chosen cell is west of the currently selected cell
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_LEFT] = false;
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_LEFT;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_RIGHT] = false;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_RIGHT;
        }
        else if (temp_loc.col<adj_cells[chosen].col) {
          //If the chosen cell is east of the currently selected cell
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_RIGHT] = false;
          this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_RIGHT;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_LEFT] = false;
          this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_LEFT;
        }

        //Add cells to each other's adjacency list
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].adjacent.push({floor: adj_cells[chosen].floor, row: adj_cells[chosen].row, col: adj_cells[chosen].col});
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].adjacent.push({floor: temp_loc.floor, row: temp_loc.row, col: temp_loc.col});
      }
    }
  }

  //Join cells until there is only one paths
  while (this.paths.get_num_sets()>1) {
    //Grab a random cell and see if it can be joined to an adjacent cell
    var temp_loc = {floor: Math.floor(Math.random()*this.num_floor), row: Math.floor(Math.random()*this.num_row), col: Math.floor(Math.random()*this.num_col)};
    var adj_cells = new Array();
    //adds cell north to adjacency list if it exists and is in a different set
    /*if (temp_loc.row-1>=0 && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row-1][temp_loc.col].set_index)) {
      adj_cells.push({floor: temp_loc.floor, row: temp_loc.row-1, col: temp_loc.col});
    }
    //adds cell south to adjacency list if it exists and is in a different set
    if (temp_loc.row+1<this.num_row && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row+1][temp_loc.col].set_index)) {
      adj_cells.push({floor: temp_loc.floor, row: temp_loc.row+1, col: temp_loc.col});
    }
    //adds cell to the west to adjacency list if it exists and is in a different set
    if (temp_loc.col-1>=0 && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row][temp_loc.col-1].set_index)) {
      adj_cells.push({floor: temp_loc.floor, row: temp_loc.row, col: temp_loc.col-1});
    }
    //adds cell to the east to adjacency list if it exists and is in a different set
    if (temp_loc.col+1<this.num_col && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor][temp_loc.row][temp_loc.col+1].set_index)) {
      adj_cells.push({floor: temp_loc.floor, row: temp_loc.row, col: temp_loc.col+1});
    }*/
    //adds ceiling cell to adjacency list if it exists and is in a different set and floor is not destroyed
    if (this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_FLOOR] && temp_loc.floor+1<this.num_floor && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor+1][temp_loc.row][temp_loc.col].set_index)) {
      adj_cells.push({floor: temp_loc.floor+1, row: temp_loc.row, col: temp_loc.col});
    }
    //adds floor cell to adjacency list if it exists and is in a different set and ceiling is not destroyed
    if (this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_CEIL] && temp_loc.floor-1>=0 && !this.paths.in_same_set(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.floor-1][temp_loc.row][temp_loc.col].set_index)) {
      adj_cells.push({floor: temp_loc.floor-1, row: temp_loc.row, col: temp_loc.col});
    }

    //If there is at least one available adjacent cell, pick a cell and join it to the set
    if (adj_cells.length>0) {
      var chosen = Math.floor(Math.random()*adj_cells.length);
      this.paths.join(this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].set_index, this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].set_index);
      //console.log("Joined " + temp_loc.row + ", " + temp_loc.col + " and " + adj_cells[chosen].row + ", " + adj_cells[chosen].col);

      //Destry propper walls
      if (temp_loc.row>adj_cells[chosen].row) {
        //If the chosen cell is north of the currently selected cell
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_UP] = false;
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_UP;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_DOWN] = false;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_DOWN;
      }
      else if (temp_loc.row<adj_cells[chosen].row) {
        //If the chosen cell is south of the currently selected cell
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_DOWN] = false;
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_DOWN;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_UP] = false;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_UP;
      }
      else if (temp_loc.col>adj_cells[chosen].col) {
        //If the chosen cell is west of the currently selected cell
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_LEFT] = false;
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_LEFT;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_RIGHT] = false;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_RIGHT;
      }
      else if (temp_loc.col<adj_cells[chosen].col) {
        //If the chosen cell is east of the currently selected cell
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_RIGHT] = false;
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_RIGHT;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_LEFT] = false;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_LEFT;
      }
      else if (temp_loc.floor<adj_cells[chosen].floor) {
        //If the chosen cell is above of the currently selected cell
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_CEIL] = false;
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_CEIL;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_FLOOR] = false;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_FLOOR;
      }
      else if (temp_loc.floor>adj_cells[chosen].floor) {
        //If the chosen cell is above of the currently selected cell
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall[WALL_ID_FLOOR] = false;
        this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_FLOOR;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_CEIL] = false;
        this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_CEIL;
      }

      //Add cells to each other's adjacency list
      this.cells[temp_loc.floor][temp_loc.row][temp_loc.col].adjacent.push({floor: adj_cells[chosen].floor, row: adj_cells[chosen].row, col: adj_cells[chosen].col});
      this.cells[adj_cells[chosen].floor][adj_cells[chosen].row][adj_cells[chosen].col].adjacent.push({floor: temp_loc.floor, row: temp_loc.row, col: temp_loc.col});
    }
  }

  //Create wall objects
  for (var i=0; i<this.num_floor; i++) {
    for (var j=0; j<this.num_row; j++) {
      for (var k=0; k<this.num_col; k++) {
        this.cells[i][j][k].add_wall_objs();
      }
    }
  }

  //console.log("Maze Creation Complete");

  //************************** Draw methods for map ****************************
  this.draw = function() {
    //Draw all drawable cells
    for (var i=0; i<this.drawable_cells.length; i++) {
      this.drawable_cells[i].draw();
    }
  }

  //************************ Draw methods for testing **************************
  this.test_draw = function() {
    canvas.width = CELL_DIM*this.num_col;
    canvas.height = CELL_DIM*this.num_row;
    for (var i=0; i<this.num_row; i++) {
      for (var j=0; j<this.num_col; j++) {

        //Draw upper wall if it exists
        if (this.cells[i][j].wall[WALL_ID_UP]) {
          context.beginPath();
          context.moveTo(j*CELL_DIM, i*CELL_DIM);
          context.lineTo((j*CELL_DIM)+CELL_DIM, i*CELL_DIM);
          context.stroke();
        }
        //Draw lower wall if it exists
        if (this.cells[i][j].wall[WALL_ID_DOWN]) {
          context.beginPath();
          context.moveTo(j*CELL_DIM, (i*CELL_DIM)+CELL_DIM);
          context.lineTo((j*CELL_DIM)+CELL_DIM, (i*CELL_DIM)+CELL_DIM);
          context.stroke();
        }
        //Draw left wall if it exists
        if (this.cells[i][j].wall[WALL_ID_LEFT]) {
          context.beginPath();
          context.moveTo(j*CELL_DIM, i*CELL_DIM);
          context.lineTo(j*CELL_DIM, (i*CELL_DIM)+CELL_DIM);
          context.stroke();
        }
        //Draw right wall if it exists
        if (this.cells[i][j].wall[WALL_ID_RIGHT]) {
          context.beginPath();
          context.moveTo((j*CELL_DIM)+CELL_DIM, i*CELL_DIM);
          context.lineTo((j*CELL_DIM)+CELL_DIM, (i*CELL_DIM)+CELL_DIM);
          context.stroke();
        }
      }
    }
  }

  this.test_draw_path = function(path) {
    context.fillStyle = "red";
    for (var i=0; i<path.length; i++) {
      context.beginPath();
      context.arc((path[i].col*CELL_DIM)+(CELL_DIM/2), (path[i].row*CELL_DIM)+(CELL_DIM/2), (CELL_DIM/3), Math.PI*2, false);
      context.fill();
    }
  }

  //**************************** Scroll the maze *******************************
  //Attempt to scroll the maze, return false if maze is at upper bound
  this.scroll_up = function(speed) {
    this.view_prev_loc = {x: this.view.x, y: this.view.y};
    if (this.view.y==this.view.y_min) {return false;}
    else if (this.view.y-speed<this.view.y_min) {this.view.y = this.view.y_min;}
    else {this.view.y-=speed;}

    return true;
  }

  //Attempt to scroll the maze, return false if maze is at lower bound
  this.scroll_down = function(speed) {
    this.view_prev_loc = {x: this.view.x, y: this.view.y};
    if (this.view.y==this.view.y_max) {return false;}
    else if (this.view.y+speed>this.view.y_max) {this.view.y = this.view.y_max;}
    else {this.view.y+=speed;}

    return true;
  }

  //Attempt to scroll the maze, return false if maze is at left bound
  this.scroll_left = function(speed) {
    this.view_prev_loc = {x: this.view.x, y: this.view.y};
    if (this.view.x==this.view.x_min) {return false;}
    else if (this.view.x-speed<this.view.x_min) {this.view.x = this.view.x_min;}
    else {this.view.x-=speed;}

    return true;
  }

  //Attempt to scroll the maze, return false if maze is at right bound
  this.scroll_right = function(speed) {
    this.view_prev_loc = {x: this.view.x, y: this.view.y};
    if (this.view.x==this.view.x_max) {return false;}
    else if (this.view.x+speed>this.view.x_max) {this.view.x = this.view.x_max;}
    else {this.view.x+=speed;}

    return true;
  }

  //***************************** Solve the maze *******************************
  this.solve = function(start_loc, end_loc) {
    var visited = new Set(); //Set of all nodes algorithm has checked
    var unvisited = new Set(); //Set of all nodes algorithm has not checked
    var distances = new Priority_Queue(); //Distance of each node to the start point
    //Create array of predecessors
    var predecessor = new Array(this.num_floor);
    for (var i=0; i<predecessor.length; i++) {
      predecessor[i] = new Array(this.num_row);
      for (var j=0; j<predecessor[i].length; j++) {
        predecessor[i][j] = new Array(this.num_col);
      }
    }
    var current_cell; //The current cell we are investigating

    //Fill data structures
    for (var i=0; i<this.cells.length; i++) {
      for (var j=0; j<this.cells[i].length; j++) {
        for (var k=0; k<this.cells[i][j].length; k++) {
          unvisited.add("f" + i + "r" + j + "c" + k);
          predecessor[i][j][k] = null;
          distances.push({floor: i, row: j, col: k, priority: INFINITY});
        }
      }
    }

    //Set distance of the start node to 0
    distances.change_priority({floor: start_loc.floor, row: start_loc.row, col: start_loc.col}, 0);
    this.cells[start_loc.floor][start_loc.row][start_loc.col].distance = 0;

    //Iterate until all nodes have been visited
    while (unvisited.size>0) {
      //Get cell with the current shortest distance
      var temp = distances.pop();
      current_cell = {floor: temp.floor, row: temp.row, col: temp.col};
      unvisited.delete("f" + current_cell.floor + "r" + current_cell.row + "c" + current_cell.col);
      visited.add("f" + current_cell.floor + "r" + current_cell.row + "c" + current_cell.col);

      var adj_cells = this.cells[current_cell.floor][current_cell.row][current_cell.col].adjacent;
      //Relax all nodes connected to the current node and update their predecessors
      for (var i=0; i<adj_cells.length; i++) {
        //Get the current distance from the start point to the adjacent cell
        var curr_distance = this.cells[adj_cells[i].floor][adj_cells[i].row][adj_cells[i].col].distance;
        //Set the potential new distance to that cell to be the distance to the current cell plus 1
        var new_distance = this.cells[current_cell.floor][current_cell.row][current_cell.col].distance+1;

        //Update data structures if the new path to the adjacent node would be shorter
        //than its current path
        if (curr_distance<0 || new_distance<curr_distance) {
          this.cells[adj_cells[i].floor][adj_cells[i].row][adj_cells[i].col].distance = new_distance;
          predecessor[adj_cells[i].floor][adj_cells[i].row][adj_cells[i].col] = {floor: current_cell.floor, row: current_cell.row, col: current_cell.col};
          if (unvisited.has("f" + adj_cells[i].floor + "r" + adj_cells[i].row + "c" + adj_cells[i].col)) {
            distances.change_priority({floor: adj_cells[i].floor, row: adj_cells[i].row, col: adj_cells[i].col}, new_distance);
          }
        }
      }
    }

    //Construct path from predecessor data
    var path = new Array();
    current_cell = {floor: end_loc.floor, row: end_loc.row, col: end_loc.col};
    while (predecessor[current_cell.floor][current_cell.row][current_cell.col]!=null) {
      path.push({floor: current_cell.floor, row: current_cell.row, col: current_cell.col});
      current_cell = {floor: predecessor[current_cell.floor][current_cell.row][current_cell.col].floor, row: predecessor[current_cell.floor][current_cell.row][current_cell.col].row, col: predecessor[current_cell.floor][current_cell.row][current_cell.col].col};
    }
    path.push({floor: start_loc.floor, row: start_loc.row, col: start_loc.col})

    //Reverse direction of path and return
    path.reverse();

    return path;
  }

  //**************************** Update the maze *******************************
  this.update = function(lighting) {
    this.drawable_cells = new Array();
    var start_cell = {floor: this.current_floor, row: Math.floor(this.view.y/TILE_SIZE), col: Math.floor(this.view.x/TILE_SIZE)};
    var tile_offset = {width: this.view.x%TILE_SIZE, height: this.view.y%TILE_SIZE};

    //mark last row and col to draw
    var last_col = (start_cell.col+this.view_num_tiles.width+2)>this.num_col ? this.num_col : start_cell.col+this.view_num_tiles.width+2;
    var last_row = (start_cell.row+this.view_num_tiles.height+2)>this.num_row ? this.num_row : start_cell.row+this.view_num_tiles.height+2;

    lighting.objects = new Array();
    var count = {row: 0, col: 0};
    for(var i=start_cell.row; i<last_row; i++) {
      for(var j=start_cell.col; j<last_col; j++) {
        //Update position of cell
        this.cells[this.current_floor][i][j].set_pos({x: (count.col*TILE_SIZE)-tile_offset.width, y: (count.row*TILE_SIZE)-tile_offset.height});
        //Add to list of drawable objects
        this.drawable_cells.push(this.cells[this.current_floor][i][j]);

        //Add ramp to list of shadowed objects
        if (this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL]!=null) {
          lighting.objects.push(new illuminated.RectangleObject({ topleft: new illuminated.Vec2(this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL].bounds.x, this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL].bounds.y), bottomright: new illuminated.Vec2(this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL].bounds.x+this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL].bounds.width, this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL].bounds.y+this.cells[this.current_floor][i][j].wall_objs[WALL_ID_CEIL].bounds.height) }));
        }
        count.col++;
      }
      count.row++;
      count.col=0;
    }
  }
}

//************************ Constructor for hole *****************************
function Hole(bounds) {
  //Create hole boundaries
  this.bounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    type: Game.RECT_ID
  };
  this.obj_type = Game.HOLE_ID;

  //Drawing Method for holes
  this.draw = function() {
    context.fillStyle = "#BAF018";
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }
}

//************************ Constructor for ramp *****************************
function Ramp(bounds) {
  //Create ramp boundaries
  this.bounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    type: Game.RECT_ID
  };
  this.obj_type = Game.RAMP_ID;

  //Drawing Method for ramp
  this.draw = function() {
    context.fillStyle = "green";
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }
}

//************************ Constructor for wall *****************************
function Wall(bounds) {
  //Create wall boundaries
  this.bounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    type: Game.RECT_ID
  };
  this.obj_type = Game.WALL_ID;

  //Drawing Method for walls
  this.draw = function() {
    context.fillStyle = "red";
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }
}
