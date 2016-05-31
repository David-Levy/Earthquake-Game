//Sprite Arrays
Sprite.main_char_images = new Array(4);
Sprite.npc_face = new Array(5);
Sprite.npc_body = new Array(5);
Sprite.can_click_left = new Array(2);
Sprite.can_click_right = new Array(2);

var NUM_ASSETS = 21;

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
      Sprite.main_char_images[i].onload = function() {delay_until_loaded();}
      Sprite.main_char_images[i].src = "sprite/char/main/Main" + i + ".png";
      console.log("Loaded Image: " + Sprite.main_char_images[i].src);
    }

    //Load blue girl sprite images
    Sprite.npc_body[Npc.BLUEGIRL_ID] = new Image();
    Sprite.npc_body[Npc.BLUEGIRL_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_body[Npc.BLUEGIRL_ID].src = "sprite/char/npc/body/BlueGirlHead.png";
    console.log("Loaded Image: " + Sprite.npc_body[Npc.BLUEGIRL_ID].src);
    Sprite.npc_face[Npc.BLUEGIRL_ID] = new Image();
    Sprite.npc_face[Npc.BLUEGIRL_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_face[Npc.BLUEGIRL_ID].src = "sprite/char/npc/face/BlueGirlFace.png";
    console.log("Loaded Image: " + Sprite.npc_face[Npc.BLUEGIRL_ID].src);

    //Load green boy sprite images
    Sprite.npc_body[Npc.GREENBOY_ID] = new Image();
    Sprite.npc_body[Npc.GREENBOY_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_body[Npc.GREENBOY_ID].src = "sprite/char/npc/body/GreenBoyHead.png";
    console.log("Loaded Image: " + Sprite.npc_body[Npc.GREENBOY_ID].src);
    Sprite.npc_face[Npc.GREENBOY_ID] = new Image();
    Sprite.npc_face[Npc.GREENBOY_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_face[Npc.GREENBOY_ID].src = "sprite/char/npc/face/GreenBoyFace.png";
    console.log("Loaded Image: " + Sprite.npc_face[Npc.GREENBOY_ID].src);

    //Load old man sprite images
    Sprite.npc_body[Npc.OLDMAN_ID] = new Image();
    Sprite.npc_body[Npc.OLDMAN_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_body[Npc.OLDMAN_ID].src = "sprite/char/npc/body/OldManHead.png";
    console.log("Loaded Image: " + Sprite.npc_body[Npc.OLDMAN_ID].src);
    Sprite.npc_face[Npc.OLDMAN_ID] = new Image();
    Sprite.npc_face[Npc.OLDMAN_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_face[Npc.OLDMAN_ID].src = "sprite/char/npc/face/OldManFace.png";
    console.log("Loaded Image: " + Sprite.npc_face[Npc.OLDMAN_ID].src);

    //Load pink woman sprite images
    Sprite.npc_body[Npc.PINKWOMAN_ID] = new Image();
    Sprite.npc_body[Npc.PINKWOMAN_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_body[Npc.PINKWOMAN_ID].src = "sprite/char/npc/body/PinkWomanHead.png";
    console.log("Loaded Image: " + Sprite.npc_body[Npc.PINKWOMAN_ID].src);
    Sprite.npc_face[Npc.PINKWOMAN_ID] = new Image();
    Sprite.npc_face[Npc.PINKWOMAN_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_face[Npc.PINKWOMAN_ID].src = "sprite/char/npc/face/PinkWomanFace.png";
    console.log("Loaded Image: " + Sprite.npc_face[Npc.PINKWOMAN_ID].src);

    //Load rescue guy sprite images
    Sprite.npc_body[Npc.RESCUEGUY_ID] = new Image();
    Sprite.npc_body[Npc.RESCUEGUY_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_body[Npc.RESCUEGUY_ID].src = "sprite/char/npc/body/RescueGuyHead.png";
    console.log("Loaded Image: " + Sprite.npc_body[Npc.RESCUEGUY_ID].src);
    Sprite.npc_face[Npc.RESCUEGUY_ID] = new Image();
    Sprite.npc_face[Npc.RESCUEGUY_ID].onload = function() {delay_until_loaded();}
    Sprite.npc_face[Npc.RESCUEGUY_ID].src = "sprite/char/npc/face/RescueGuyFace.png";
    console.log("Loaded Image: " + Sprite.npc_face[Npc.RESCUEGUY_ID].src);

    //Load can click left sprite images
    Sprite.can_click_left[0] = new Image();
    Sprite.can_click_left[0].onload = function() {delay_until_loaded();}
    Sprite.can_click_left[0].src = "sprite/util/Mouse.png";
    console.log("Loaded Image: " + Sprite.can_click_left[0].src);
    Sprite.can_click_left[1] = new Image();
    Sprite.can_click_left[1].onload = function() {delay_until_loaded();}
    Sprite.can_click_left[1].src = "sprite/util/MouseLeft.png";
    console.log("Loaded Image: " + Sprite.can_click_left[1].src);

    //Load can click right sprite images
    Sprite.can_click_right[0] = new Image();
    Sprite.can_click_right[0].onload = function() {delay_until_loaded();}
    Sprite.can_click_right[0].src = "sprite/util/Mouse.png";
    console.log("Loaded Image: " + Sprite.can_click_right[0].src);
    Sprite.can_click_right[1] = new Image();
    Sprite.can_click_right[1].onload = function() {delay_until_loaded();}
    Sprite.can_click_right[1].src = "sprite/util/MouseRight.png";
    console.log("Loaded Image: " + Sprite.can_click_right[1].src);
  }

  //Load audio into memory
  function load_audio() {
    //load all positional sound effects
    for (var i=0; i<Pos_Sound_Manager.sound_urls.length; i++) {
      new Howl({
        urls: [Pos_Sound_Manager.sound_urls[i]+'.mp3', Pos_Sound_Manager.sound_urls[i]+'.ogg'],
        autoplay: false,
        onload: function() {delay_until_loaded();}
      });
    }

    //Load background loop
    new Howl({
      urls: [Game.BG_MUSIC_URL+'.mp3', Game.BG_MUSIC_URL+'.ogg'],
      autoplay: false,
      onload: function() {delay_until_loaded();}
    });

    //Load battery change sound
    new Howl({
      urls: [Player.CHANGE_BATT_SOUND_URL+'.mp3', Player.CHANGE_BATT_SOUND_URL+'.ogg'],
      autoplay: false,
      onload: function() {delay_until_loaded();}
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
  load_images();
  load_audio();
})
