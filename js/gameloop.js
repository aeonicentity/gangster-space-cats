Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects, screens, storage){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateGo;
	var gameStateCountdown;
	
	var startTime;
	var mouse;
	var potentialTimers = [9,9,8,8,7,7,5,6,7,5,5,5,4,4,4,3,2,1];
	var timersLeft = potentialTimers;
	var filledPositons = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
	];
	var potentialPositions = [
		{x:25,y:25},{x:100,y:25},{x:175,y:25},
		{x:25,y:100},{x:100,y:100},{x:175,y:100},
		{x:25,y:175},{x:100,y:175},{x:175,y:175},
		{x:25,y:250},{x:100,y:250},{x:175,y:250},
		{x:25,y:325},{x:100,y:325},{x:175,y:325},
		{x:25,y:400},{x:100,y:400},{x:175,y:400},
	];
	var timerSelection = 6;
	var level = 0;
	var levelScores = [0,0,0,0,0];
	var levelTime = [0,0,0,0,0]
	var score = 0;
	var scoreKeeper = graphics.Text({
		txt: 'score: 0',
		x: graphics.gameWidth-90,
		y: 40,
		font: '30px Verdana',
	});
	var time = 0;
	var timer = graphics.Text({
		txt: 'time: 0',
		x: graphics.gameWidth-90,
		y: 60,
		font: '30px Verdana',
	});
	
	function updateScore(amt){
		if (score+amt <0){
			score = 0;
		}else{
			score += amt;
		}
		scoreKeeper.setText('score: '+score)
		levelScores[level] += amt;
	}
	
	function updateTime(elapsedTime){
		time = Math.floor(elapsedTime/1000);
		timer.setText('time: '+time);
	}
	

	function gameloop(){
		var elapsedTime = performance.now() - startTime;
		if(cancelFrame){
			/*When we cancel the game, there may be some code we want to execute here.*/
		}else{
			graphics.clear();
			gameState.update(elapsedTime);
			gameState.render(elapsedTime);
			rqId = requestAnimationFrame(gameloop)
		}
	}
	
	function simpleRandom(n0,n1){
		return Math.floor(Math.random() * n1) + n0;
	}
	
	function resetPos(){
		for(i in filledPositons){
			filledPositons[i] = false;
		}
	}
	
	function emptyPos(){
		for(i in filledPositons){
			if(!filledPositons[i]){
				return true;
			}
		}return false;
	}
	
	gameStateGo = (function (){
		var that = {
			bombs: [],
			levelStart: null,
		};
		
		
		that.loadLevel = function(elapsedTime){
			timersLeft = potentialTimers.slice(0,6 + (level*3));
			that.bombs = [];
			that.levelStart = elapsedTime;
			resetPos();
			var maxRange = 6 + (level*3);
			while (timersLeft.length > 0){
				var newTimer = timersLeft.splice(simpleRandom(0,timersLeft.length-1),1);
				var pos = simpleRandom(0,filledPositons.length-1);
				while(filledPositons[pos] && emptyPos()){
					pos = (pos+1) % filledPositons.length;
				}
				filledPositons[pos] = true;
				console.log("spawning Bomb:"+newTimer+" second");
				that.bombs.push(gameobjects.Bomb({
					center:potentialPositions[pos],
					start:elapsedTime,
					end: elapsedTime + (newTimer * 1000),
				}));
			}
			console.log(that.bombs);
		};		
		
		that.update = function (elapsedTime){
			updateTime(elapsedTime);
			mouseInputs = mouse.update(elapsedTime);
			var totalExpiredBombs = 0;
			for(i in that.bombs){
				if (mouseInputs.length > 0){
					console.log("checking");
					if(that.bombs[i].checkIntersect(mouseInputs[0])){
						//if true update score
						updateScore(5);
						//check if all bombs are clicked or exploded
						
					}
				}
				if(that.bombs[i].expired()){
					totalExpiredBombs++;
				}
				that.bombs[i].update(elapsedTime);
			}
			if(totalExpiredBombs == that.bombs.length && level < 5){
				//subtract all exploded bombs from the score
				for(i in that.bombs){
					if(that.bombs[i].exploded == true){
						updateScore(-5);
					}
				}
				levelTime[level] = Math.floor(elapsedTime-that.levelStart);
				level++;
				gameStateCountdown.initialize(elapsedTime);
				gameState = gameStateCountdown;
			}else if (level >= 5){
				gameStateEnd.storeScores();
				gameState = gameStateEnd;
			}
		};
		that.render = function (elapsedTime){ 
			scoreKeeper.draw();
			timer.draw();
			for(i in that.bombs){
				that.bombs[i].draw();
			}
		};
		return that;
	}());
	
	gameStateCountdown = (function(){
		var that = {
			count: 3,
			start: null,
		};
		
		that.counter = graphics.Text({
			txt: 3,
			x: graphics.gameWidth/2,
			y: graphics.gameHeight/2,
			font: '30px Verdana',
		});
		
		that.initialize = function (elapsedTime){
			that.start = elapsedTime;
		}
		
		that.update = function (elapsedTime){
			if(that.start+(that.count*1000) <= elapsedTime){
				gameStateGo.loadLevel(elapsedTime);
				gameState = gameStateGo;
				//console.log('launch game');
			}
			updateTime(elapsedTime);
			that.counter.setText(3-Math.floor((elapsedTime-that.start)/1000));
		};
		that.render = function (elapsedTime){ 
			scoreKeeper.draw();
			timer.draw();
			that.counter.draw();
		};
		return that;
	}());
	
	gameStateEnd = (function(){
		var that = {
		};
		
		that.gameOver = graphics.Text({
			txt: "Game Over",
			x: graphics.gameWidth/2,
			y: graphics.gameHeight/2,
			font: '60px Verdana',
		});
		
		that.update = function (elapsedTime){
		};
		
		that.render = function (elapsedTime){ 
			scoreKeeper.draw();
			timer.draw();
			that.gameOver.draw();
		};
		
		that.storeScores = function (){
			storage.addScore(score,levelScores,time,levelTime)
		}
		
		return that;
	}());
	
	function initializeGame(){
		/*We should use this to initialize variables we declare below*/
		cancelFrame = false;
		console.log ("Initializing...");
		gameState = gameStateCountdown;
		
		startTime = performance.now();
		mouse = input.Mouse();
		gameloop();
	}
	
	function endGame(){
		cancelFrame = true;
	}
	
	function showScreen(id) {
		var screen = 0,
			active = null;
		//
		// Remove the active state from all screens.  There should only be one...
		active = document.getElementsByClassName('Active');
		for (screen = 0; screen < active.length; screen++) {
			active[screen].classList.remove('Active');
		}
		//
		// Tell the screen to start actively running
		screens[id].initialize();
		screens[id].run();
		//
		// Then, set the new screen to be active
		document.getElementById(id).classList.add('Active');
	}
	
	return {
		start: initializeGame,
		stop: endGame,
		showScreen: showScreen,
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets, Game.gameobjects, Game.screens, Game.storage));
