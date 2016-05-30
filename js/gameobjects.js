Game.gameobjects = (function(graphics,assets){
	function Bomb(spec){
		var that = {
			pos: spec.center,
			spawnTime: spec.start,
			blowTime: spec.end,
			secondGap: Math.floor((spec.end-spec.start)/1000),
			exploded: false,
			diffused: false,
		};
		
		that.expired = function(){
			if(that.exploded || that.diffused){
				return true;
			}return false;
		}
		
		that.bombImage = graphics.Texture({
			center: that.pos,
			width:50,
			height:50,
			image: assets.getAsset('Bomb'),
			moveRate: 200,
			rotateRate: Math.PI*2
		});
		that.countDown = graphics.CountDown({
			center: {x:that.pos.x+5,y:that.pos.y+5},
			width:30,
			height:30,
			image: assets.getAsset('glass_numbers_'+that.secondGap),
			moveRate: 200,
			rotateRate: Math.PI*2
		})
		that.checkMark = graphics.Texture({
			center: that.pos,
			width:50,
			height:50,
			image: assets.getAsset('checkmark'),
		})
		that.explosion = graphics.Texture({
			center: that.pos,
			width:50,
			height:50,
			image: assets.getAsset('Explosion'),
		})
		
		that.moveTo = function(x,y){
			that.bombImage.moveTo(x,y);
		};
		
		that.checkIntersect = function(mouse){
			console.log('checking positon x:'+mouse.x+', y:'+mouse.y);
			console.log(' against: '+(that.pos.x-30)+'-'+(that.pos.x+30)+','+(that.pos.y-30)+'-'+(that.pos.y+30));
			if( ((that.pos.x-30) <= mouse.x && (that.pos.x+30) >= mouse.x) && 
				((that.pos.y-30) <= mouse.y && (that.pos.y+30) >= mouse.y) &&
				!that.exploded){
				console.log('intersect clicked');
				that.diffused = true;
				return true;
			}return false;
		}
		
		that.draw = function(elapsedTime){
			that.bombImage.draw();
			if(! that.exploded && ! that.diffused){
				that.countDown.draw();
			}else if(that.diffused){
				that.checkMark.draw();
			}else if(that.exploded){
				that.explosion.draw();
			}
		};
		
		that.update = function(elapsedTime){
			if(!that.expired()){
				//newTick = Math.floor((that.blowTime - (elapsedTime - that.spawnTime ))/1000);
				//that.countDown.setCounter(newTick);
			}
			if(elapsedTime <= that.blowTime && !that.expired()){ //if we haven't exploded
				newTick = Math.floor((that.blowTime - elapsedTime)/1000);
				that.countDown.setCounter(newTick);
			}else if (!that.diffused){
				//console.log("BLAM!");
				that.exploded = true;
			}
		};
		
		return that;
	}
	return {
		Bomb: Bomb,
	}
}(Game.graphics, Game.assets));
