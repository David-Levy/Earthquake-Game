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

//********************* Constructor for each cell **************************
function Cell(my_loc, my_index) {
  //Create all four walls in cell
  this.wall = new Array(4);
  for(var i=0; i<this.wall.length; i++) {this.wall[i]=true;}

  //value used to identify which image will be printed at cell
  this.wall_value = WALL_VAL_UP+WALL_VAL_DOWN+WALL_VAL_LEFT+WALL_VAL_RIGHT;

  //Location of the cell in the grid
  this.loc = {row : my_loc.row, col: my_loc.col};

  //Mark location of cell in disjoint set array
  this.set_index = my_index;

  //Create array of adjacent and accessable cells
  this.adjacent = new Array();

  //Initialize distance from start point to infinity
  this.distance = INFINITY;
}

//************************ Constructor for maze *****************************
function Maze(my_width, my_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //console.log("Maze Creation Begin");
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

  //console.log("Maze Creation Complete");

  //************************ Draw methods for testing **************************
  this.draw = function() {
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

  this.draw_path = function(path) {
    context.fillStyle = "red";
    for (var i=0; i<path.length; i++) {
      context.beginPath();
      context.arc((path[i].col*CELL_DIM)+(CELL_DIM/2), (path[i].row*CELL_DIM)+(CELL_DIM/2), (CELL_DIM/3), Math.PI*2, false);
      context.fill();
    }
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
}

//These lines are only for testing, we will not draw the map with this
/*
var test = new Maze(127, 57);
var found_path = test.solve({row: 0, col: 0}, {row: test.num_row-1, col: test.num_col-1});
test.draw();
test.draw_path(found_path);
*/
