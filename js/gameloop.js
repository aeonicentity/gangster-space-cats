Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;
	var startTime;
	var tempTower = null;
    var tempCreep = null;
	var mouse;
	var towers = [];
    var creeps = [];
	var towerGrid = [];
	var shortestPath = null;
	
	function populateTowerGrid(){
		for(var i =0; i < graphics.gameHeight - 50; i+=50){
			line = []
			for(var j=0; j < graphics.gameWidth -50; j+=50){
				line.push(false);
			}
			towerGrid.push(line);
		}
		console.log(towerGrid);
	}

	function gameloop(){
		var elapsedTime = performance.now() - startTime;
		if(cancelFrame){
			/*When we cancel the game, there may be some code we want to execute here.*/
            /*we tell them they're weak noobs for being quitters*/
		}else{
			gameState.update(elapsedTime);
			gameState.render(elapsedTime);
			rqId = requestAnimationFrame(gameloop)
		}
	}
	
	function addBasicTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['proj_tower_1','proj_tower_2','proj_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
	
	function addBombTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['bomb_tower_1','bomb_tower_2','bomb_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
	
	function addAirTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['air_tower_1','air_tower_2','air_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
    
    function addCreep1(){
        tempCreep = gameobjects.Creep({
            type: 1,
            typepath:'creep_1',
			pos: {x:100, y:300},
            value: 5,
			health: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: [],
        });
        creeps.push(tempCreep);
    }
    
    function addCreep2(){
        tempCreep = gameobjects.Creep({
            type: 2,
            typepath:'creep_2',
			pos: {x:100, y:300},
            value: 5,
			health: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: [],
        });
        creeps.push(tempCreep);
    }
    
    function addCreepAir(){
        tempCreep = gameobjects.Creep({
            type: 3,
            typepath:'creep_air',
			pos: {x:100, y:300},
            value: 5,
			health: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: [],
        });
        creeps.push(tempCreep);
    }
    
    function addCreepBoss(){
        tempCreep = gameobjects.Creep({
            type: 4,
            typepath:'creep_boss',
			pos: {x:100, y:300},
            value: 5,
			health: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: [],
        });
        creeps.push(tempCreep);
    }
    
	
	function towerCollision(obj){
		console.log(obj);
		for( i in towers){
			if(towers[i].box.collidesWith(obj)){
				console.log("Tower collision");
				return true;
			}
		}return false;
	}
	
	function addSlowTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['slow_tower_1','slow_tower_2','slow_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
	
	gameStateBuild = (function (){
		var that = {
			test:[],
		};
		
		var hexSize = 100;
		
		for ( var j = 0; j*hexSize*2 < graphics.gameHeight + hexSize; j++){
			var temp = []
			var offset = 0;
			if( j % 2 ){
				offset = hexSize;
			}
			for ( var i = 0; i*hexSize*2 < graphics.gameWidth + hexSize ; i++){
				//console.log(i);
				temp [i] = graphics.Polygon({
					rotation:(Math.PI/2),
					x: ((hexSize*2)*i)+offset,
					y:(hexSize*2*j),
					size:hexSize,
					sides:6,
					stroke:"#000000",
					lineWidth:0,
					fill:"#ffffff",
				});
			}
			that.test.push(temp)
		}
		
		that.update = function (elapsedTime){
			//console.log(that.test);
			//that.test.rotate(2*Math.Pi*elapsedTime%1000)
			mouseInputs = mouse.update(elapsedTime);
			pos = mouse.position;
			if(tempTower != null){
				//console.log(mouseInputs.length);
				if(mouseInputs.length > 0 && !towerCollision(tempTower.box)){
					towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1] = true;
					console.log('pos: '+(Math.round(pos.y/50)-1)+','+(Math.round(pos.x/50)-1));
					tempTower.radiusOff();
					towers.push(tempTower);
					tempTower = null;
				}else{
					if(pos.x >= 25 && pos.x <= graphics.gameWidth-25 && pos.y >= 25 && pos.y <= graphics.gameHeight-25){
						tempTower.moveTo(Math.round(pos.x/50)*50,Math.round(pos.y/50)*50);
						
					}
				}
			}
		};
		that.render = function (elapsedTime){ //placeholder function for game logic on build state.
			//console.log("update");
			graphics.clear();
			
			for(var i in towers){
				towers[i].draw();
			}
            
           for(var c in creeps){
				creeps[c].draw();
			}
			
			if(tempTower != null){
				tempTower.draw();
			}
		};
		return that;
	}());
	
	gameStateBattle = function(){ //placeholder function for game logic on battle state.
	}
	
	function initializeGame(){
		/*We should use this to initialize variables we declare below*/
		console.log ("Initializing...");
		populateTowerGrid();
		gameState = gameStateBuild;
		startTime = performance.now();
		mouse = input.Mouse();
		gameloop();
	}
	
	
	
	return {
		start: initializeGame,
		addBasicTower: addBasicTower,
		addBombTower: addBombTower,
		addAirTower: addAirTower,
		addSlowTower: addSlowTower,
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets, Game.gameobjects));
