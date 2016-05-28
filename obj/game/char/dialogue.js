// Dialogue Code
// Mal
var canvas;
var context;

function Dialogue(character, player) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Create bounds for dialogue objects
  this.frame = {
    x: (canvas.width/2)-((canvas.width-450)/2),
    y: canvas.height-200,
    width: canvas.width-450,
    height: 150
  };

  this.face_pos = {
    x: this.frame.x+5,
    y: this.frame.y+5,
    width: 140,
    height: 140
  };

  this.button_1 = {
    bounds: {
      x: this.frame.x+190,
      y: this.frame.y+90,
      width: 260,
      height: 50,
      type: Game.RECT_ID
    },
    text_pos: {
      x: this.frame.x+200,
      y: this.frame.y+120
    }
  };

  this.button_2 = {
    bounds: {
      x: this.frame.x+480,
      y: this.frame.y+90,
      width: 260,
      height: 50,
      type: Game.RECT_ID
    },
    text_pos: {
      x: this.frame.x+490,
      y: this.frame.y+120
    }
  };

  this.main_text_pos = {
    line_1: {
      x: this.frame.x+180,
      y: this.frame.y+40
    },
    line_2: {
      x: this.frame.x+180,
      y: this.frame.y+70
    }
  };

  //Hook to player object
  this.my_player = player;

  // variables used as input for dialogue function
  this.which_character = character;
  this.what_say = '';
  this.option1 = '';
  this.option2 = '';

  if(this.which_character==Npc.BLUEGIRL_ID){
    this.what_say = "Please help me... My leg hurts... I think it's cut pretty bad. Do you have any extra bandages?";
    this.option1 = "Sure. Here is a Health Kit.";
    this.option2 = "Sorry, I don't have any extras.";
  }
  else if(this.which_character==Npc.OLDMAN_ID){
    this.what_say = "Have you seen my grandson? I lost track of him in the rubble.";
    if(this.my_player.party[Npc.GREENBOY_ID]){
      this.option1 = "He's here. You two should follow me.";
      this.option2 = "He's here. You two stay safe here.";
    } else{
      this.option1 = "Let's look for him together.";
      this.option2 = "No, sorry. I hope you find him.";
    }
  }
  else if(this.which_character==Npc.GREENBOY_ID){
    this.what_say = "I'm so scared! My flashlight ran out of batteries, and everything moved around in the shaking.";
    this.option1 = "Here, I have an extra battery.";
    if(this.my_player.party[Npc.OLDMAN_ID]){
      this.option2 = "You and your grandpa stay safe here.";
    } else{
      this.option2 = "You should wait here for a rescuer.";
    }
  }
  if(this.which_character==Npc.PINKWOMAN_ID){
    this.what_say = "I feel so weary. Do you have some food or water in one of your health kits?";
    this.option1 = "Of course. Have this one.";
    this.option2 = "Im sorry, I cant spare any.";
  }
  if(this.which_character==Npc.RESCUEGUY_ID){
    this.what_say = "Do you have any batteries? I need to radio my team, but I'm all out.";
    this.option1 = "Sure, take this one.";
    this.option2 = "No, sorry. I dont have any extras.";
  }

  // true if dialogue is at end of conversation
  this.end_dialogue = false;

  // option 1 picked, character joins you, resources deplete (if applicable), dialogue ends
  this.option1_picked = function() {
  	if(!this.end_dialogue){
  	  if(this.which_character == Npc.BLUEGIRL_ID){
  		  this.what_say = "Thank you! That feels so much better.";
        this.my_player.inventory.med_kit--;
  	  }
  	  else if(this.which_character == Npc.OLDMAN_ID){
  		  this.what_say = "Thank you so much. Im glad such kind people exist.";
  	  }
  	  else if(this.which_character == Npc.GREENBOY_ID){
  		  this.what_say = "Thanks! It's much easier to see now.";
        this.my_player.inventory.battery.pop();
  	  }
  	  else if(this.which_character == Npc.PINKWOMAN_ID){
  		  this.what_say = "Thank you. I can feel my energy rising already.";
        this.my_player.inventory.med_kit--;
  	  }
  	  else if(this.which_character == Npc.RESCUEGUY_ID){
  		  this.what_say = "Thanks! I will let them know there are survivors.";
        this.my_player.inventory.battery.pop();
    	}
  	  this.option1 = "Sure thing.";
  	  this.option2 = "No problem.";
      this.end_dialogue = true;
      this.my_player.party[this.which_character] = true;
  	} else{
  		this.end_dialogue = false;
  	}
  }

  // option 2 picked, character does not join you
  // consider getting rid of character or character disappearing if this option chosen
  this.option2_picked = function() {
  	if(!this.end_dialogue){
  	  if(this.which_character == Npc.BLUEGIRL_ID){
  		  this.what_say = "That's ok. I hope you find your way out.";
  	  }
  	  else if(this.which_character == Npc.OLDMAN_ID){
  		  this.what_say = "Sure. I hope you find whoever you're looking for.";
  	  }
  	  else if(this.which_character == Npc.GREENBOY_ID){
  		  this.what_say = "Alright. Hopefully the lights will come back soon. And the building.";
  	  }
  	  else if(this.which_character == Npc.PINKWOMAN_ID){
  		  this.what_say = "Of course. Stay safe out there.";
  	  }
  	  else if(this.which_character == Npc.RESCUEGUY_ID){
  		  this.what_say = "Too bad. I'll keep looking for more survivors down here.";
    	}
  	  this.option1 = "Good luck.";
  	  this.option2 = "Stay safe.";
  	  this.end_dialogue = true;
  	} else{
  		this.end_dialogue = false;
  	}
  }

  // draw function
  this.draw = function() {
    //draws dialogue box
    context.fillStyle = '#e6d8b3';
    context.fillRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
    // draws faces of characters on left of dialogue box
  	context.drawImage(Sprite.npc_face[this.which_character], this.face_pos.x, this.face_pos.y, this.face_pos.width, this.face_pos.height);

    // if dialogue too long for one line, splits it onto two lines
    var line1 = this.what_say;
    var line2 = '';
    if(line1.length > 50){
  	  var split_place = 45;
  	  for(var i = 45; i < line1.length; i++){
  		  if(line1.charAt(i) == ' '){
  			  split_place = i+1;
  			  break;
  		  }
  	  }
  	  line2 = line1.substring(split_place, line1.length);
  	  line1 = line1.substring(0, split_place);
    }
    // writes character dialogue
    context.fillStyle = 'black';
    context.font = "25px Trebuchet MS";
    context.fillText(line1, this.main_text_pos.line_1.x, this.main_text_pos.line_1.y);
    context.fillText(line2, this.main_text_pos.line_2.x, this.main_text_pos.line_2.y);

    // option boxes
    context.fillStyle = '#2a1f70';
    context.fillRect(this.button_1.bounds.x, this.button_1.bounds.y, this.button_1.bounds.width, this.button_1.bounds.height);
    context.fillStyle = '#701f63';
    context.fillRect(this.button_2.bounds.x, this.button_2.bounds.y, this.button_2.bounds.width, this.button_2.bounds.height);
    // writes options dialogue
    context.fillStyle = 'white';
    context.font = "15px Trebuchet MS";
    context.fillText(this.option1, this.button_1.text_pos.x, this.button_1.text_pos.y);
    context.fillText(this.option2, this.button_2.text_pos.x, this.button_2.text_pos.y);
  }

  //Returns true if dialogue is comencing
  this.update = function(mouse_info) {
    if (!mouse_info.clicked_left && mouse_info.last_clicked_left) {
      var temp_dialogue_state = this.end_dialogue;
      // check which option is picked
	    if(Game.mouse_over(this.button_1, mouse_info)){
		    this.option1_picked();
	    } else if(Game.mouse_over(this.button_2, mouse_info)){
		    this.option2_picked();
	    }

      return !temp_dialogue_state;
    }

    return true;
  }
}
