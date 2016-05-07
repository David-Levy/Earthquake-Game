var canvas;
var context;

//Global constants
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
var CELL_DIM = 50;

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
}

//************************ Constructor for maze *****************************
function Maze(my_width, my_height) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  console.log("Maze Creation Begin");
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
      console.log("Joined " + temp_loc.row + ", " + temp_loc.col + " and " + adj_cells[chosen].row + ", " + adj_cells[chosen].col);

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

  console.log("Maze Creation Complete");

  //************************* Draw method for testing **************************
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

        //Print adjacency list to console
        console.log(i + ", " + j + " is adjacent to:");
        for (var k=0; k<this.cells[i][j].adjacent.length; k++) {
          console.log(" - " + this.cells[i][j].adjacent[k].row + ", " + this.cells[i][j].adjacent[k].col);
        }
      }
    }
  }
}

//These lines are only for testing, we will not draw the map with this
var test = new Maze(5, 5);
test.draw();
