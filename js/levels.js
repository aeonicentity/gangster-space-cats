Game.levels = (function(gameobjects){
	var that = {}
	
	function addCreep1(path){
        var tempCreep = gameobjects.Creep({
            type: 1,
            typepath:'creep_1',
			pos: {x:0, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
			health: 150,
            maxhealth: 150,
            spriteCount: 4,
            width: 50,
            height: 50,
            destination: {x:800, y:300},
            speed: 1,
            rotation: 0,
            air:false,
            path: path,
        });
        return tempCreep;
    }
    
    function addCreep2(path){
        var tempCreep = gameobjects.Creep({
            type: 2,
            typepath:'creep_2',
			pos: {x:0, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
            width: 50,
            spriteCount: 4,
            height: 50,
			health: 5000,
            maxhealth: 5000,
            destination: {x:800, y:300},
            speed: 2,
            rotation: 0,
            air:false,
            path: path,
            
        });
        return tempCreep;
    }
    
    function addCreepAir(path){
    	var tempCreep = gameobjects.Creep({
            type: 3,
            spriteCount: 4,
            typepath:'creep_air',
			pos: {x:0, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
            creepWidth: 50,
            height: 50,
			health: 50,
            maxhealth: 50,
            destination: {x:800, y:300},
            speed: 2,
            rotation: 0,
            air:true,
            path: path,
        });
        return tempCreep;
    }

	function randomTime(offset, range){
		return offset + Math.floor(Math.random() * range);
	}
	
	function randomCreep(path){
		var randInt = Math.floor(Math.random() * 3);
		switch(randInt){
			case 0:
				return addCreep1(path);
				break;
			case 1:
				return addCreep2(path);
				break;
			case 2:
				return addCreepAir(path);
				break;
			default:
				return addCreep1(path);
				break;
		}
	}

	function level1(){
		that = {
			elapsedLevelTime: 0,
			creepQueue: {},
			offset: 500,
		}
		
		for(var i=0; i < 10; i++){
			var timing = randomTime(that.offset*i,500);
			that.creepQueue[timing] = addCreep1(Game.gameLoop.getHorizontalPath());
		}
		
		that.update = function(tickTime){
			var creepReturn = [];
			that.elapsedLevelTime += tickTime;
			for(var i in that.creepQueue){
				if(that.creepQueue.hasOwnProperty(i) && that.elapsedLevelTime > parseInt(i)){
					console.log('spawning at '+i);
					creepReturn.push(that.creepQueue[i]);
					delete that.creepQueue[i];
				}
			}
			return creepReturn;
		};
		
		return that;
	}

	function level2(){
		that = {
			elapsedLevelTime: null,
			creepQueue: {},
		}
		
		that.update = function(tickTime){}
		
		return that;
	}
	
	function level3(){
		that = {
			elapsedLevelTime: null,
			creepQueue: {},
		}
		
		that.update = function(tickTime){}
		
		return that;
	}
	
	function level4(){
		that = {
			elapsedLevelTime: null,
			creepQueue: {},
		}
		
		that.update = function(tickTime){}
		
		return that;
	}

	function generateRandomLevel(levelIndex){
		that = {
			elapsedLevelTime: null,
			creepQueue: {},
		}
		
		that.update = function(tickTime){}
		
		return that;
	}
	
	var curLevel = null;
	
	function setLevel(level){
		if(level == 0){ //Only send ground 1 from left to right
			curLevel = level1();
			console.log(curLevel);
			console.log("setting level: 1");
		}else if(level == 1){ //Send only ground 1 from both entrances
			curLevel = level2();
		}else if(level == 2){ //Send only grounds from both entances
			curLevel = level3();
		}else if(level == 3){ //send everything from everywhere
			curLevel = level4();
		}else{
			curLevel = generateRandomLevel(level);
		}
		
	}
	
	return {
		setLevel: setLevel,
		curLevel: curLevel,
		getCurLevel: function(){return curLevel;},
	};
}(Game.gameobjects)  );
