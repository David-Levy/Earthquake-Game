var canvas;
var context;

//Size of interact area
var TALK_BUFFER = 20;

function Radio(radio_log, my_tile) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Identity of this radio communication
  this.identity = radio_log;

  //object to represent the area in which player can talk to a npc
  this.bounds = {
    x: 0-TALK_BUFFER,
    y: 0-TALK_BUFFER,
    width: Npc.NPC_DIM+(TALK_BUFFER*2),
    height: Npc.NPC_DIM+(TALK_BUFFER*2),
    type: Game.RECT_ID
  }
  this.obj_type = Game.EVENT_ID,
  this.loc = {
    floor: my_tile.floor,
    row: my_tile.row,
    col: my_tile.col
  }
}
