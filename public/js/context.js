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
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(xhttp.readyState == 4 && xhttp.status == 200){
				//callback
				var htmlString = "<ol>";
				var scoreArr = JSON.parse(xhttp.responseText);
				for(var i = 0; i<scoreArr.length; i++){
					htmlString += "<li>"+scoreArr[i]+"</li>";
				}
				htmlString += "</ol>";
				document.getElementById('id-score-zone').innerHTML = htmlString;
			}
		};
		xhttp.open("GET", 'http://localhost:3000/v1/scores', true);
		xhttp.send();
	}

	function initialize(){

		
		getScoreString();
			
		document.getElementById('id-score-clear').addEventListener(
			'click',
			function() {Game.gameLoop.clearScores();});
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
		Game.gameLoop.unpause();
		Game.gameLoop.keyboard.setSellTower(Game.gameLoop.sellKey);
		Game.gameLoop.keyboard.setUpgradeTower(Game.gameLoop.upgradeKey);
		Game.gameLoop.keyboard.setNextWave(Game.gameLoop.nextLevelKey);
		Game.gameLoop.keyboard.setNewGame([KeyEvent.DOM_VK_N]);
		Game.gameLoop.keyboard.setBackKey([KeyEvent.DOM_VK_ESCAPE]);
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
