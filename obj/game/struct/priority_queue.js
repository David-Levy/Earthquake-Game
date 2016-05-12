//Priority Queue object
//Uses min binary heap for data structure see:
//https://en.wikipedia.org/wiki/Binary_heap
function Priority_Queue() {
  //************************* Constructor ***************************
  this.length = 0; //total size of heap
  this.queue = []; //Array which contains the heap

  //************************** Functions ****************************

  //Change the priority of a node containing a specific value
  //@Param value: the value requested node will containing
  //@Param new_priority: new priority to set
  this.change_priority = function(value, new_priority) {
    //Store nodes popped off of heap
    var temp_nodes = new Array();
    do {
      temp_nodes.push(this.pop());
    } while ((temp_nodes[temp_nodes.length-1].row!=value.row || temp_nodes[temp_nodes.length-1].col!=value.col) && this.queue.length>0)

    //Set priority of last element in temp list to new priority
    temp_nodes[temp_nodes.length-1].priority = new_priority;

    //Insert all nodes back into the queue
    while (temp_nodes.length>0) {
      this.push(temp_nodes.pop());
    }
  }

  //*****************************************************************

  //Returns true if first node is higher priority than second node
  //@Param index_1: index of the first requested node
  //@Param index_2: index of the second requested node
  this.compare = function(index_1, index_2) {
    if (this.queue[index_1]==null || this.queue[index_2]==null) {return false;}
    //Special case for priority of infinity, represented by negative numbers
    return this.queue[index_1].priority<this.queue[index_2].priority;
  }

  //*****************************************************************

  //Returns the index of the node containing the request value or -1
  //if no node exists
  //@Param value: desired value to find
  this.find = function(value) {
    for (var i=0; i<this.length; i++) {
      if (this.queue[i].row==value.row && this.queue[i].col==value.col) {return i;}
    }
    return -1;
  }

  //*****************************************************************

  //Return the first item in the queue
  this.get_first = function() {
    return this.queue[0];
  }

  //*****************************************************************

  //Maintains the status of the heap
  //@Param index: index of the current node to heapify
  this.heapify_down = function(index) {
    //Get the left child of requested node
    var left = get_left_child(index);
    //Get the right child of requested node
    var right = get_right_child(index);

    //Swap nodes if necessary to maintain heap status
    if (this.compare(left, index)) {      this.swap(index, left);
      this.heapify_down(left);
    }
    else if (this.compare(right, index)) {
      this.swap(index, right);
      this.heapify_down(right);
    }
    //If the node is in the proper place, stop sorting
    else if (index==0) {return;}
    //Otherwise sort again
    else {this.heapify_down(0);}
  }

  //*****************************************************************

  //Filter a node up through the heap until it heap status is restored
  //@Param: index of the node to be sorted
  this.heapify_up = function(index) {
    //If node is at top of heap, end
    if (index==0) {return;}
    //Get the parent of the current node
    var parent = get_parent(index);
    //If nodes are not in the correct order swap them
    if (this.compare(index, parent)) {
      this.swap(index, parent);
      this.heapify_up(parent);
    }
    //If they are in correct order, stop altering heap
    else {return;}
  }

  //*****************************************************************

  //Remove the first element in the queue and return it
  this.pop = function() {
    //Return null if queue is empty
    if (this.queue.length<=0) {return null;}

    //Store first element in heap
    var first = this.queue[0];
    //Store and remove last element in array
    var last = this.queue.pop();
    this.length--;

    //End early if this is the last element in queue
    if (this.queue.length==0) {return first;}

    //Place the last element at the top of the heap
    this.queue[0] = last;
    //Filter former last node down to maintain heap status
    this.heapify_down(0);
    //Return first element
    return first;
  }

  //*****************************************************************

  //Push a new value into the queue
  this.push = function(value) {
    //Add new value to end of array
    this.queue.push(value);
    this.length++;

    //Filter value up into proper position
    this.heapify_up(this.queue.length-1);
  }

  //*****************************************************************

  //Swap the nodes at given indices
  //@Param index_1: index of first requested node
  //@Param index_2: index of second requested node
  this.swap = function(index_1, index_2) {
    var temp = this.queue[index_1];
    this.queue[index_1] = this.queue[index_2];
    this.queue[index_2] = temp;
  }

  //*********************** Helper Functions ************************

  var get_parent = function(index) {
    return Math.ceil(index/2)-1;
  }

  var get_left_child = function(index) {
    return (index*2)+1;
  }

  var get_right_child = function(index) {
    return (index*2)+2;
  }
}
/*
//Priority Queue Test
var queue = new Priority_Queue();
queue.push({priority: 9, row: 9, col: 9});
queue.push({priority: 16, row: 16, col: 16});
queue.push({priority: 2, row: 2, col: 2});
queue.push({priority: 4, row: 4, col: 4});
queue.push({priority: 11, row: 11, col: 11});
queue.push({priority: 90, row: 90, col: 90});
queue.push({priority: 8, row: 8, col: 8});
queue.change_priority({row: 16, col: 16}, 0);
queue.change_priority({row: 90, col: 90}, 0);
queue.change_priority({row: 4, col: 4}, 30);
queue.change_priority({row: 2, col: 2}, 9);

while (queue.length>0) {
  console.log(queue.pop());
}
*/
