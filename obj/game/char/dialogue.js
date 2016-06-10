// Dialogue Code
// Mal
var canvas;
var context;

function Dialogue(character, game) {
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

  //Hook to game object
  this.my_game = game;

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
    if(this.my_game.player.party[Npc.GREENBOY_ID]){
      this.option1 = "He's here. I'm glad I could help.";
      this.option2 = "He's here. You two stay safe here.";
    } else{
      this.option1 = "I'll look for him.";
      this.option2 = "No, sorry. I hope you find him.";
    }
  }
  else if(this.which_character==Npc.GREENBOY_ID){
    this.what_say = "I'm so scared! My flashlight ran out of batteries, and everything moved around in the shaking.";
    this.option1 = "Here, I have an extra battery.";
    if(this.my_game.player.party[Npc.OLDMAN_ID]){
      this.option2 = "You and your grandpa stay safe here.";
    } else{
      this.option2 = "You should wait here for a rescuer.";
    }
  }
  else if(this.which_character==Npc.PINKWOMAN_ID){
    this.what_say = "I feel so weary. Do you have some food or water in one of your health kits?";
    this.option1 = "Of course. Have this one.";
    this.option2 = "I'm sorry, I can't spare any.";
  }
  else if(this.which_character==Npc.RESCUEGUY_ID){
    this.what_say = "Do you have any batteries? I need to radio my team, but I'm all out.";
    this.option1 = "Sure, take this one.";
    this.option2 = "No, sorry. I don't have any extras.";
  }
  else if(this.which_character==Npc.SIBLING_RADIO_1_ID){
    this.what_say = "Hello? Can you hear me? Hello?";
    this.option1 = "Cam? Is that you?";
    this.option2 = "What? What's happening?";
  }
  else if(this.which_character==Npc.SIBLING_RADIO_2_ID){
    this.what_say = "Hey, are you still coming? My flashlight broke and I'm kind of stuck now.";
    this.option1 = "Oh no. I'll try to get there quickly.";
    this.option2 = "I'm on my way. Don't worry.";
  }
  else if(this.which_character==Npc.SIBLING_RADIO_3_ID){
    this.what_say = "Hello? I g... even mo.....st.";
    this.option1 = "Could you repeat that?";
    this.option2 = "Are you still there?";
  }
  else if(this.which_character==Npc.SIBLING_ID){
    this.what_say = "You found me! I knew that walkie talkie was good for something.";
    this.option1 = "I was really worried there.";
    this.option2 = "You're safe now. Let's find our way out.";
  }

  // true if dialogue is at end of conversation
  this.end_dialogue = false;

  // option 1 picked, character joins you, resources deplete (if applicable), dialogue ends
  this.option1_picked = function() {
  	if(!this.end_dialogue){
  	  if(this.which_character == Npc.BLUEGIRL_ID){
  		  this.what_say = "Thank you! That feels so much better.";
        this.option1 = "I hope it heals soon.";
    	  this.option2 = "I need to get going.";
        this.my_game.player.inventory.med_kit--;
  	  }
  	  else if(this.which_character == Npc.OLDMAN_ID){
        if(this.my_game.player.party[Npc.GREENBOY_ID]){
  		    this.what_say = "Thank you so much. I'm glad such kind people exist.";
          this.option1 = "I'm just glad you found each other.";
    	    this.option2 = "Sure thing.";
        } else{
          this.what_say = "Thank you. He must be around here somewhere.";
          this.option1 = "Hopefully he's nearby.";
    	    this.option2 = "I'll find him. Don't worry.";
        }
  	  }
  	  else if(this.which_character == Npc.GREENBOY_ID){
  		  this.what_say = "Thanks! It's much easier to see now.";
        this.option1 = "No problem.";
    	  this.option2 = "Just don't waste it, ok?";
        this.my_game.player.inventory.battery.shift();
  	  }
  	  else if(this.which_character == Npc.PINKWOMAN_ID){
  		  this.what_say = "Thank you. I can feel my energy rising already.";
        this.option1 = "Good. I should get moving.";
    	  this.option2 = "I'm glad you're feeling better now.";
        this.my_game.player.inventory.med_kit--;
  	  }
  	  else if(this.which_character == Npc.RESCUEGUY_ID){
  		  this.what_say = "Thanks! I will let them know there are survivors.";
        this.option1 = "Tell them we're on the move.";
    	  this.option2 = "Tell them there's more people still stuck.";
        this.my_game.player.inventory.battery.shift();
    	}
      else if(this.which_character == Npc.SIBLING_RADIO_1_ID){
  		  this.what_say = "It's me. I left you my other walkie talkie. You wouldn't wake up after the earthquake.";
        this.option1 = "Wait there. I'll come find you.";
    	  this.option2 = "Good thinking. I'm on my way.";
    	}
      else if(this.which_character == Npc.SIBLING_RADIO_2_ID){
  		  this.what_say = "Please hurry. It's really dark now.";
        this.option1 = "I'll be there soon.";
    	  this.option2 = "Don't move, it could be dangerous.";
    	}
      else if(this.which_character == Npc.SIBLING_RADIO_3_ID){
  		  this.what_say = "...";
        this.option1 = "Hello?? Cam??";
    	  this.option2 = "Hold on! I'm almost there!";
    	}
      else if(this.which_character == Npc.SIBLING_ID){
  		  this.what_say = "Me too. This place has gotten all turned around from the shaking.";
        this.option1 = "I'm just glad you're ok.";
    	  this.option2 = "We should get out as quickly.";
    	}
      this.end_dialogue = true;
      if (this.which_character<=Npc.SIBLING_ID) {
        this.my_game.player.party[this.which_character] = true;
      }
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
        this.option1 = "You should wait for a rescuer.";
    	  this.option2 = "Try to get out quickly.";
  	  }
  	  else if(this.which_character == Npc.OLDMAN_ID){
        if(this.my_game.player.party[Npc.GREENBOY_ID]){
  		    this.what_say = "Thank you. I hope you find whoever you're looking for.";
          this.option1 = "I hope so too.";
    	    this.option2 = "Good luck.";
        } else{
          this.what_say = "I hope so too. I'll keep looking around here.";
          this.option1 = "Good luck.";
    	    this.option2 = "Don't stay down here too long.";
        }
  	  }
  	  else if(this.which_character == Npc.GREENBOY_ID){
        if(this.my_game.player.party[Npc.OLDMAN_ID]){
  		    this.what_say = "Ok. Too bad there's no light for us though.";
          this.option1 = "I'm sure the lights will come back soon.";
    	    this.option2 = "You'll be alright. Just stay put.";
        } else{
          this.what_say = "Alright. Hopefully the lights will come back soon. And the building.";
          this.option1 = "They'll be back soon, I'm sure.";
    	    this.option2 = "Stay safe, ok?";
        }
  	  }
  	  else if(this.which_character == Npc.PINKWOMAN_ID){
  		  this.what_say = "Of course. Stay safe out there.";
        this.option1 = "Thank you. You too.";
    	  this.option2 = "You should rest. You'll feel better.";
  	  }
  	  else if(this.which_character == Npc.RESCUEGUY_ID){
  		  this.what_say = "Too bad. I'll keep looking for more survivors down here.";
        this.option1 = "Good luck.";
    	  this.option2 = "I'm glad you're here to help.";
    	}
      else if(this.which_character == Npc.SIBLING_RADIO_1_ID){
  		  this.what_say = "There was an earthquake! You wouldnt wake up, so I left you my other walkie talkie and went for help.";
        this.option1 = "Wait there. I'll come find you.";
    	  this.option2 = "Good thinking. I'm on my way.";
    	}
      else if(this.which_character == Npc.SIBLING_RADIO_2_ID){
  		  this.what_say = "Please hurry. It's really dark now.";
        this.option1 = "I'll be there soon.";
    	  this.option2 = "Don't move, it could be dangerous.";
    	}
      else if(this.which_character == Npc.SIBLING_RADIO_3_ID){
  		  this.what_say = "...";
        this.option1 = "Hello?? Cam??";
    	  this.option2 = "Hold on! I'm almost there!";
    	}
      else if(this.which_character == Npc.SIBLING_ID){
  		  this.what_say = "Yeah, let's go. I think the exit is nearby.";
        this.option1 = "Stay close now. I won't lose you again.";
    	  this.option2 = "The sooner we're out the better.";
    	}
  	  this.end_dialogue = true;
  	} else{
  		this.end_dialogue = false;
  	}
  }

  // draw function
  this.draw = function() {
    context.textAlign = "left";
    //draws dialogue box
    context.fillStyle = '#e6d8b3';
    context.fillRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
    // draws faces of characters on left of dialogue box
    if (this.which_character<=Npc.SIBLING_ID) {
  	   context.drawImage(Sprite.npc_face[this.which_character], this.face_pos.x, this.face_pos.y, this.face_pos.width, this.face_pos.height);
    }
    else {
      context.drawImage(Sprite.walkie, this.face_pos.x, this.face_pos.y, this.face_pos.width, this.face_pos.height);
    }

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
