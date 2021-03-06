Game.graphics = (function(){
	'use strict';
	var gameWidth = 540;
	var gameHeight = 411;
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
		
		that.getPos = function(){
			return that.center;
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
			
			if(spec.hasOwnProperty('stroke')){
				context.strokeStyle = spec.stroke;
				context.strokeRect(spec.x, spec.y, spec.width, spec.height);
			}

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
<<<<<<< HEAD
	
	function CountDown(spec){
		var that = Texture(spec);
		
		that.setCounter = function(tick){
			that.setImg('assets/glass_numbers_'+tick+'.png');
		};
		return that;
	}
	
=======
  
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
	function Texture(spec) {
		var that = {
			center:{x:spec.center.x,y:spec.center.y},
		},
			ready = false,
			image = new Image();
		//console.log(image);
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
			that.center.x = xPos;
		}
		that.movetoY = function(yPos){
			that.center.y = yPos;
		}
		that.moveTo = function(xPos,yPos){
			that.center.x = xPos;
			that.center.y = yPos;
		}
		
		that.setImg = function(src){
			image.src = src;
		}
		
		that.reportPos = function (){
			return {x:that.center.x -spec.width/2,
					y:that.center.y - spec.height/2,
					dx:that.center.x+spec.height - spec.height/2,
					dy:that.center.y+spec.width - spec.height/2};
		}
		that.reportCenter = function(){
			return {x:that.center.x,y:that.center.y};
		}
		
		that.setRotation = function (angle){
			spec.rotation = angle + Math.PI;
		}
		
		that.setImage = function(newImg){
			image.src = newImg.src;
		}
		
		
		//console.log(image.src);
		that.draw = function() {
			if (ready) {
				context.save();
				context.translate(that.center.x, that.center.y);
				context.rotate(spec.rotation);
				context.translate(-that.center.x, -that.center.y);
				
				context.drawImage(
					image, 
					that.center.x - spec.width/2, 
					that.center.y - spec.height/2,
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
		
		that.setPos = function(x,y){
			spec.x = x;
			spec.y = y;
		}
		
		that.draw = function(){
			context.font = spec.font;
			context.textAlign = "center";
			context.fillText(spec.txt, spec.x, spec.y);
			context.fillStyle="white";
		}
		return that;
	}

	
    
//////////////////Sprite sheet stuff
      function SpriteSheet(spec){
          var that = {};
          var image = new Image();
          //console.log(spec);

          var image = new Image();    
          spec.sprite = 0; //start sprite
          spec.elapsedTime = 0;
          
          image.onload = function(){
          	
          	
              that.draw = function(){
                context.save();
                context.translate(spec.pos.x, spec.pos.y);
				context.rotate(spec.rotation);
				context.translate(-spec.pos.x, -spec.pos.y);
                
                //healthbars
                context.fillStyle = "red";
                context.beginPath();
                context.rect(spec.pos.x-25, spec.pos.y-35, 50, 5);
                context.fill();
                var per;
                per = spec.health/spec.maxhealth *100;
                context.fillStyle = "green";
                context.beginPath();
                context.rect(spec.pos.x-25, spec.pos.y-35, per/2, 5);
                context.fill();
                
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
			spec.creepWidth = image.width / spec.spriteCount;
			spec.width = image.width / spec.spriteCount;

          };
          image.src = 'assets/'+spec.typepath+'.png';
          
        that.rotateRight = function(tickTime) {
            console.log("roating right:");
			spec.rotation += spec.rotateRate * (tickTime);
		};
		
		that.rotateLeft = function(tickTime) {
            console.log("rotating left");
			spec.rotation -= spec.rotateRate * (tickTime);
		};
          
		that.update = function(elapsedTime, forward) {
			spec.elapsedTime += ticktime;
            
            //console.log(spec.spriteTime[spec.sprite]);
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
					if (spec.sprite < 0) {
						spec.sprite = spec.spriteCount - 1;
					}
				}
			}
		};
        
        that.draw = function(elapsedTime) {

          };
        that.getPos = function(){
      		return {x:spec.pos.x, y:spec.pos.y};
      	}
      	that.moveTo = function(x,y){
      		spec.pos.x = x;
      		spec.pos.y = y;
      	}
      	that.hit = function(damage){
      		spec.health -= damage
      		if(spec.health <= 0){
      			return true;
      		}return false;
      	}
          
          
         
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
		CountDown: CountDown,
		Text: Text,
		drawImage: drawImage,
		SpriteSheet: SpriteSheet,
	};
}());

