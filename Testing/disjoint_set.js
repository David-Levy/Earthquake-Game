"use strict";
//Constructor for new disjoint set
function Disjoint_Set(num_obj) {

	//Tracks the total number of sets in a disjoint set
	this.num_sets = num_obj;

	//Arrays for tracking sets
	this.parents = []; //list of links from node-to-node in a set, root object holds itself
	//this.ranks   = []; //Always in the range [0, floor(log2(numElems))].
	this.sizes   = []; //Size attached only to root object in a set, otherwise 0

	for (var i=0; i<this.num_sets; i++) {
		this.parents.push(i);
		//this.ranks.push(0);
		this.sizes.push(1);
	}


	//Returns the total number of objects in the disjoint set
	this.get_num_obj = function() {
		return this.parents.length;
	};


	//Returns the current number of sets in disjoint set
	this.get_num_sets = function() {
		return this.num_sets;
	};


	//Returns the root of the set containing the given object
	this.find = function(obj_index) {
		var curr_node = this.parents[obj_index];
    //if the given node is the root of a set return it immidiately
		if (curr_node==obj_index) {return obj_index;}
    //Otherwise, traverse up the list until you find a node whose parent is itself (root node)
		while (true) {
			var parent = this.parents[curr_node];
      //Exit and return index when root is found
			if (parent==curr_node) {return curr_node;}
			//this.parents[obj_index] = parent;  //Shorten path to root node to speed up access
			obj_index = curr_node;
			curr_node = parent;
		}
	}


	//Returns the size of the set that contains the given object index
	this.get_set_size = function(obj_index) {
		return this.sizes[this.find(obj_index)];
	};


	//Returns true if both objects are in the same set
	this.in_same_set = function(obj_index_1, obj_index_2) {
		return this.find(obj_index_1)==this.find(obj_index_2);
	};


	//If 2 given elements are in different sets, joins the sets together and Returns
  //true, otherwise returns false
	this.join = function(obj_index_1, obj_index_2) {
		//Get the root of each set
		var root_1 = this.find(obj_index_1);
		var root_2 = this.find(obj_index_2);

    //Return false if the roots are the same index
		if (root_1==root_2) {return false;}

    //If root_2's size > root_1's size, swap them
		if (this.sizes[root_1]<this.sizes[root_2]) {
			var temp = root_1;
			root_1 = root_2;
			root_2 = temp;
		}

		//Join the smaller set to the larger set and returns true
		this.parents[root_2] = root_1;
		this.sizes[root_1] += this.sizes[root_2];
		this.sizes[root_2] = 0;
		this.num_sets--;
		return true;
	};
}
