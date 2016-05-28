var MAX_OBJECTS = 10;  //Maximum number of objects in a node
var MAX_LEVELS = 5; //Maximum number of times quad is divided

var canvas;
var context;

//****************** Collision Tree Object ******************
var Collision_Tree = function(level, bounds) {
  //Hook canvas and context to snake object on creation
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Number of times this quad was divided
  this.level = level;
  //The bounding box of this node
  this.bounds = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };
  //Objects that are fully within the bounds of this quad
  this.objects = new Array();
  //Children of this quad
  this.nodes = new Array(4);
}

//Clears the collision tree
Collision_Tree.prototype.clear = function() {
  //Clear the objects held in the node
  this.objects = new Array();

  for (var i=0; i<this.nodes.length; i++) {
    if (this.nodes[i]!=null && this.nodes[i]!=undefined) {
      //Recursive call to clear children
      this.nodes[i].clear();
      //Remove node from list of children
      this.nodes[i] = null;
    }
  }
}

//Divides a node into four quads
Collision_Tree.prototype.divide = function() {
  //Get width and height of new subquadrents
  var quad_width = Math.floor(this.bounds.width/2);
  var quad_height = Math.floor(this.bounds.height/2);

  //Create new nodes
  this.nodes[0] = new Collision_Tree(this.level+1, {x: this.bounds.x+quad_width, y: this.bounds.y, width: quad_width, height: quad_height});
  this.nodes[1] = new Collision_Tree(this.level+1, {x: this.bounds.x, y: this.bounds.y, width: quad_width, height: quad_height});
  this.nodes[2] = new Collision_Tree(this.level+1, {x: this.bounds.x, y: this.bounds.y+quad_height, width: quad_width, height: quad_height});
  this.nodes[3] = new Collision_Tree(this.level+1, {x: this.bounds.x+quad_width, y: this.bounds.y+quad_height, width: quad_width, height: quad_height});
}

//Draw the collision tree (used for testing)
Collision_Tree.prototype.draw = function() {
  //Draw this bounding box
  context.save();
  context.strokeStyle = "green";
  context.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  context.stroke();
  context.strokeStyle = "black";
  context.restore();

  for (var i=0; i<this.nodes.length; i++) {
    if (this.nodes[i]!=null && this.nodes[i]!=undefined) {
      //Recursively draw all children
      this.nodes[i].draw();
    }
  }
}

//Returns the index of the node the object fits inside
Collision_Tree.prototype.get_index = function(object) {
  var index = -1;
  var bounds_center = {
    x: this.bounds.x+(this.bounds.width/2),
    y: this.bounds.y+(this.bounds.height/2)
  };

  //If the object has rectangular bounds
  if (object.bounds.type==Game.RECT_ID) {
    //If object is in top or bottom half
    var in_top_half = object.bounds.y+object.bounds.height<bounds_center.y && object.bounds.y>this.bounds.y;
    var in_bottom_half = object.bounds.y>bounds_center.y && object.bounds.y+object.bounds.height<this.bounds.y+this.bounds.height;

    //If object is on left side
    if (object.bounds.x+object.bounds.width<bounds_center.x && object.bounds.x>this.bounds.x) {
      if (in_top_half) {index = 1;}
      else if (in_bottom_half) {index = 2;}
    }
    //If object is on right side
    if (object.bounds.x>bounds_center.x && object.bounds.x+object.bounds.width<this.bounds.x+this.bounds.width) {
      if (in_top_half) {index = 0;}
      else if (in_bottom_half) {index = 3;}
    }
  }
  //If the object has circular bounds
  else if (object.bounds.type==Game.CIRCLE_ID) {
    //If object is in top or bottom half
    var in_top_half = object.bounds.y+object.bounds.radius<bounds_center.y && object.bounds.y-object.bounds.radius>this.bounds.y;
    var in_bottom_half = object.bounds.y-object.bounds.radius>bounds_center.y && object.bounds.y+object.bounds.radius<this.bounds.y+this.bounds.height;

    //If object is on left side
    if (object.bounds.x+object.bounds.radius<bounds_center.x && object.bounds.x-object.bounds.radius>this.bounds.x) {
      if (in_top_half) {index = 1;}
      else if (in_bottom_half) {index = 2;}
    }
    //If object is on right side
    if (object.bounds.x-object.bounds.radius>bounds_center.x && object.bounds.x+object.bounds.radius<this.bounds.x+this.bounds.width) {
      if (in_top_half) {index = 0;}
      else if (in_bottom_half) {index = 3;}
    }
  }

  return index;
}

//Gets the list of all objects that can collide with
Collision_Tree.prototype.get_objects = function(my_object) {
  //Get index of quadrent object fits in
  var index = this.get_index(my_object);
  var object_list = this.objects;

  if (this.nodes[0]!=null && this.nodes[0]!=undefined) {
    //If the object fits in a subquadrent, get the objects from that quad
    if (index!=-1) {
      object_list = object_list.concat(this.nodes[index].get_objects(my_object));
    }
    //Otherwise check all the subquadrents
    else {
      for (var i=0; i<this.nodes.length; i++) {
        object_list = object_list.concat(this.nodes[i].get_objects(my_object));
      }
    }
  }

  return object_list;
}

//Inserts a new object into the collision Tree
Collision_Tree.prototype.insert = function(object) {
  //If node has no children
  if (this.nodes[0]!=null && this.nodes[0]!=undefined) {
    var index = this.get_index(object);

    //If object can fit in a subnode
    if (index!=-1) {
      this.nodes[index].insert(object);
      return;
    }
  }

  //Add new object to the node
  this.objects.push(object);

  //Divide quadrent if it has too many objects and is not at max depth
  if (this.objects.length>MAX_OBJECTS && this.level<MAX_LEVELS) {
    if (this.nodes[0]==null || this.nodes==undefined) {this.divide();}

    var i = 0;
    while (i<this.objects.length) {
      var index = this.get_index(this.objects[i]);
      if (index!=-1) {
        this.nodes[index].insert(this.objects[i]);
        this.objects.splice(i, 1);
      }
      else {i++;}
    }
  }
}
