var canvas;
var context;

//Global constants
var INFINITY = 10000000; //representation of infinity
//Wall values
var WALL_VAL_UP = 1;
var WALL_VAL_RIGHT = 2;
var WALL_VAL_DOWN = 4;
var WALL_VAL_LEFT = 8;

//Wall ids
var WALL_ID_UP = 0;
var WALL_ID_RIGHT = 1;
var WALL_ID_DOWN = 2;
var WALL_ID_LEFT = 3;

//Drawing size for cell
var CELL_DIM = 10;

//Drawing constants
var TILE_SIZE = 100;
var WALL_THICKNESS = 10;

//********************* Constructor for each cell **************************
function Cell(my_loc, my_index) {
  //Create all four walls in cell
  this.wall = new Array(4);
  for(var i=0; i<this.wall.length; i++) {this.wall[i]=true;}

  //Create empty array of wall objects
  this.wall_objs = new Array(4);
  for(var i=0; i<this.wall_objs.length; i++) {this.wall_objs[i]=null;}

  //value used to identify which image will be printed at cell
  this.wall_value = WALL_VAL_UP+WALL_VAL_DOWN+WALL_VAL_LEFT+WALL_VAL_RIGHT;

  //Location of the cell in the grid
  this.loc = {row : my_loc.row, col: my_loc.col};

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
      this.wall_objs[WALL_ID_UP] = new Wall({x: this.screen_pos, y:this.screen_pos, width: TILE_SIZE, height: WALL_THICKNESS});
    }
    if (this.wall[WALL_ID_DOWN]) {
      this.wall_objs[WALL_ID_DOWN] = new Wall({x: this.screen_pos, y:this.screen_pos+TILE_SIZE-WALL_THICKNESS, width: TILE_SIZE, height: WALL_THICKNESS});
    }
    if (this.wall[WALL_ID_LEFT]) {
      this.wall_objs[WALL_ID_LEFT] = new Wall({x: this.screen_pos, y:this.screen_pos, width: WALL_THICKNESS, height: TILE_SIZE});
    }
    if (this.wall[WALL_ID_RIGHT]) {
      this.wall_objs[WALL_ID_RIGHT] = new Wall({x: this.screen_pos+TILE_SIZE-WALL_THICKNESS, y:this.screen_pos, width: WALL_THICKNESS, height: TILE_SIZE});
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
  }
}

