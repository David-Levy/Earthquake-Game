//Range + to - of 3d sound input
Pos_Sound_Manager.SOUND_3D_RANGE = 5;

Pos_Sound_Manager.NPC_ID = 0;

//Array of sound urls
Pos_Sound_Manager.sound_urls = [
  'audio/pos_effects/whispers'
];

var canvas;
var context;

//Define a new sound manager object
function Pos_Sound_Manager(num_floors) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Array of sounds for each floor
  this.floor_sounds = new Array(num_floors);
  for (var i=0; i<this.floor_sounds.length; i++) {
    this.floor_sounds[i] = new Array();
  }

  //Set current floor to top floor
  this.current_floor = num_floors-1;

  //Changes the set of sounds to be used
  this.change_floor = function(floor) {
    for (var i=0; i<this.floor_sounds[this.current_floor].length; i++) {
      if (this.floor_sounds[this.current_floor][i].playing==true) {
        this.floor_sounds[this.current_floor][i].playing = false;
        this.floor_sounds[this.current_floor][i].sound.stop();
      }
    }

    //change current floor to new floor
    this.current_floor = floor;
    console.log("hit change floor");
    console.log(this.current_floor);
  }

  //Insert a new sound into a floor
  this.insert = function(loc, sound_id) {
    this.floor_sounds[loc.floor].push({
      sound: new Howl({
        urls: [Pos_Sound_Manager.sound_urls[sound_id]+'.mp3', Pos_Sound_Manager.sound_urls[sound_id]+'.ogg'],
        loop: true,
        volume: 1
        }),
      playing: false,
      loc: {
        floor: loc.floor,
        row: loc.row,
        col: loc.col
      }
    });

    //Set position to center
    this.floor_sounds[loc.floor][this.floor_sounds[loc.floor].length-1].sound.pos3d(0, 0, 0);

    return this.floor_sounds[loc.floor][this.floor_sounds[loc.floor].length-1];
  }

  //pauses all sounds on floor
  this.pause_all = function() {
    console.log(this.current_floor);
    for (var i=0; i<this.floor_sounds[this.current_floor].length; i++) {
      this.floor_sounds[this.current_floor][i].sound.pause();
    }
  }

  //looks for the given sound and removes it from the list, return true if sound was removed
  this.remove_sound = function(target_sound) {
    console.log("hit3");
    for (var i=0; i<this.floor_sounds[target_sound.loc.floor].length; i++) {
      if (this.floor_sounds[target_sound.loc.floor][i].loc.row==target_sound.loc.row && this.floor_sounds[target_sound.loc.floor][i].loc.col==target_sound.loc.col) {
        this.floor_sounds[target_sound.loc.floor].splice(i, 1);

        return true;
      }
    }

    return false;
  }

  //resumes all paused sounds on the floor
  this.resume_all = function() {
    for (var i=0; i<this.floor_sounds[this.current_floor].length; i++) {
      if (this.floor_sounds[this.current_floor][i].playing) {
        this.floor_sounds[this.current_floor][i].sound.play();
      }
    }
  }
}
