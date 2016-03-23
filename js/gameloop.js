Game.gameLoop = (function (graphics, input, screens, server){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;

	function gameloop(){
		if(cancelFrame){
			/*When we cancel the game, there may be some code we want to execute here.*/
		}else{
			gameState();
			rqId = requestAnimationFrame(gameLoop)
		}
	}
	
	gameStateBuild = function (){ //placeholder function for game logic on build state.
	}
	
	gameStateBattle = function(){ //placeholder function for game logic on battle state.
	}
	
	function initializeGame(){
		/*We should use this to initialize variables we declare below*/
		gameState = gameStateBuild;
		gameloop();
	}
	
	
	
	return {
		start: initializeGame;
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server));
