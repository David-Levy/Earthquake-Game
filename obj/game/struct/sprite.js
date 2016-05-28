var Sprite = function(images, speed) {
	this.num_images = images.length; //number of images in sprite
  this.speed = speed; //number of steps before sprite changes image
  this.current_step = 0; //timer used for managing sprite speed
	this.images = images; //Array of images
  this.current_image = 0; //index of the current image
}

//gets the current image of the sprite
Sprite.prototype.get_image = function() {
	return this.images[this.current_image];
}

//Reset sprite to first image
Sprite.prototype.reset = function() {
	this.current_step = 0;
  this.current_image = 0;
}

//tracks current image to be displayed
Sprite.prototype.update = function() {
	this.current_step++;
  if (this.current_step==this.speed) {
  	this.current_step = 0;
    this.current_image++;
    if (this.current_image==this.num_images) {
    	this.current_image = 0;
    }
  }
}
