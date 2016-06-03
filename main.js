//Sprite Arrays
Sprite.main_char_images = new Array(4);
Sprite.npc_face = new Array(5);
Sprite.npc_body = new Array(5);
Sprite.can_click_left = new Array(2);
Sprite.can_click_right = new Array(2);
Sprite.map_bg;
Sprite.map_ui_up_arrow;
Sprite.map_ui_down_arrow;
Sprite.hole;
Sprite.ramp;
Sprite.exit;

var NUM_ASSETS = 28;

$(document).ready(function(){
  var canvas = $("#canvas")[0];
  var context = canvas.getContext("2d");

  //Global constants
  var STATE_PLAYING_GAME = 1;

  //Event Listeners
  var keys = {};
  var mouse_info = {
    x:0,
    y:0,
    clicked_left: false,
    clicked_right: false,
    last_clicked_left: false,
    last_clicked_right: false
  };
  document.addEventListener("keydown", function(e) {
	   keys[e.keyCode] = true;
  });
  document.addEventListener("keyup", function(e) {
	  keys[e.keyCode] = false;
  });
  document.addEventListener("mousemove", function(e) {
    var canvas_bounds = canvas.getBoundingClientRect();
	  mouse_info.x = e.clientX - canvas_bounds.left,
    mouse_info.y = e.clientY - canvas_bounds.top
  });
  document.addEventListener("mousedown", function(e) {
    mouse_info.clicked_left = (e.which==1);
    mouse_info.clicked_right = (e.which==3);
  });
  document.addEventListener("mouseup", function(e) {
    mouse_info.clicked_left = false;
    mouse_info.clicked_right = false;
  });
  document.addEventListener("contextmenu", function(e) {
    //This function is only used to prevent the right click menu from appearring
    e.preventDefault();
    return false;
  }, false);

  //Object to contain information about the game's state
  function Game_State() {
    //Initialize game state
    this.state = STATE_PLAYING_GAME;
    //create game instance
    this.game = new Game(5, 14, 7);
  }

  function game_loop() {
    update();
    draw();
  }

  function draw() {
    canvas.width = canvas.width;
    my_state.game.draw();
  }

  //Load images into memory
  function load_images() {
    //load main character sprite images
    for (var i=0; i<Sprite.main_char_images.length; i++) {
      Sprite.main_char_images[i] = new Image();
      Sprite.main_char_images[i].onload = function() {
        console.log("Loaded Image: " + this.src);
        delay_until_loaded();
      }
      Sprite.main_char_images[i].src = "sprite/char/main/Main" + i + ".png";
    }

    //Load blue girl sprite images
    Sprite.npc_body[Npc.BLUEGIRL_ID] = new Image();
    Sprite.npc_body[Npc.BLUEGIRL_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_body[Npc.BLUEGIRL_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_body[Npc.BLUEGIRL_ID].src = "sprite/char/npc/body/BlueGirlHead.png";
    Sprite.npc_face[Npc.BLUEGIRL_ID] = new Image();
    Sprite.npc_face[Npc.BLUEGIRL_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_face[Npc.BLUEGIRL_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_face[Npc.BLUEGIRL_ID].src = "sprite/char/npc/face/BlueGirlFace.png";

    //Load green boy sprite images
    Sprite.npc_body[Npc.GREENBOY_ID] = new Image();
    Sprite.npc_body[Npc.GREENBOY_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_body[Npc.GREENBOY_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_body[Npc.GREENBOY_ID].src = "sprite/char/npc/body/GreenBoyHead.png";
    Sprite.npc_face[Npc.GREENBOY_ID] = new Image();
    Sprite.npc_face[Npc.GREENBOY_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_face[Npc.GREENBOY_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_face[Npc.GREENBOY_ID].src = "sprite/char/npc/face/GreenBoyFace.png";

    //Load old man sprite images
    Sprite.npc_body[Npc.OLDMAN_ID] = new Image();
    Sprite.npc_body[Npc.OLDMAN_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_body[Npc.OLDMAN_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_body[Npc.OLDMAN_ID].src = "sprite/char/npc/body/OldManHead.png";
    Sprite.npc_face[Npc.OLDMAN_ID] = new Image();
    Sprite.npc_face[Npc.OLDMAN_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_face[Npc.OLDMAN_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_face[Npc.OLDMAN_ID].src = "sprite/char/npc/face/OldManFace.png";

    //Load pink woman sprite images
    Sprite.npc_body[Npc.PINKWOMAN_ID] = new Image();
    Sprite.npc_body[Npc.PINKWOMAN_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_body[Npc.PINKWOMAN_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_body[Npc.PINKWOMAN_ID].src = "sprite/char/npc/body/PinkWomanHead.png";
    Sprite.npc_face[Npc.PINKWOMAN_ID] = new Image();
    Sprite.npc_face[Npc.PINKWOMAN_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_face[Npc.PINKWOMAN_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_face[Npc.PINKWOMAN_ID].src = "sprite/char/npc/face/PinkWomanFace.png";

    //Load rescue guy sprite images
    Sprite.npc_body[Npc.RESCUEGUY_ID] = new Image();
    Sprite.npc_body[Npc.RESCUEGUY_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_body[Npc.RESCUEGUY_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_body[Npc.RESCUEGUY_ID].src = "sprite/char/npc/body/RescueGuyHead.png";
    Sprite.npc_face[Npc.RESCUEGUY_ID] = new Image();
    Sprite.npc_face[Npc.RESCUEGUY_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_face[Npc.RESCUEGUY_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_face[Npc.RESCUEGUY_ID].src = "sprite/char/npc/face/RescueGuyFace.png";

    //Load can click left sprite images
    Sprite.can_click_left[0] = new Image();
    Sprite.can_click_left[0].onload = function() {
      console.log("Loaded Image: " + Sprite.can_click_left[0].src);
      delay_until_loaded();
    }
    Sprite.can_click_left[0].src = "sprite/util/Mouse.png";
    Sprite.can_click_left[1] = new Image();
    Sprite.can_click_left[1].onload = function() {
      console.log("Loaded Image: " + Sprite.can_click_left[1].src);
      delay_until_loaded();
    }
    Sprite.can_click_left[1].src = "sprite/util/MouseLeft.png";

    //Load can click right sprite images
    Sprite.can_click_right[0] = new Image();
    Sprite.can_click_right[0].onload = function() {
      console.log("Loaded Image: " + Sprite.can_click_right[0].src);
      delay_until_loaded();
    }
    Sprite.can_click_right[0].src = "sprite/util/Mouse.png";
    Sprite.can_click_right[1] = new Image();
    Sprite.can_click_right[1].onload = function() {
      console.log("Loaded Image: " + Sprite.can_click_right[1].src);
      delay_until_loaded();
    }
    Sprite.can_click_right[1].src = "sprite/util/MouseRight.png";

    //Load Map UI up arrow
    Sprite.map_ui_up_arrow = new Image();
    Sprite.map_ui_up_arrow.onload = function() {
      console.log("Loaded Image: " + Sprite.map_ui_up_arrow.src);
      delay_until_loaded();
    }
    Sprite.map_ui_up_arrow.src = "sprite/util/Up_Arrow.png";

    //Load Map UI down arrow
    Sprite.map_ui_down_arrow = new Image();
    Sprite.map_ui_down_arrow.onload = function() {
      console.log("Loaded Image: " + Sprite.map_ui_down_arrow.src);
      delay_until_loaded();
    }
    Sprite.map_ui_down_arrow.src = "sprite/util/Down_Arrow.png";

    //Load map background Image
    Sprite.map_bg = new Image();
    Sprite.map_bg.onload = function() {
      console.log("Loaded Image: " + Sprite.map_bg.src);
      delay_until_loaded();
    }
    Sprite.map_bg.src = "sprite/util/map_background.jpg";

    //Load hole Image
    Sprite.hole = new Image();
    Sprite.hole.onload = function() {
      console.log("Loaded Image: " + Sprite.hole.src);
      delay_until_loaded();
    }
    Sprite.hole.src = "sprite/util/hole.png";

    //Load ramp Image
    Sprite.ramp = new Image();
    Sprite.ramp.onload = function() {
      console.log("Loaded Image: " + Sprite.ramp.src);
      delay_until_loaded();
    }
    Sprite.ramp.src = "sprite/util/ramp.png";

    //Load exit Image
    Sprite.exit = new Image();
    Sprite.exit.onload = function() {
      console.log("Loaded Image: " + Sprite.exit.src);
      delay_until_loaded();
    }
    Sprite.exit.src = "sprite/util/Exit.png";
  }

  //Load audio into memory
  function load_audio() {
    //load npc sound effect
    new Howl({
      urls: [Pos_Sound_Manager.sound_urls[Pos_Sound_Manager.NPC_ID]+'.mp3', Pos_Sound_Manager.sound_urls[Pos_Sound_Manager.NPC_ID]+'.ogg'],
      autoplay: false,
      onload: function() {
        console.log("Loaded Sound: " + Pos_Sound_Manager.sound_urls[Pos_Sound_Manager.NPC_ID] + ".mp3 + (same file).ogg");
        delay_until_loaded();
      }
    });

    //Load background loop
    new Howl({
      urls: [Game.BG_MUSIC_URL+'.mp3', Game.BG_MUSIC_URL+'.ogg'],
      autoplay: false,
      onload: function() {
        console.log("Loaded Sound: " + Game.BG_MUSIC_URL + ".mp3 + (same file).ogg");
        delay_until_loaded();
      }
    });

    //Load battery change sound
    new Howl({
      urls: [Player.CHANGE_BATT_SOUND_URL+'.mp3', Player.CHANGE_BATT_SOUND_URL+'.ogg'],
      autoplay: false,
      onload: function() {
        console.log("Loaded Sound: " + Player.CHANGE_BATT_SOUND_URL + ".mp3 + (same file).ogg");
        delay_until_loaded();
      }
    });

    //Load battery change sound
    new Howl({
      urls: [Player.LOW_BATT_SOUND_URL+'.mp3', Player.LOW_BATT_SOUND_URL+'.ogg'],
      autoplay: false,
      onload: function() {
        console.log("Loaded Sound: " + Player.LOW_BATT_SOUND_URL + ".mp3 + (same file).ogg");
        delay_until_loaded();
      }
    });
  }

  //Checks if all assets are loaded and then starts the game
  function delay_until_loaded() {
    //Incriment counter
    asset_count++;

    //Draw completion percentage
    canvas.width = canvas.width;
    context.fillStyle = "black";
    context.textAlign = "center";
    context.font = "40px Trebuchet MS";
    context.fillText("Loading: " + Math.round(asset_count*100/NUM_ASSETS) + "% Complete", canvas.width/2, canvas.height/2);

    if (asset_count==NUM_ASSETS) {
      my_state.game.background_music.play();
      setInterval(game_loop, 17);
    }
  }

  function update() {
    //Update game
    my_state.game.update(keys, mouse_info);

    //Update last mouse status
    mouse_info.last_clicked_left = mouse_info.clicked_left;
    mouse_info.last_clicked_right = mouse_info.clicked_right;
  }

  //Create and start game
  var my_state = new Game_State();
  var asset_count = 0;
  load_audio();
  load_images();
})
