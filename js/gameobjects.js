Game.gameobjects = (function(){
	function Turret(spec){
		that.spec = spec;
		
		
		
		that.draw = function(elapsedTime){
		};
		
		that.update = function(elapsedTime){
		};
		
		return that;
	}
	
	function Tower(spec){
		var that = {
			teir: spec.tier;
			upgradePath: spec.upgradePath;
			pos: spec.pos;
		};
		that.base = 
		that.tower = Turret({
			type: spec.upgradePath[tier],
			sellPrice: spec.sellPrice,
			level: spec.level,
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
		
		that.upgrade = function (){
			if (that.teir < 3){
				that.teir++;
			}
		}
		
		that.draw = function(elapsedTime){
			that.tower.draw(elapsedTime);
			that.base.draw(elapsedTime);
		}
		
		that.update = function(elapsedTime){
			that.tower.update(elapsedTime);
			that.base.update(elapsedTime);
		}
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
}());
