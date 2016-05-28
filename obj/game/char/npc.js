var canvas;
var context;

//Size of npc
var NPC_DIM = 50;
var TALK_BUFFER = 20;

Npc.BLUEGIRL_ID = 0;
Npc.OLDMAN_ID = 1;
Npc.GREENBOY_ID = 2;
Npc.PINKWOMAN_ID = 3;
Npc.RESCUEGUY_ID = 4;

function Npc(character) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Identity of this npc
  this.identity = character;

  this.bounds = {
    x: 0,
    y: 0,
    width: NPC_DIM,
    height: NPC_DIM,
    type: Game.RECT_ID
  };
  this.obj_type = Game.NPC_ID;

  //object to represent the area in which player can talk to a npc
  this.talk_zone = {
    bounds: {
      x: this.bounds.x-TALK_BUFFER,
      y: this.bounds.y-TALK_BUFFER,
      width: NPC_DIM+(TALK_BUFFER*2),
      height: NPC_DIM+(TALK_BUFFER*2),
      type: Game.RECT_ID
    },
    obj_type: Game.NPC_TALK_ZONE_ID,
    identity: this.identity
  }
}
