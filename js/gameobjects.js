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
			currentFace: spec.dirFace,
			firing: false,
			target: null,
			fireOrder: null,
			idle: true,
			rotationSpeed: 200,//rotation speed for one revolution in seconds
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
			that.turret.moveTo(x,y);
		};
		
		that.faceTo = function(angle){
			that.dirFace = angle;
		}
		
		that.draw = function(elapsedTime){
			that.turret.draw();
		};
		
		that.selectTarget = function(target){
			that.idle = false;
			yDiff = Math.abs(target.y - pos.y); //rise
			xDiff = Math.abs(target.x - pos.x); //run
			hyp = Math.sqrt(xDiff*xDiff + yDiff * yDiff);
			//calculate new angle to target to.
			console.log('turning: '+ ( Math.asin(yDiff/hyp)));
			//assign that to the dirFace variable
			that.dirFace = Math.asin(yDiff/hyp);
		}
		
		that.update = function(elapsedTime){
			if(!that.idle){
				//console.log('rotating to target: '+Math.abs(that.currentFace)+' to '+Math.abs(that.dirFace));
				if(Math.abs(that.dirFace) != Math.abs(that.currentFace)){
					if( Math.abs(that.dirFace - that.currentFace) > (Math.PI*2)/that.rotationSpeed ){ //if we cant get there this time...
						if(Math.abs(that.currentFace) < Math.abs(that.dirFace)){
							that.currentFace += (Math.PI*2)/that.rotationSpeed;
						}else{
							that.currentFace -= (Math.PI*2)/that.rotationSpeed;
						}
					}else{
						that.currentFace = Math.abs(that.dirFace);
					}
				}
			}
			that.turret.setRotation(that.currentFace);
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
			idle: true,
			idleRotationAngle: null,
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
			dirFace: Math.random()*(2*Math.PI),
			target: null,
			rotationSpeed: 8000,
			fireRate: spec.fireRate,
			radius: spec.radius,
		});
		
		that.rotateTo = function (angle){
			that.tower.faceTo(angle);
		};
		
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
			
			if(that.idle){
				that.tower.rotateIdle();
			}else{
			}
		}
		
		return that;
	}



	function Creep(spec){
		console.log(spec);
        var that = {
            type: spec.type,
            typepath: spec.typepath,
			pos: spec.pos,
            value: spec.value,
            width: spec.creepWidth,
            height: spec.height,
			health: spec.health,
            destination: spec.destination,
            speed: spec.speed,
            rotation: spec.rotation,
            path: spec.path,
        }
        that.sprite = graphics.SpriteSheet(spec);
        
		that.update = function(elapsedTime) {
			that.sprite.update(elapsedTime);
            that.creepTo(elapsedTime);
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
        
        that.creepTo = function(elapsedTime){
            //check if in square
            var b = that.path.length - 1;
            console.log(that.path[b].x, that.path[b].y);
            if(that.pos.x < that.path[b].x + 25 && that.pos.x > that.path[b].x - 25 && that.pos.y < that.path[b].y + 25 && that.pos.y > that.path[b].y - 25){
                if(that.path.length > 1){
                that.path.pop();
                console.log(that.path.length);
                console.log("SHIFT");
                }
            }
            if(that.path[0].x > that.pos.x){
                that.pos.x += that.speed;
            }
            else if(that.path[0].x < that.pos.x){
                that.pos.x -= that.speed;
            }
            if(that.path[0].y> that.pos.y){
                that.pos.y += that.speed;
            }
            else if(that.path[0].y<that.pos.y){
                that.pos.y-=that.speed;
            }
        };
        
        that.draw = function(elapsedTime){
			that.sprite.draw(elapsedTime);
		};
		
		return that;
	}
	
	function Pellet(spec){
		var that = {
			speed:10,//pixels/second
			type:0,//
			maxRange:spec.range,
			origin:spec.origin,
			target:spec.target,
			pellet:null,
		}
		
		if(type == 0){
			that.pellet = graphics.Circle({
				center: origin,
				radius: 2,
				fill: 'rgba(255,255,255,1)',
				line: 0,
				lineColor: 'rgba(255,255,255,1)',
			});
		}
		
		that.update = function(elapsedTime){
		}
		that.draw = function(){
		}
	}
	
	return {
		Turret: Turret,
		Tower: Tower,
		Creep: Creep,
		Pellet: Pellet,
	};
}(Game.graphics, Game.assets));
