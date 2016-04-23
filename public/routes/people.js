//------------------------------------------------------------------
//
// This is some dummy person data
//
//------------------------------------------------------------------
var people = [ {
		id : 0,
		name : 'John Doe',
		date : '3/3/2015',
		time : '18:40'
	}, {
		id : 1,
		name : 'Jane Doe',
		date : '3/4/2014',
		time : '14:20'
	}],
	nextId = 2;

//------------------------------------------------------------------
//
// Report all people back to the requester.
//
//------------------------------------------------------------------
exports.all = function(request, response) {
	console.log('find all people called');
	response.writeHead(200, {'content-type': 'application/json'});
	response.end(JSON.stringify(people));
};

//------------------------------------------------------------------
//
// Add a new person to the server data.
//
//------------------------------------------------------------------
exports.add = function(request, response) {
	console.log('add new person called');
	console.log('Name: ' + request.query.name);

	var now = new Date();
	people.push( {
		id : nextId,
		name : request.query.name,
		date : now.toLocaleDateString(),
		time : now.toLocaleTimeString()
	});
	nextId++;

	response.writeHead(200);
	response.end();
};
