var scores = [500,400,300,200,100];

exports.all = function(request, response) {
	console.log('reporting highscores');
	response.writeHead(200, {'content-type': 'application/json'});
	response.end(JSON.stringify(scores));
};

//------------------------------------------------------------------
//
// Add a new person to the server data.
//
//------------------------------------------------------------------
exports.add = function(request, response) {
	console.log('Adding high score: '+request.params.score);

	scores.push(request.params.score);
	
	//sort scores
	scores.sort(function(a,b){return b-a});
	scores.splice(5,scores.length-5);
	
	response.writeHead(200);
	response.end();
};

exports.clear = function(request, response){
	console.log('clearing scores');
	scores = [];
	response.writeHead(200);
	response.end();
}
