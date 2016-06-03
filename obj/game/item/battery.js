var canvas;
var context;

Battery.MAX_LIFE = 18000; //~5 minutes
Battery.MIN_LIFE = 10800; //~3 minutes
Battery.LOW_WARN_POINT = Math.floor(Battery.MAX_LIFE*0.2);
Battery.BATTERY_DIM_X = 25;
Battery.BATTERY_DIM_Y = 25;

function Battery(location) {
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");

  //Set battery bounds
  this.bounds = {
    x: location.x,
    y: location.y,
    width: Battery.BATTERY_DIM_X,
    height: Battery.BATTERY_DIM_Y,
    type: Game.RECT_ID
  }
  this.obj_type = Game.BATTERY_ID;

  //Set life of battery and warning point
  this.life = Math.floor(Math.random()*(Battery.MAX_LIFE-Battery.MIN_LIFE))+Battery.MIN_LIFE;
  this.warn_point = Math.floor(this.life*0.03);

  //Draws the battery
  this.draw = function() {
    if (this.bounds.x!=null && this.bounds.y!=null) {
      context.fillStyle = "gray";
      context.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }
  }

  //Updates the battery
  this.update = function() {
    this.life--;
    if (this.life<0) {this.life = 0;}
  }
}
