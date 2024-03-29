var canvas;
var context;

//Size of npc
Npc.NPC_DIM = 50;
var TALK_BUFFER = 20;

Npc.BLUEGIRL_ID = 0;
Npc.OLDMAN_ID = 1;
Npc.GREENBOY_ID = 2;
Npc.PINKWOMAN_ID = 3;
Npc.RESCUEGUY_ID = 4;
Npc.SIBLING_ID = 5;
Npc.SIBLING_RADIO_1_ID = 6;
Npc.SIBLING_RADIO_2_ID = 7;
Npc.SIBLING_RADIO_3_ID = 8;

function Npc(character, my_tile, sound) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Identity of this npc
  this.identity = character;

  this.bounds = {
    x: 0,
    y: 0,
    width: Npc.NPC_DIM,
    height: Npc.NPC_DIM,
    type: Game.RECT_ID
  };
  this.obj_type = Game.NPC_ID;

  this.my_sound = sound;

  //object to represent the area in which player can talk to a npc
  this.talk_zone = {
    bounds: {
      x: this.bounds.x-TALK_BUFFER,
      y: this.bounds.y-TALK_BUFFER,
      width: Npc.NPC_DIM+(TALK_BUFFER*2),
      height: Npc.NPC_DIM+(TALK_BUFFER*2),
      type: Game.RECT_ID
    },
    obj_type: Game.NPC_TALK_ZONE_ID,
    identity: this.identity,
    loc: {
      floor: my_tile.floor,
      row: my_tile.row,
      col: my_tile.col
    }
  }

  //Draw the npc
  this.draw = function() {
    context.save();
    context.translate(this.bounds.x+(this.bounds.width/2), this.bounds.y+(this.bounds.height/2));
    context.rotate(Math.PI);
    context.drawImage(Sprite.npc_body[this.identity], -(this.bounds.width/2), -(this.bounds.height/2), this.bounds.width, this.bounds.height);
    context.restore();
  }
}
