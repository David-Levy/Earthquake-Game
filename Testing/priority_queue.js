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
    //Find the requested node
    var index = this.find(value);
    //Set the new priority
    this.queue[index].priority = new_priority;
    //resort node into proper position
    queue.heapify_up(index);
    //Fix top of heap
    if (queue.compare(1,0)) {queue.swap(0,1);}
  }

  //*****************************************************************

  //Returns true if first node is higher priority than second node
  //@Param index_1: index of the first requested node
  //@Param index_2: index of the second requested node
  this.compare = function(index_1, index_2) {
    if (this.queue[index_1]==null || this.queue[index_2]==null) {return false;}
    //Special case for priority of infinity, represented by negative numbers
    if (this.queue[index_1].priority<0) {return false;}
    return this.queue[index_1].priority<this.queue[index_2].priority;
  }

  //*****************************************************************

  //Returns the index of the node containing the request value or -1
  //if no node exists
  //@Param value: desired value to find
  this.find = function(value) {
    for (var i=0; i<this.length; i++) {
      if (this.queue[i].num==value) {return i;}
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
  this.heapify = function(index) {
    //Get the left child of requested node
    var left = get_left_child(index);
    //Get the right child of requested node
    var right = get_right_child(index);

    //Swap nodes if necessary to maintain heap status
    if (this.compare(left, index)) {
      this.swap(index, left);
      this.heapify(left);
    }
    else if (this.compare(right, index)) {
      this.swap(index, right);
      this.heapify(right);
    }
    //If the node is in the proper place, stop sorting
    else if (index==0) {return;}
    //Otherwise sort again
    else {this.heapify(0);}
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
    if (this.length<0) {return null;}

    //Store first element in heap
    var first = this.queue[0];
    //Store and remove last element in array
    var last = this.queue.pop();
    this.length--;

    //Place the last element at the top of the heap
    this.queue[0] = last;
    //Filter former last node down to maintain heap status
    this.heapify(0);
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
    this.heapify_up(this.length-1);
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
    return (index>>1)-1;
  }

  var get_left_child = function(index) {
    return (index<<1)+1;
  }

  var get_right_child = function(index) {
    return (index<<1)+2;
  }
}

//Priority Queue Test
var queue = new Priority_Queue();
queue.push({priority: 9, num: 9});
queue.push({priority: 16, num: 16});
queue.push({priority: 2, num: 2});
queue.push({priority: 4, num: 4});
queue.push({priority: 11, num: 11});
queue.push({priority: 90, num: 90});
queue.push({priority: 8, num: 8});
queue.change_priority(16, 0);
queue.change_priority(90, 0);
queue.change_priority(4, 30);
queue.change_priority(2, 9);

while (queue.length>0) {
  console.log(queue.pop());
}
