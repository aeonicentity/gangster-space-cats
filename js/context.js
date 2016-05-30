Game.screens={};
Game.screens['main-menu'] = (function(game) {
	'use strict';
	
	function initialize() {
		
		//
		// Setup each of menu events for the screens
		document.getElementById('id-new-game').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('game-play'); Game.gameLoop.start();});
		
		document.getElementById('id-high-scores').addEventListener(
			'click',
			function() { Game.gameLoop.showScreen('high-scores'); });
		
		document.getElementById('id-about').addEventListener(
			'click',
			function() { Game.gameLoop.showScreen('about'); });
	}
	
	function run(input) {
		//
		// I know this is empty, there isn't anything to do.
		
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.main));


Game.screens['about'] = (function(game) {
	function initialize(){		
		document.getElementById('id-about-back').addEventListener(
			'click',
			function() { Game.gameLoop.showScreen('main-menu'); });
	}
	
	function run(input){
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.main));

Game.screens['high-scores'] = (function(game) {

	function getScoreString(){
		var scorestring = "<h2>High Scores</h2><ol>";
		var allscores = Game.storage.reportScores();
		for( var score in allscores.highScore){
			if (allscores.highScore[score] != null){
				scorestring += "<li>"+allscores.highScore[score]+"</li>";
			}
		}
		scorestring += "</ol><h2>FastestTimes</h2><ol>";
		for(var i in allscores.fastTimes){
			if (allscores.fastTimes[i] != null){
				scorestring += "<li>"+allscores.fastTimes[i]+"</li>";
			}
		}
		scorestring += "</ol><h2>Fastest Level Times</h2><ol>";
		for (var i in allscores.levelTimes){
			if (allscores.levelTimes[i] != null){
				scorestring += "<li>"+Math.floor(allscores.levelTimes[i]/1000)+"</li>";
			}
		}
		scorestring += "</ol><h2>Highest Level Scores</h2><ol>";
		for (var i in allscores.levelScores){
			if (allscores.levelScores[i] != null){
				scorestring += "<li>"+allscores.levelScores[i]+"</li>";
			}
		}
		return scorestring+"</ol>";
	}

	function initialize(){

		
		document.getElementById('id-score-zone').innerHTML = getScoreString();
		
		document.getElementById('id-score-back').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('main-menu');});
			
		document.getElementById('id-score-clear').addEventListener(
			'click',
			function() {Game.storage.removeAllScores();});
	}
	
	function run(input){
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.main));


Game.screens['game-play'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-back').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('main-menu'); Game.gameLoop.stop();});
		
	}
	
	function run(input) {
		//
		// I know this is empty, there isn't anything to do.
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.main));
