function Priority_Queue() {
  this.length = 0; //total size of heap
  this.queue = [];

  this.push = function(value) {
    this.queue.push(value);
    this.length++;
    this.heapify_up(this.length-1);
  }

  this.find = function(value) {
    for (var i=0; i<this.length; i++) {
      if (this.queue[i].num==value) {return i;}
    }
    return -1;
  }

  this.change_priority = function(value, new_priority) {
    var index = this.find(value);
    this.queue[index].priority = new_priority;
    queue.heapify_up(index);
    //Fix top of heap
    if (queue.compare(1,0)) {queue.swap(0,1);}
  }

  this.get_first = function() {
    return this.queue[0];
  }

  this.pop = function() {
    if (this.length<0) {return null;}
    var first = this.queue[0];
    var last = this.queue.pop();
    this.length--;
    this.queue[0] = last;
    this.heapify(0);
    return first;
  }

  this.heapify_up = function(index) {
    if (index==0) {return;}
    var parent = this.get_parent(index);
    if (this.compare(index, parent)) {
      this.swap(index, parent);
      this.heapify_up(parent);
    }
    else {return;}
  }

  this.heapify = function(value) {
    var left = this.get_left(value);
    var right = this.get_right(value);
    if (this.compare(left, value)) {
      this.swap(value, left);
      this.heapify(left);
    }
    else if (this.compare(right, value)) {
      this.swap(value, right);
      this.heapify(right);
    }
    else if (value==0) {return;}
    else {this.heapify(0);}
  }

  this.swap = function(index_1, index_2) {
    var temp = this.queue[index_1];
    this.queue[index_1] = this.queue[index_2];
    this.queue[index_2] = temp;
  }

  this.compare = function(index_1, index_2) {
    if (this.queue[index_1]==null || this.queue[index_2]==null) {return false;}
    return this.queue[index_1].priority<this.queue[index_2].priority;
  }

  this.get_parent = function(index) {
    return Math.floor(index/2)-1;
  }

  this.get_left = function(index) {
    return (index*2)+1;
  }

  this.get_right = function(index) {
    return (index*2)+2;
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
