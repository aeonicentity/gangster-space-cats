Game.screens={};
Game.screens['state-mainmenu'] = (function(game) {
	'use strict';
	
	function initialize() {
		//Set the input functions for the keys.
		
	}
	
	function run(input) {
		
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.gameLoop));


Game.screens['state-about'] = (function(game) {
	function initialize(){
	}
	
	function run(input){
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(Game.gameLoop));

Game.screens['state-scores'] = (function(game) {

	function getScoreString(){
		return "";
	}

	function initialize(){

		
		document.getElementById('id-score-zone').innerHTML = getScoreString();
			
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
