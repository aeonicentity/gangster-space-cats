Game.graphics = (function(){
	'use strict';
	var gameWidth = 800;
	var gameHeight = 500;
	var canvas = document.getElementById("gameZone"); 
	var	context = canvas.getContext('2d');
	canvas.width  = gameWidth;
	canvas.height = gameHeight;
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1,0,0,1,0,0);
		this.clearRect(0,0,canvas.width,canvas.height);
		this.restore();
	};
	
	function clear(){
		context.clear();
	}
	
	function drawImage(spec) {
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
		context.drawImage(
			spec.image, 
			spec.center.x - spec.size/2, 
			spec.center.y - spec.size/2,
			spec.size, spec.size);
		
		context.restore();
	}
	
	function Circle(spec){
		var that = {
			radius: spec.radius,
			center: spec.center,
		};
		
		that.draw = function(){
			context.save();
			context.beginPath();
			context.arc(that.center.x, that.center.y, that.radius, 0 ,2 * Math.PI, false);
			context.fillStyle = spec.fill;
			context.fill();
			context.lineWidth = spec.line;
			context.strokeStyle = spec.lineColor;
			context.stroke();
			context.restore();
		}
		
		that.moveTo =  function(x,y){
			that.center.x = x;
			that.center.y = y;
		};

		that.update = function(){};
		
		return that;
	}
	
	function Polygon(spec){ //N-sided polygon.
		var that = {};
		
		that.rotate = function(angle){
			spec.rotation = angle
		};
		
		that.draw = function(){
			context.save();
			context.translate(spec.x, spec.y);
			context.rotate(spec.rotation);
			context.translate(-(spec.x), -(spec.y));
			context.fillStyle = spec.fill;

			context.beginPath();
			context.moveTo (spec.x +  spec.size * Math.cos(0), spec.y +  spec.size *  Math.sin(0));          

			for (var i = 1; i <= spec.sides;i += 1) {
				context.lineTo (spec.x + spec.size * Math.cos(i * 2 * Math.PI / spec.sides), spec.y + spec.size * Math.sin(i * 2 * Math.PI / spec.sides));
			}

			context.strokeStyle = spec.stroke;
			context.lineWidth = spec.lineWidth;
			context.stroke();
			context.fill();
			context.restore();
		};
		
		that.update = function(){};
		
		return that;
	}
	
	function Rectangle(spec) {
		var that = {};

		that.updateRotation = function(angle) {
			spec.rotation += angle;
		};
		
		that.draw = function() {
			context.save();
			/*context.translate(spec.x + spec.width / 2, spec.y + spec.height / 2);
			context.rotate(spec.rotation);
			context.translate(-(spec.x + spec.width / 2), -(spec.y + spec.height / 2));*/
			
			context.fillStyle = spec.fill;
			context.fillRect(spec.x, spec.y, spec.width, spec.height);
			
			//context.strokeStyle = spec.stroke;
			//context.strokeRect(spec.x, spec.y, spec.width, spec.height);

			context.restore();
		};
		that.movetoX = function(xPos){
			spec.x = xPos;
		}
		that.movetoY = function(yPos){
			spec.y = yPos;
		}
		that.moveTo = function(x,y){
			spec.x = x;
			spec.y = y;
		}
		
		that.resize = function (size){
			spec.width = size;
		}
		
		that.reportPos = function (){
			return {x:spec.x,y:spec.y,dx:spec.x+spec.width,dy:spec.y+spec.height};
		}
		
		that.moveLeft = function(elapsedTime) {
			spec.x -= spec.moveRate * (elapsedTime / 1000);
		};
		
		that.moveRight = function(elapsedTime) {
			spec.x += spec.moveRate * (elapsedTime / 1000);
		};

		return that;
	}
  
	function Texture(spec) {
		var that = {},
			ready = false,
			image = new Image();
		
		image.src = spec.image.src;
		//
		// Load the image, set the ready flag once it is loaded so that
		// rendering can begin.
		image.onload = function() { 
			ready = true;
		};
		/*image.src = spec.image;
		*/
		that.movetoX = function(xPos){
			spec.center.x = xPos;
		}
		that.movetoY = function(yPos){
			spec.center.y = yPos;
		}
		that.moveTo = function(xPos,yPos){
			spec.center.x = xPos;
			spec.center.y = yPos;
		}
		
		that.reportPos = function (){
			return {x:spec.center.x -spec.width/2,
					y:spec.center.y - spec.height/2,
					dx:spec.center.x+spec.height - spec.height/2,
					dy:spec.center.y+spec.width - spec.height/2};
		}
		that.reportCenter = function(){
			return {x:spec.center.x,y:spec.center.y};
		}
		
		function rotateRight(elapsedTime) {
			spec.rotation += spec.rotateRate * (elapsedTime / 1000);
		};
		
		function rotateLeft(elapsedTime) {
			spec.rotation -= spec.rotateRate * (elapsedTime / 1000);
		};
		
		function moveLeft(elapsedTime) {
			spec.center.x -= spec.moveRate * (elapsedTime / 1000);
		};
		
		function moveRight(elapsedTime) {
			spec.center.x += spec.moveRate * (elapsedTime / 1000);
		};
		
		function moveUp(elapsedTime) {
			spec.center.y -= spec.moveRate * (elapsedTime / 1000);
		};
		
		function moveDown(elapsedTime) {
			spec.center.y += spec.moveRate * (elapsedTime / 1000);
		};
		
		
		console.log(image);
		that.draw = function() {
			if (ready) {
				context.save();
				spec.width = 50;
                spec.height =50;
				context.translate(spec.center.x, spec.center.y);
				context.rotate(spec.rotation);
				context.translate(-spec.center.x, -spec.center.y);
				
				context.drawImage(
					image, 
					spec.center.x - spec.width/2, 
					spec.center.y - spec.height/2,
					spec.width, spec.height);
				
				context.restore();
			}
		};
		
		return that;
	}
	
	
	function Text(spec){
		var that = {}
		
		that.setText = function(txt){
			spec.txt = txt;
		}
		
		that.draw = function(){
			context.font = spec.font;
			context.textAlign = "center";
			context.fillText(spec.txt, spec.x, spec.y);
		}
		return that;
	}
	
    