//************************ Constructor for maze *****************************
function Maze(my_width, my_height) {
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
  this.drawable_cells = new Array();
  this.view_num_tiles = {width: Math.floor(this.view.width/TILE_SIZE), height: Math.floor(this.view.height/TILE_SIZE)};


  //Set the number of rows and columns in maze
  this.num_col = my_width;
  this.num_row = my_height;

  //Create array of cells
  var cell_count = 0;
  this.cells = new Array(this.num_row);
  for (var i=0; i<this.num_row; i++) {
    this.cells[i] = new Array(this.num_col);
    for (var j=0; j<this.num_col; j++) {
      this.cells[i][j] = new Cell({row: i, col: j}, cell_count);
      cell_count++;
    }
  }

  //Create disjoint set to track connections between cells
  this.paths = new Disjoint_Set(this.num_row*this.num_col);

  //Join cells until there is only one paths
  while (this.paths.get_num_sets()>1) {
    //Grab a random cell and see if it can be joined to an adjacent cell
    var temp_loc = {row: Math.floor(Math.random()*this.num_row), col: Math.floor(Math.random()*this.num_col)};
    var adj_cells = new Array();
    //adds cell above to adjacency list if it exists and is in a different set
    if (temp_loc.row-1>=0 && !this.paths.in_same_set(this.cells[temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.row-1][temp_loc.col].set_index)) {
      adj_cells.push({row: temp_loc.row-1, col: temp_loc.col});
    }
    //adds cell below to adjacency list if it exists and is in a different set
    if (temp_loc.row+1<this.num_row && !this.paths.in_same_set(this.cells[temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.row+1][temp_loc.col].set_index)) {
      adj_cells.push({row: temp_loc.row+1, col: temp_loc.col});
    }
    //adds cell to the left to adjacency list if it exists and is in a different set
    if (temp_loc.col-1>=0 && !this.paths.in_same_set(this.cells[temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.row][temp_loc.col-1].set_index)) {
      adj_cells.push({row: temp_loc.row, col: temp_loc.col-1});
    }
    //adds cell to the right to adjacency list if it exists and is in a different set
    if (temp_loc.col+1<this.num_col && !this.paths.in_same_set(this.cells[temp_loc.row][temp_loc.col].set_index, this.cells[temp_loc.row][temp_loc.col+1].set_index)) {
      adj_cells.push({row: temp_loc.row, col: temp_loc.col+1});
    }

    //If there is at least one available adjacent cell, pick a cell and join it to the set
    if (adj_cells.length>0) {
      var chosen = Math.floor(Math.random()*adj_cells.length);
      this.paths.join(this.cells[temp_loc.row][temp_loc.col].set_index, this.cells[adj_cells[chosen].row][adj_cells[chosen].col].set_index);
      //console.log("Joined " + temp_loc.row + ", " + temp_loc.col + " and " + adj_cells[chosen].row + ", " + adj_cells[chosen].col);

      //Destry propper walls
      if (temp_loc.row>adj_cells[chosen].row) {
        //If the chosen cell is above the currently selected cell
        this.cells[temp_loc.row][temp_loc.col].wall[WALL_ID_UP] = false;
        this.cells[temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_UP;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_DOWN] = false;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_DOWN;
      }
      else if (temp_loc.row<adj_cells[chosen].row) {
        //If the chosen cell is below the currently selected cell
        this.cells[temp_loc.row][temp_loc.col].wall[WALL_ID_DOWN] = false;
        this.cells[temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_DOWN;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_UP] = false;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_UP;
      }
      else if (temp_loc.col>adj_cells[chosen].col) {
        //If the chosen cell is to the left of the currently selected cell
        this.cells[temp_loc.row][temp_loc.col].wall[WALL_ID_LEFT] = false;
        this.cells[temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_LEFT;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_RIGHT] = false;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_RIGHT;
      }
      else if (temp_loc.col<adj_cells[chosen].col) {
        //If the chosen cell is to the right of the currently selected cell
        this.cells[temp_loc.row][temp_loc.col].wall[WALL_ID_RIGHT] = false;
        this.cells[temp_loc.row][temp_loc.col].wall_value -= WALL_VAL_RIGHT;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall[WALL_ID_LEFT] = false;
        this.cells[adj_cells[chosen].row][adj_cells[chosen].col].wall_value -= WALL_VAL_LEFT;
      }

      //Add cells to each other's adjacency list
      this.cells[temp_loc.row][temp_loc.col].adjacent.push({row: adj_cells[chosen].row, col: adj_cells[chosen].col});
      this.cells[adj_cells[chosen].row][adj_cells[chosen].col].adjacent.push({row: temp_loc.row, col: temp_loc.col});
    }
  }

  //Create wall objects
  for (var i=0; i<this.num_row; i++) {
    for (var j=0; j<this.num_col; j++) {
      this.cells[i][j].add_wall_objs();
    }
  }

  //console.log("Maze Creation Complete");

  //************************** Draw methods for map ****************************
  this.draw = function() {
    canvas.width = canvas.width;

    //Draw all drawable cells
    while (this.drawable_cells.length>0) {
      (this.drawable_cells.pop()).draw();
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
    if (this.view.y==this.view.y_min) {return false;}
    else if (this.view.y-speed<this.view.y_min) {this.view.y = this.view.y_min;}
    else {this.view.y-=speed;}

    return true;
  }

  //Attempt to scroll the maze, return false if maze is at lower bound
  this.scroll_down = function(speed) {
    if (this.view.y==this.view.y_max) {return false;}
    else if (this.view.y+speed>this.view.y_max) {this.view.y = this.view.y_max;}
    else {this.view.y+=speed;}

    return true;
  }

  //Attempt to scroll the maze, return false if maze is at left bound
  this.scroll_left = function(speed) {
    if (this.view.x==this.view.x_min) {return false;}
    else if (this.view.x-speed<this.view.x_min) {this.view.x = this.view.x_min;}
    else {this.view.x-=speed;}

    return true;
  }

  //Attempt to scroll the maze, return false if maze is at right bound
  this.scroll_right = function(speed) {
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
    var predecessor = new Array(this.num_row);
    for (var i=0; i<predecessor.length; i++) {
      predecessor[i] = new Array(this.num_col);
    }
    var current_cell; //The current cell we are investigating

    //Fill data structures
    for (var i=0; i<this.cells.length; i++) {
      for (var j=0; j<this.cells[i].length; j++) {
        unvisited.add("r" + i + "c" + j);
        predecessor[i][j] = null;
        distances.push({row: i, col: j, priority: INFINITY});
      }
    }

    //Set distance of the start node to 0
    distances.change_priority({row: start_loc.row, col: start_loc.col}, 0);
    this.cells[start_loc.row][start_loc.col].distance = 0;

    //Iterate until all nodes have been visited
    while (unvisited.size>0) {
      //Get cell with the current shortest distance
      var temp = distances.pop();
      current_cell = {row: temp.row, col: temp.col};
      unvisited.delete("r" + current_cell.row + "c" + current_cell.col);
      visited.add("r" + current_cell.row + "c" + current_cell.col);

      var adj_cells = this.cells[current_cell.row][current_cell.col].adjacent;
      //Relax all nodes connected to the current node and update their predecessors
      for (var i=0; i<adj_cells.length; i++) {
        //Get the current distance from the start point to the adjacent cell
        var curr_distance = this.cells[adj_cells[i].row][adj_cells[i].col].distance;
        //Set the potential new distance to that cell to be the distance to the current cell plus 1
        var new_distance = this.cells[current_cell.row][current_cell.col].distance+1;

        //Update data structures if the new path to the adjacent node would be shorter
        //than its current path
        if (curr_distance<0 || new_distance<curr_distance) {
          this.cells[adj_cells[i].row][adj_cells[i].col].distance = new_distance;
          predecessor[adj_cells[i].row][adj_cells[i].col] = {row: current_cell.row, col: current_cell.col};
          if (unvisited.has("r" + adj_cells[i].row + "c" + adj_cells[i].col)) {
            distances.change_priority({row: adj_cells[i].row, col: adj_cells[i].col}, new_distance);
          }
        }
      }
    }

    //Construct path from predecessor data
    var path = new Array();
    current_cell = {row: end_loc.row, col: end_loc.col};
    while (predecessor[current_cell.row][current_cell.col]!=null) {
      path.push({row: current_cell.row, col: current_cell.col});
      current_cell = {row: predecessor[current_cell.row][current_cell.col].row, col: predecessor[current_cell.row][current_cell.col].col};
    }
    path.push({row: start_loc.row, col: start_loc.col})

    //Reverse direction of path and return
    path.reverse();

    return path;
  }

  //**************************** Update the maze *******************************
  this.update = function() {
    this.drawable_cells = new Array();
    var start_cell = {row: Math.floor(this.view.y/TILE_SIZE), col: Math.floor(this.view.x/TILE_SIZE)};
    var tile_offset = {width: this.view.x%TILE_SIZE, height: this.view.y%TILE_SIZE};

    //mark last row and col to draw
    var last_col = (start_cell.col+this.view_num_tiles.width+2)>this.num_col ? this.num_col : start_cell.col+this.view_num_tiles.width+2;
    var last_row = (start_cell.row+this.view_num_tiles.height+2)>this.num_row ? this.num_row : start_cell.row+this.view_num_tiles.height+2;

    var count = {row: 0, col: 0};
    for(var i=start_cell.row; i<last_row; i++) {
      for(var j=start_cell.col; j<last_col; j++) {
        this.cells[i][j].set_pos({x: (count.col*TILE_SIZE)-tile_offset.width, y: (count.row*TILE_SIZE)-tile_offset.height});
        this.drawable_cells.push(this.cells[i][j]);
        count.col++;
      }
      count.row++;
      count.col=0;
    }
  }
}

//************************ Constructor for wall *****************************
function Wall(bounds) {
  //Create wall boundaries
  this.bounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };

  //Drawing Method for walls
  this.draw = function() {
    context.fillStyle = "red";
    context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }
}
