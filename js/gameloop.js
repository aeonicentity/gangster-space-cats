Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;
	var startTime;
	var tempTower = null;
	var mouse;
	var towers = [];
	

	function gameloop(){
		var elapsedTime = performance.now() - startTime;
		if(cancelFrame){
			/*When we cancel the game, there may be some code we want to execute here.*/
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
			if(tempTower != null){
				//console.log(mouseInputs.length);
				if(mouseInputs.length > 0 && !towerCollision(tempTower.box)){
					tempTower.radiusOff();
					towers.push(tempTower);
					console.log("placement");
					tempTower = null;
				}else{
					pos = mouse.position;
					tempTower.moveTo(pos.x,pos.y);
				}
			}
		};
		that.render = function (elapsedTime){ //placeholder function for game logic on build state.
			//console.log("update");
			graphics.clear();
			
			for(var i in towers){
				towers[i].draw();
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
