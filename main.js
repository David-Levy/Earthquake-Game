//Sprite Arrays
Sprite.main_char_images = new Array(4);
Sprite.npc_face = new Array(6);
Sprite.npc_body = new Array(6);
Sprite.can_click_left = new Array(2);
Sprite.can_click_right = new Array(2);
Sprite.escape_scene = new Array(3);
Sprite.map_bg;
Sprite.map_ui_up_arrow;
Sprite.map_ui_down_arrow;
Sprite.hole;
Sprite.ramp;
Sprite.exit;
Sprite.battery;
Sprite.health_kit;
Sprite.walkie;

var NUM_ASSETS = 36;

$(document).ready(function(){
  var canvas = $("#canvas")[0];
  var context = canvas.getContext("2d");

  //Global constants
  var STATE_PLAYING_GAME = 1;

  var delay_state_id;

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
    if (my_state.game.state<4) {
      my_state.game.draw();
    }
    else if (my_state.game.state==4) {
      canvas.width = canvas.width;
      context.fillStyle = "black";
      context.textAlign = "center";
      context.font = "40px Trebuchet MS";
      context.fillText("You lost the light!", canvas.width/2, canvas.height/2);
      context.fillText("<Click To Try Again>", canvas.width/2, canvas.height/2+45);
    }
    else if (my_state.game.state==5) {
      canvas.width = canvas.width;
      if (escape_scene.sprite.current_image>0 || !escape_scene.passed_first) {
        context.drawImage(escape_scene.sprite.get_image(), 0, 0, canvas.width, canvas.height);
      }
      else {
        context.fillStyle = "black";
        context.textAlign = "center";
        context.font = "40px Trebuchet MS";
        context.fillText("You Escaped!", canvas.width/2, canvas.height/2);
        context.fillText("<Click To Play Again>", canvas.width/2, canvas.height/2+45);
      }
    }
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

    //Load sibling sprite images
    Sprite.npc_body[Npc.SIBLING_ID] = new Image();
    Sprite.npc_body[Npc.SIBLING_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_body[Npc.SIBLING_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_body[Npc.SIBLING_ID].src = "sprite/char/npc/body/SiblingHead.png";
    Sprite.npc_face[Npc.SIBLING_ID] = new Image();
    Sprite.npc_face[Npc.SIBLING_ID].onload = function() {
      console.log("Loaded Image: " + Sprite.npc_face[Npc.SIBLING_ID].src);
      delay_until_loaded();
    }
    Sprite.npc_face[Npc.SIBLING_ID].src = "sprite/char/npc/face/SiblingFace.png";

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

    //Load escape scene images
    Sprite.escape_scene[0] = new Image();
    Sprite.escape_scene[0].onload = function() {
      console.log("Loaded Image: " + Sprite.escape_scene[0].src);
      delay_until_loaded();
    }
    Sprite.escape_scene[0].src = "sprite/util/Hands1.png";
    Sprite.escape_scene[1] = new Image();
    Sprite.escape_scene[1].onload = function() {
      console.log("Loaded Image: " + Sprite.escape_scene[1].src);
      delay_until_loaded();
    }
    Sprite.escape_scene[1].src = "sprite/util/Hands2.png";
    Sprite.escape_scene[2] = new Image();
    Sprite.escape_scene[2].onload = function() {
      console.log("Loaded Image: " + Sprite.escape_scene[2].src);
      delay_until_loaded();
    }
    Sprite.escape_scene[2].src = "sprite/util/Hands3.png";

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
    Sprite.hole.src = "sprite/util/Hole.png";

    //Load ramp Image
    Sprite.ramp = new Image();
    Sprite.ramp.onload = function() {
      console.log("Loaded Image: " + Sprite.ramp.src);
      delay_until_loaded();
    }
    Sprite.ramp.src = "sprite/util/Ramp.png";

    //Load exit Image
    Sprite.exit = new Image();
    Sprite.exit.onload = function() {
      console.log("Loaded Image: " + Sprite.exit.src);
      delay_until_loaded();
    }
    Sprite.exit.src = "sprite/util/Exit.png";

    //Load battery Image
    Sprite.battery = new Image();
    Sprite.battery.onload = function() {
      console.log("Loaded Image: " + Sprite.battery.src);
      delay_until_loaded();
    }
    Sprite.battery.src = "sprite/util/Battery.png";

    //Load health kit Image
    Sprite.health_kit = new Image();
    Sprite.health_kit.onload = function() {
      console.log("Loaded Image: " + Sprite.health_kit.src);
      delay_until_loaded();
    }
    Sprite.health_kit.src = "sprite/util/HealthKit.png";

    //Load walkie Image
    Sprite.walkie = new Image();
    Sprite.walkie.onload = function() {
      console.log("Loaded Image: " + Sprite.walkie.src);
      delay_until_loaded();
    }
    Sprite.walkie.src = "sprite/util/WalkieTalkie.png";
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
    //Incriment counted
    if (asset_count<NUM_ASSETS) {
      asset_count++;
    }

    //Draw completion percentage
    canvas.width = canvas.width;
    context.fillStyle = "black";
    context.textAlign = "center";
    context.font = "40px Trebuchet MS";
    context.fillText("Loading: " + Math.round(asset_count*100/NUM_ASSETS) + "% Complete", canvas.width/2, canvas.height/2);
    context.fillText("You can only explore as long as you have light:", canvas.width/2, (canvas.height/4)-90);
    context.fillText("You only have 3 batteries to use.", canvas.width/2, (canvas.height/4)-45);
    context.fillText("Hint: You can open and close your map with right click,", canvas.width/2, (canvas.height/4));
    context.fillText("you can also view your items on the map screen.", canvas.width/2, (canvas.height/4)+45);
    context.fillText("This game is best experienced with headphones", canvas.width/2, canvas.height-45);

    if (asset_count==NUM_ASSETS) {
      context.fillText("<Click to Begin>", canvas.width/2, 3*(canvas.height/4));
      delay_state_id = setInterval(delay_until_clicked, 17);
    }
  }

  //Delays the game until user clicks
  function delay_until_clicked() {
    if (!mouse_info.clicked_left && mouse_info.last_clicked_left) {
      clearInterval(delay_state_id);
      my_state.game.background_music.play();
      setInterval(game_loop, 17);
    }

    //Update last mouse status
    mouse_info.last_clicked_left = mouse_info.clicked_left;
    mouse_info.last_clicked_right = mouse_info.clicked_right;
  }

  function update() {
    //Update game
    if (my_state.game.state<4) {
      my_state.game.update(keys, mouse_info);
    }
    else if (my_state.game.state==4) {
      if (mouse_info.last_clicked_left && !mouse_info.clicked_left) {
        my_state = new Game_State();
      }
    }
    else if (my_state.game.state==5) {
      if (escape_scene.sprite.current_image>0 || !escape_scene.passed_first) {
        escape_scene.sprite.update();
        if (escape_scene.sprite.current_image>0) {escape_scene.passed_first = true;}
      }
      else {
        if (mouse_info.last_clicked_left && !mouse_info.clicked_left) {
          my_state = new Game_State();
          escape_scene = {
            sprite: new Sprite(Sprite.escape_scene, 120),
            passed_first: false
          };
        }
      }
    }

    //Update last mouse status
    mouse_info.last_clicked_left = mouse_info.clicked_left;
    mouse_info.last_clicked_right = mouse_info.clicked_right;
  }

  //Create and start game
  var asset_count = 0;
  load_audio();
  load_images();
  var my_state = new Game_State();
  var escape_scene = {
    sprite: new Sprite(Sprite.escape_scene, 120),
    passed_first: false
  };
})
