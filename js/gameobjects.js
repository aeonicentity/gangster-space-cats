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
			fill:'rgba(255,0,0,0.2)',
			rotation:0,
		});
		
		that.updatePos = function(x,y,dx,dy){
			that.left = x;
			that.right = dx;
			that.top = y;
			that.bottom = dy;
			that.boundingBox.moveTo(x,y)
		}
		that.updatePosCenter = function(x,y,r){
			that.left = x-r;
			that.right = x+r;
			that.top = y-r;
			that.bottom = y+r;
			that.boundingBox.moveTo(x-r,y-r);
		}
		
		that.collidesWith = function (box){
			/*console.log("Collision test");
			console.log(that);
			console.log("vs");
			console.log(box);*/
			return !(  that.left >= box.right || 
				   that.right <= box.left || 
				   that.top >= box.bottom ||
				   that.bottom <= box.top);
		}
		
		that.clickedOn = function(x,y){
			return !(  that.left >= x || 
				   that.right <= x || 
				   that.top >= y ||
				   that.bottom <= y);
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
			currentFace: spec.dirFace,
			range: spec.radius,
			firing: false,
			target: null,
			fireOrder: null,
			idle: true,
			rotationSpeed: 200,//rotation speed for one revolution in seconds
			fireRate:spec.fireRate,
			lastFire:null,
			damage:spec.damage,
			pelletType:spec.pelletType,
			aa:spec.aa,
		};
		
		that.turret = graphics.Texture({
			center: {x:that.pos.x,y:that.pos.y},
			width:50,
			height:50,
			image: assets.getAsset(that.type),
			rotation: that.dirFace,
			moveRate: 200,
			rotateRate: Math.PI*4
		});
		
		that.upgrade = function (type){
			that.type=type;
			that.turret.setImage(assets.getAsset(that.type));
		}
		
		that.setFireOrder = function(order){
			that.fireOrder = order;
		}
		
		that.rotateIdle = function(){
			that.currentFace += (Math.PI*2)/that.rotationSpeed;
			if(that.currentFace >= (Math.PI*2) ){
				that.currentFace = 0;
			}
		}
		
		that.moveTo = function(x,y){
			//console.log("moving to: "+x+","+y);
			that.pos.x = x;
			that.pos.y = y;
			that.turret.moveTo(x,y);
		};
		
		that.faceTo = function(angle){
			that.dirFace = angle;
		}
		
		that.draw = function(elapsedTime){
			that.turret.draw();
		};
		
		that.clearTarget = function(){
			that.idle = true;
			that.target = null;
		}
		
		that.selectTarget = function(target){
			that.idle = false;
			//console.log("selecting target, idle: "+that.idle);
			//console.log(target);
			that.target = target;
		}
		
		that.isInRange = function(x,y){
			var difx = x - that.pos.x;
			var dify = y - that.pos.y;
			var curDistance = Math.sqrt(Math.pow(difx,2) + Math.pow(dify,2));
			if(that.range >= curDistance){
				return true;
			}return false;
		}
		
		function crossProduct2d(v1, v2) {
			return (v1.x * v2.y) - (v1.y * v2.x);
		}
		
		function computeAngle(rotation, ptCenter, ptTarget) {
			var v1 = {
					x : Math.cos(rotation),
					y : Math.sin(rotation)
				},
				v2 = {
					x : ptTarget.x - ptCenter.x,
					y : ptTarget.y - ptCenter.y
				},
				dp,
				angle;

			v2.len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
			v2.x /= v2.len;
			v2.y /= v2.len;

			dp = v1.x * v2.x + v1.y * v2.y;
			angle = Math.acos(dp);

			//
			// Get the cross product of the two vectors so we can know
			// which direction to rotate.
			cp = crossProduct2d(v1, v2);
			return {
				angle : angle,
				crossProduct : cp
			};
		}
		
		function testTolerance(value, test, tolerance) {
			if (Math.abs(value - test) < tolerance) {
				return true;
			} else {
				return false;
			}
		}
		
		that.update = function(elapsedTime){
			if(that.lastFire == null){
				that.lastFire = elapsedTime;
			}
			if(!that.idle){
				var result = computeAngle(that.currentFace, spec.center, that.target);
				if(testTolerance(result.angle, 0, 0.04) == false){
					
					//that.currentFace = result.angle;
					if (result.crossProduct > 0) {
						that.currentFace += (Math.PI*2)/that.rotationSpeed;
						spec.rotation += spec.rotateRate;
					} else {
						that.currentFace -= (Math.PI*2)/that.rotationSpeed;
						spec.rotation -= spec.rotateRate;
					}
				}else{ //else we're pointed and firing may commence when ready!
					//that.currentFace = that.dirFace;
					if(that.lastFire + that.fireRate <= elapsedTime){
						//console.log("firing to angle: "+result.angle);
						//console.log("from position: "+that.pos.x+","+that.pos.y);
						//console.log('firing');
						that.lastFire = elapsedTime;
						Game.gameLoop.addPellet(Pellet({
							range:that.range,
							origin:{x: that.pos.x,y: that.pos.y},
							target:that.target,
							angle: that.currentFace,
							type: that.pelletType,
							damage: that.damage,
							aa:that.aa,
						}));
					}
				}
			}else{
				//that.rotateIdle();
			}
			that.turret.setRotation(that.currentFace);
		};
		
		return that;
	}
	
	function Tower(spec){
		console.log(spec);
		var that = {
			tier: spec.tier,
			typeName: spec.typeName,
			sellPrice: spec.sellPrice,
			upgradePath: spec.upgradePath,
			upgradeFunc: spec.upgradeActions,
			pos: spec.pos,
			showRadius: true,
			showBounding: false,
			idle: true,
			idleRotationAngle: null,
			box: CollisionBox(spec.pos.x-25,spec.pos.y-25,spec.pos.x+25,spec.pos.y+25),
			damage: spec.damage,
			aa:spec.aa,
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
			//rotateRate : 3.14159	// Radians per second
		});
		that.tower = Turret({
			center: that.pos,
			type: that.upgradePath[that.tier],
			sellPrice: spec.sellPrice,
			level: spec.tier,
			dirFace: Math.random()*(2*Math.PI),
			target: null,
			rotationSpeed: 8000,
			fireRate: spec.fireRate,
			radius: spec.radius,
			damage: that.damage,
			pelletType: spec.pelletType,
			aa:that.aa,
		});
		
		that.isInRange = function(x,y){
			return that.tower.isInRange(x,y);
		}
		
		that.rotateTo = function (angle){
			that.tower.faceTo(angle);
		};
		
		that.clearTarget = function (target){
			//that.idle = true;
			that.tower.clearTarget();
		}
		
		that.selectTarget = function (target){
			that.idle = false;
			that.tower.selectTarget(target);
		}
		
		that.radiusOn = function(){
			that.showRadius = true;
		}
		
		that.radiusOff = function(){
			that.showRadius = false;
		}
		
		that.upgrade = function (){
			if (that.tier < 2){
				that.tier++;
			}
			that.tower.level = that.tier;
			that.tower.upgrade(that.upgradePath[that.tier]);
			that.upgradeFunc[that.tier](that);
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
			
			if(that.idle){
				that.tower.rotateIdle();
			}else{
			}
		}
		
		return that;
	}
	
	function TextParticle(spec){
        var that = {
            pos: {x:spec.pos.x,y:spec.pos.y},
            life: spec.life,
            dx: spec.dx,
            dy: spec.dy,
        }
        
        that.particle = graphics.Text({
			x: that.pos.x, 
			y: that.pos.y,
			txt: spec.text,
			font: '20px Arial',
		});
        
        that.update = function(ticktime){
            spec.life -= ticktime;
            
            if(spec.life > 0){
            	that.pos.x += that.dx;
            	that.pos.y += that.dy;
				that.particle = graphics.Text({
					x: that.pos.x, 
					y: that.pos.y,
					txt: spec.text,
					font: '20px Arial',
				});
				return true;
			}else{
				return false;
			}
        };
        
        that.draw = function(){
            that.particle.draw()
            
        };
        return that;
    }

    function Particle(spec){
        var that = {
            pos: {x:spec.pos.x,y:spec.pos.y},
            life: spec.life,
            dx: spec.dx,
            dy: spec.dy,
            color: spec.color
        }
        
        
        that.update = function(ticktime){
            spec.life -= ticktime;
            
            if(spec.life > 0){
                //move particle
                that.pos.y += that.dy;
                that.pos.x += that.dx;
                
             that.particle = graphics.Circle({
				center: {x: that.pos.x, y: that.pos.y},
				radius: 2,
				fill: spec.color,
				line: 0,
				lineColor: spec.color,
			});
			that.radius = 2;
                return true;
            }
            else{
                return false;
            }
            

        };
        
			that.particle = graphics.Circle({
				center: {x: that.pos.x, y: that.pos.y},
				radius: 2,
				fill: 'rgba(0,66,0,1)',
				line: 0,
				lineColor: 'rgba(255,251,15,0.3)',
			});
			that.radius = 2;
        
        that.draw = function(){
            that.particle.draw()
            
        };
        return that;
    }


	function Creep(spec){
		//console.log(spec);
        var that = {
            type: spec.type,
            typepath: spec.typepath,
			pos: {x:spec.pos.x,y:spec.pos.y},
            value: spec.value,
            width: spec.creepWidth,
            height: spec.height,
			health: spec.health,
            destination: spec.destination,
            speed: spec.speed,
            rotation: spec.rotation,
            path: spec.path,
            air: spec.air,
            live: true,
        }
        that.sprite = graphics.SpriteSheet({
        	type: spec.type,
            typepath: spec.typepath,
			pos: {x:spec.pos.x,y:spec.pos.y},
            value: spec.value,
            spriteTime : spec.spriteTime,
			health: spec.health,
            maxhealth: spec.maxhealth,
            spriteCount: spec.spriteCount,
            width: spec.width,
            height: spec.height,
            destination: {x:800, y:300},
            speed: spec.speed,
            rotation: spec.rotation,
            path: spec.path,
        });
        
		that.update = function(elapsedTime) {
			that.sprite.update(elapsedTime);
            that.creepTo(elapsedTime);
            that.box.updatePosCenter(that.pos.x,that.pos.y,25);
		};
		
		that.render = function() {
			that.sprite.draw();
		};
        
		
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
		
		that.box = CollisionBox(that.pos.x-25,that.pos.y-25,that.pos.x+25,that.pos.y+25);
		
		that.hit = function(damage){
			return that.sprite.hit(damage);
		}
        
        that.creepTo = function(elapsedTime){
            //check if in square
            
            var b = that.path.length - 1;
            if(that.pos.x < that.path[b].x + 25 && that.pos.x > that.path[b].x - 25 && that.pos.y < that.path[b].y + 25 && that.pos.y > that.path[b].y - 25){
                if(that.path.length > 1){
                that.path.pop();
                b = that.path.length - 1;
                }
                
            }
            console.log('moving to: '+that.path[b].x+','+that.path[b].y);
            if(that.path.length >= 1){
            if(that.path[b].x >= that.pos.x){
                that.pos.x += that.speed;
            }
            else if(that.path[b].x < that.pos.x){
                that.pos.x -= that.speed;
            }
            if(that.path[b].y>= that.pos.y){
                that.pos.y += that.speed;
            }
            else if(that.path[b].y<that.pos.y){
                that.pos.y -= that.speed;
            }
            }
            that.sprite.moveTo(that.pos.x,that.pos.y)
        };
        
        that.reportPos = function(){
			return that.sprite.getPos();
		}
        
        that.draw = function(elapsedTime){
        	that.box.draw();
			that.sprite.draw(elapsedTime);
		};
		
		return that;
	}
	
	function Pellet(spec){
		var that = {
			speed:100,//pixels/second
			type:spec.type,//
			maxRange:spec.range,
			origin:{x:spec.origin.x,y:spec.origin.y},
			target:spec.target,
			angle: spec.angle,
			//vectorAngle:
			pellet:null,
			radius: null,
			damage: spec.damage,
			aa:spec.aa,
			live:true,
		}
		
		function crossProduct2d(v1, v2) {
			return (v1.x * v2.y) - (v1.y * v2.x);
		}
		
		function computeAngle(rotation, ptCenter, ptTarget) {
			var v1 = {
					x : Math.cos(rotation),
					y : Math.sin(rotation)
				},
				v2 = {
					x : ptTarget.x - ptCenter.x,
					y : ptTarget.y - ptCenter.y
				},
				dp,
				angle;

			v2.len = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
			v2.x /= v2.len;
			v2.y /= v2.len;

			dp = v1.x * v2.x + v1.y * v2.y;
			angle = Math.acos(dp);

			//
			// Get the cross product of the two vectors so we can know
			// which direction to rotate.
			cp = crossProduct2d(v1, v2);
			return {
				angle : angle,
				crossProduct : cp
			};
		}
		
		if(that.type == 0){
			that.pellet = graphics.Circle({
				center: {x: spec.origin.x, y: spec.origin.y},
				radius: 2,
				fill: 'rgba(255,255,255,1)',
				line: 0,
				lineColor: 'rgba(255,255,255,1)',
			});
			that.radius = 2;
		}else if(that.type == 1){ //bomb type!
			that.pellet = graphics.Circle({
				center: {x: spec.origin.x, y: spec.origin.y},
				radius: 4,
				fill: 'rgba(140,140,140,1)',
				line: 0,
				lineColor: 'rgba(140,140,140,1)',
			});
			that.radius = 4;
		}else if(that.type == 2){ //missile type!
			that.pellet = graphics.Circle({
				center: {x: spec.origin.x, y: spec.origin.y},
				radius: 2,
				fill: 'rgba(255,255,255,1)',
				line: 0,
				lineColor: 'rgba(255,255,255,1)',
			});
			that.radius = 2;
		}else if(that.type == 3){//freeze type!
			that.pellet = graphics.Circle({
				center: {x: spec.origin.x, y: spec.origin.y},
				radius: 2,
				fill: 'rgba(66,203,245,1)',
				line: 0,
				lineColor: 'rgba(66,203,245,1)',
			});
			that.radius = 2;
		}
		
		that.box = CollisionBox(spec.origin.x-that.radius,spec.origin.y-that.radius,spec.origin.x+that.radius,spec.origin.y+that.radius);
		
		that.maxDistance = function(){
			var checkPos = that.pellet.getPos();
			var difx = checkPos.x - that.origin.x;
			var dify = checkPos.y - that.origin.y;
			var curDistance = Math.sqrt(Math.pow(difx,2) + Math.pow(dify,2));
			if(that.maxRange <= curDistance){
				return true;
			}return false;
		}
		
		that.reportPos = function(){
			return that.pellet.getPos();
		}
		
		that.update = function(tick){
			var checkPos = that.pellet.getPos();
			var newX = checkPos.x + that.speed * tick/1000 * Math.cos(that.angle);
			var newY = checkPos.y + that.speed * tick/1000 * Math.sin(that.angle);
			switch(that.type){
				case 0:
					break;
				case 1:
					Game.gameLoop.generateBombTrailDot(newX,newY);
					break;
				case 2:
					//modify angle
					var result = computeAngle(that.angle, checkPos, that.target);
					if (result.crossProduct > 0) {
						that.angle += (Math.PI*2)/50;
					} else {
						that.angle -= (Math.PI*2)/50;
					}
					//recalculate 
					var newX = checkPos.x + that.speed * tick/1000 * Math.cos(that.angle);
					var newY = checkPos.y + that.speed * tick/1000 * Math.sin(that.angle);
					break;
				case 3:
					break;
				
			}
			
			that.pellet.moveTo(newX,newY);
			that.box.updatePosCenter(newX,newY,2);
		}
		
		that.draw = function(){
			that.pellet.draw();
			//that.box.draw();
		}
		
		return that;
	}
	
	return {
		CollisionBox: CollisionBox,
		Turret: Turret,
		Tower: Tower,
		Creep: Creep,
		Pellet: Pellet,
		TextParticle: TextParticle,
        Particle: Particle,
	};
}(Game.graphics, Game.assets));
