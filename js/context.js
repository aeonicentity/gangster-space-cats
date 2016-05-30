Game.screens={};
<<<<<<< HEAD
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
=======
Game.screens['state-mainmenu'] = (function(game) {
	'use strict';
	
	function initialize() {
		//Set the input functions for the keys.
		
	}
	
	function run(input) {
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
		
	}
	
	return {
		initialize : initialize,
		run : run
	};
<<<<<<< HEAD
}(Game.main));


Game.screens['about'] = (function(game) {
	function initialize(){		
		document.getElementById('id-about-back').addEventListener(
			'click',
			function() { Game.gameLoop.showScreen('main-menu'); });
=======
}(Game.gameLoop));


Game.screens['state-about'] = (function(game) {
	function initialize(){
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
	}
	
	function run(input){
	}
	
	return {
		initialize : initialize,
		run : run
	};
<<<<<<< HEAD
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
=======
}(Game.gameLoop));

Game.screens['state-scores'] = (function(game) {

	function getScoreString(){
		return "";
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
	}

	function initialize(){

		
		document.getElementById('id-score-zone').innerHTML = getScoreString();
<<<<<<< HEAD
		
		document.getElementById('id-score-back').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('main-menu');});
=======
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
			
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
<<<<<<< HEAD
}(Game.main));


Game.screens['game-play'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-back').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('main-menu'); Game.gameLoop.stop();});
		
=======
}(Game.gameLoop));


Game.screens['state-game'] = (function(game) {
	'use strict';
	
	function initialize() {
		/*document.getElementById('id-back').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('main-menu');});*/
		Game.gameLoop.keyboard.setSellTower(Game.gameLoop.sellKey);
		Game.gameLoop.keyboard.setUpgradeTower(Game.gameLoop.upgradeKey);
		Game.gameLoop.keyboard.setNextWave(Game.gameLoop.nextLevelKey);
		Game.gameLoop.keyboard.setNewGame([KeyEvent.DOM_VK_N]);
	}
	
	function run(input) {
		//
		// I know this is empty, there isn't anything to do.
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.gameLoop));

Game.screens['state-controls'] = (function(game) {
	'use strict';
	
	function parseKeys (keyset){
		var retstring = "";
		for(var i = 0; i < keyset.length ; i++){
			retstring += ReverseKeyLookup[keyset[i]] +" ";
		}
		return retstring;
	}
	
	function initialize() {
		/*document.getElementById('id-back').addEventListener(
			'click',
			function() {Game.gameLoop.showScreen('main-menu');});*/
		document.getElementById('currentSellKeys').innerHTML = parseKeys(Game.gameLoop.sellKey);
		document.getElementById('currentUpgradeKeys').innerHTML = parseKeys(Game.gameLoop.upgradeKey);
		document.getElementById('currentWaveKeys').innerHTML = parseKeys(Game.gameLoop.nextLevelKey);
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
	}
	
	function run(input) {
		//
		// I know this is empty, there isn't anything to do.
	}
	
	return {
		initialize : initialize,
		run : run
	};
<<<<<<< HEAD
}(Game.main));
=======
}(Game.gameLoop));
>>>>>>> 4ee1b5cf7b00c96ee18464b1a983b3d42a048c58