//////////////////Sprite sheet stuff
      function SpriteSheet(spec){
          var that = {};
          var image = new Image();
          console.log("not broken");
          
          spec.sprite = 0; //start sprite
          spec.elapsedTime = 0;
          
          image.onload = function(){
              that.draw = function(){
                context.save();
                context.translate(spec.pos.x, spec.pos.y);
				context.rotate(spec.rotation);
				context.translate(-spec.pos.x, -spec.pos.y);
                
				context.drawImage(
					image,
					spec.width * spec.sprite, 0,	// Which sprite to pick out
					spec.width, spec.height,		// The size of the sprite
					spec.pos.x - spec.width/2,	// Where to draw the sprite
					spec.pos.y - spec.height/2,
					spec.width, spec.height);

				context.restore();
              };
            spec.height = image.height;
			spec.width = image.width / spec.spriteCount;
          };
          image.src = 'assets/'+spec.typepath+'.png';
          
          
		that.update = function(elapsedTime, forward) {
			spec.elapsedTime += elapsedTime;
			//
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteTime[spec.sprite]) {
				//
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteTime[spec.sprite];
				//
				// Depending upon the direction of the animation...
				if (forward === true) {
					spec.sprite += 1;
					//
					// This provides wrap around from the last back to the first sprite
					spec.sprite = spec.sprite % spec.spriteCount;
				} else {
					spec.sprite -= 1;
					//
					// This provides wrap around from the first to the last sprite
					if (spec.sprite <= 0) {
						spec.sprite = spec.spriteCount - 1;
					}
				}
			}
		};
        
        that.draw = function(elapsedTime) {
         /*image.onload = function(){
                context.save();
                context.translate(spec.pos.x, spec.pos.y);
				context.rotate(spec.rotation);
				context.translate(-spec.pos.x, -spec.pos.y);
                console.log("Drawing");
                spec.width = 50;
                spec.height = 50;
				context.drawImage(
					image,
					spec.width * spec.sprite, 0,	// Which sprite to pick out
					spec.width, spec.height,		// The size of the sprite
					spec.pos.x - spec.width/2,	// Where to draw the sprite
					spec.pos.y - spec.height/2,
					spec.width, spec.height);
                console.log(image.src);
                
                context.drawImage(image, spec.pos.x, spec.pos.y);
				context.restore();
              };
            spec.height = image.height;
			spec.width = image.width / spec.spriteCount;*/
          };
          
          
         
          image.src = 'assets/'+spec.typepath+'.png';
         
          
          return that;
      }


	

	return {
		gameWidth : gameWidth,
		gameHeight : gameHeight,
		clear : clear,
		Rectangle : Rectangle,
		Circle: Circle,
		Polygon: Polygon,
		Texture: Texture,
		Text: Text,
		drawImage: drawImage,
		SpriteSheet: SpriteSheet,
	};
}());

