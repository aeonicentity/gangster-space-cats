Game.storage = (function (){
	var highScores = [],
		fastestTimes = [],
		previousScores = localStorage.getItem('BombSweeper.highScores'),
		previousTimes = localStorage.getItem('BombSweeper.fastestTimes'),
		previousLevelScores = JSON.parse(localStorage.getItem('BombSweeper.levelScores')),
		previousLevelTimes = JSON.parse(localStorage.getItem('BombSweeper.levelTimes'));
	if (previousScores !== null && previousTimes !== null) {
		highScores = JSON.parse(previousScores).sort(function (a, b){return b-a});
		fastestTimes = JSON.parse(previousTimes).sort(function (a,b){return b-a});
	}
	
	function addScore(score,levelScores,time,levelTime) {
		highScores.push(score);
		highScores.sort(function (a, b){return b-a});
		if(highScores.length > 5){
			highScores.splice(5,highScores.length-5);
		}
		fastestTimes.push(time);
		fastestTimes.sort(function (a, b){return b-a});
		if(fastestTimes.length > 5){
			highScores.splice(5,fastestTimes.length-5);
		}
		
		if (previousLevelScores.length < 5){
			previousLevelScores = [0,0,0,0,0];
		}
		if (previousLevelTimes.length < 5){
			previousLevelTimes = [0,0,0,0,0];
		}
		
		for(var i =0 ; i < 5; i++){	
			if(levelScores[i] > previousLevelScores[i]){
				previousLevelScores[i] = levelScores[i];
			}
		}
		for(var i =0 ; i < 5; i++){
			if(levelTime[i] < previousLevelTimes[i]){
				previousLevelTimes[i] = levelTime[i];
			}
		}
		
		//STOR
		stor();
	}
	
	function stor(){
		localStorage['BombSweeper.highScores'] = JSON.stringify(highScores);
		localStorage['BombSweeper.fastestTimes'] = JSON.stringify(fastestTimes);
		localStorage['BombSweeper.levelScores'] = JSON.stringify(previousLevelScores);
		localStorage['BombSweeper.levelTimes'] = JSON.stringify(previousLevelTimes);
	}

	function removeScore(key) {
		delete highScores[key];
		
		stor();
	}
	
	function getLowestScore(){
		return highScores[highScores.length -1];
	}
	
	function removeAllScores(){
		console.log('clearing');
		localStorage['BombSweeper.highScores'] = JSON.stringify([]);
		localStorage['BombSweeper.fastestTimes'] = JSON.stringify([]);
		localStorage['BombSweeper.levelScores'] = JSON.stringify([]);
		localStorage['BombSweeper.levelTimes'] = JSON.stringify([]);
	}

	function reportScores() {
		console.log('reporting');
		return {highScore: highScores, fastTimes: fastestTimes, levelTimes: previousLevelTimes, levelScores: previousLevelScores};
	}

	return {
		addScore : addScore,
		removeScore : removeScore,
		removeAllScores: removeAllScores,
		reportScores : reportScores,
		getLowestScore : getLowestScore,
	};
}());
