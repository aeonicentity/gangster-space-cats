Game.gameLoop = (function (graphics, input, screens, server, assets){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;
	var startTime;
	

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
		
		testTexture = graphics.Texture({
			center: {x:50, y:50},
			width:50,
			height:50,
			image: assets.getAsset('towerBase'),
			rotation : 0,
			moveRate : 200,			// pixels per second
			rotateRate : 3.14159	// Radians per second
		});
		
		that.update = function (){
			//console.log(that.test);
			//that.test.rotate(2*Math.Pi*elapsedTime%1000)
		};
		that.render = function (){ //placeholder function for game logic on build state.
			//console.log("update");
			rect = graphics.Rectangle({
				x:0,
				y:0,
				width:100,
				height:20,
				fill: 'rgba(241,31,96,1)',
				stroke: 'rgba(255,0,0,1)',
				rotation:0,
			});
			//console.log(test);
			
			//rect.draw();
			for( var j in that.test){
				for (var i in that.test[j]){
					//that.test[j][i].draw();
				}
			}
			testTexture.draw();
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
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets));
