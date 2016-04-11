Game.gameobjects = (function(graphics,assets){
	function CollisionBox(x,y,dx,dy){
		var that = {
			left:x,
			right:dx,
			top:y,
			bottom:dy,
		}
		that.boundingBox = graphics.Rectangle({
			x:x,
			y:y,
			width:dx-x,
			height:dy-y,
			fill:'rgba(255,251,15,0.3)',
			rotation:0,
		});
		
		that.updatePos = function(x,y,dx,dy){
			that.left = x;
			that.right = dx;
			that.top = y;
			that.bottom = dy;
			that.boundingBox.moveTo(x,y)
		}
		
		that.collidesWith = function (box){
			console.log("Collision test");
			console.log(that);
			console.log("vs");
			console.log(box);
			return !(  that.left >= box.right || 
				   that.right <= box.left || 
				   that.top >= box.bottom ||
				   that.bottom <= box.top);
		}
		
		that.draw = function(){
			that.boundingBox.draw();
		}
		
		return that
	}
	
	function Turret(spec){
		var that = {
			pos: {x:spec.center.x, y:spec.center.y},
			type: spec.type,
			turret: null,
			dirFace: spec.dirFace,
			firing: false,
			target: null,
		};
		
		that.turret = graphics.Texture({
			center: {x:that.pos.x,y:that.pos.y},
			width:50,
			height:50,
			image: assets.getAsset(that.type),
			rotation: that.dirFace,
			moveRate: 200,
			rotateRate: Math.PI*2
		});
		
		that.moveTo = function(x,y){
			that.turret.moveTo(x,y);
		};
		
		that.draw = function(elapsedTime){
			that.turret.draw();
		};
		
		that.update = function(elapsedTime){
		};
		
		return that;
	}
	
	function Tower(spec){
		console.log(spec);
		var that = {
			tier: spec.tier,
			upgradePath: spec.upgradePath,
			pos: spec.pos,
			showRadius: true,
			showBounding: false,
			box: CollisionBox(spec.pos.x-25,spec.pos.y-25,spec.pos.x+25,spec.pos.y+25),
		};
		that.radius = graphics.Circle({
			center: that.pos,
			radius: spec.radius,
			fill: 'rgba(255,251,15,0.3)',
			line: 0,
			lineColor: 'rgba(255,251,15,0.3)',
		});
		that.base = graphics.Texture({
			center: that.pos,
			width:50,
			height:50,
			image: assets.getAsset('towerBase'),
			rotation : 0,
			moveRate : 200,			// pixels per second
			rotateRate : 3.14159	// Radians per second
		});
		that.tower = Turret({
			center: {x:that.pos.x, y:that.pos.y},
			type: that.upgradePath[that.tier],
			sellPrice: spec.sellPrice,
			level: spec.tier,
			dirFace: 0,
			target: null,
			rotationSpeed: 8000,
			fireRate: spec.fireRate,
			radius: spec.radius,
		});
		
		that.rotateTo = function (angle){
			that.tower.rotateTo(angle);
		};
		
		that.selectTarget = function (target){
			that.tower.selectTarget(target);
		}
		
		that.radiusOn = function(){
			that.showRadius = true;
		}
		
		that.radiusOff = function(){
			that.showRadius = false;
		}
		
		that.upgrade = function (){
			if (that.teir < 3){
				that.teir++;
			}
		}
		
		that.moveTo = function(x,y){
			that.pos.x = x;
			that.pos.y = y;
			that.radius.moveTo(x,y);
			that.base.moveTo(x,y);
			that.tower.moveTo(x,y);
			that.box.updatePos(x-25,y-25,x+25,y+25);
		}
		
		that.draw = function(elapsedTime){
			if(that.showRadius){
				that.radius.draw();
			}
			
			
			that.base.draw(elapsedTime);
			that.tower.draw(elapsedTime);
			if(that.showBounding){
				that.box.draw();
			}
		}
		
		that.update = function(elapsedTime){
			that.tower.update(elapsedTime);
			that.base.update(elapsedTime);
		}
		
		return that;
	}



	function Creep(spec){
		console.log(spec);
        var that = {
            type: spec.tier,
            typepath: spec.typepath,
			pos: spec.pos,
            value: spec.value,
			health: spec.health,
            destination: spec.destination,
            speed: spec.speed,
            rotation: spec.rotation,
            path: spec.path,
        }
        that.sprite = graphics.SpriteSheet(spec);
        
		that.update = function(elapsedTime) {
			that.sprite.update(elapsedTime);
		};
		
		/*that.render = function() {
			that.sprite.draw();
		};*/
		
		that.rotateRight = function(elapsedTime) {
			spec.rotation += spec.rotateRate * (elapsedTime);
		};
		
		that.rotateLeft = function(elapsedTime) {
			spec.rotation -= spec.rotateRate * (elapsedTime);
		};
        
        that.moveTo = function(x,y){
			that.pos.x = x;
			that.pos.y = y;
		};
        
        that.draw = function(elapsedTime){
			that.sprite.draw(elapsedTime);
		};
		
		return that;
	}
	
	function Pellet(spec){
		
	}
	
	return {
		Turret: Turret,
		Tower: Tower,
		Creep: Creep,
		Pellet: Pellet,
	};
}(Game.graphics, Game.assets));
