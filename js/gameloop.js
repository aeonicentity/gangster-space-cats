Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;
	var startTime;
	var tempTower = null;
	

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
	}
	
	function addAirTower(){
	}
	
	function addSlowTower(){
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
		
		testTexture = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['proj_tower_1','proj_tower_2','proj_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
		
		that.update = function (){
			//console.log(that.test);
			//that.test.rotate(2*Math.Pi*elapsedTime%1000)
			if(tempTower != null){
				pos = input.position;
				tempTower.moveTo(pos.x,pos.y);
			}
		};
		that.render = function (){ //placeholder function for game logic on build state.
			//console.log("update");
			testTexture.draw();
			
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
		gameloop();
	}
	
	
	
	return {
		start: initializeGame,
		addBasicTower: addBasicTower,
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets, Game.gameobjects));
