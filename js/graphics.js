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
		that.moveto = function(x,y){
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
		
		//
		// Load the image, set the ready flag once it is loaded so that
		// rendering can begin.
		image.onload = function() { 
			ready = true;
		};
		image.src = spec.image;
		
		that.movetoX = function(xPos){
			spec.center.x = xPos;
		}
		that.movetoY = function(yPos){
			spec.center.y = yPos;
		}
		that.moveto = function(xPos,yPos){
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
		
		
		
		that.draw = function() {
			if (ready) {
				context.save();
				
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
	
	

	return {
		gameWidth : gameWidth,
		gameHeight : gameHeight,
		clear : clear,
		Rectangle : Rectangle,
		Polygon: Polygon,
		Text: Text,
		drawImage:drawImage,
	};
}());

