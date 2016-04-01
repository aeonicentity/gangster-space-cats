Game.gameobjects = (function(graphics,assets){
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
			that.radius = true;
		}
		
		that.radiusOff = function(){
			that.radius = false;
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
		}
		
		that.draw = function(elapsedTime){
			if(that.showRadius){
				that.radius.draw();
			}
			
			that.base.draw(elapsedTime);
			that.tower.draw(elapsedTime);
		}
		
		that.update = function(elapsedTime){
			that.tower.update(elapsedTime);
			that.base.update(elapsedTime);
		}
		
		return that;
	}
	
	function Creep(spec){
		
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
