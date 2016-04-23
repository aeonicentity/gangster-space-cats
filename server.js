var express = require('express'),
	http = require('http'),
	path = require('path'),
	people = require('./public/routes/people'),
	scores = require('./public/routes/scores'),
	app = express();

// all environments
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/assets', express.static(__dirname + '/assets'));

//------------------------------------------------------------------
//
// Define the different routes we support
//
//------------------------------------------------------------------
app.get('/', function(request, response) {
	response.render('index.html');
});

app.get('/v1/people', people.all);
app.post('/v1/people', people.add);

app.get('/v1/scores',scores.all);
app.post('/v1/scores/:score',scores.add);
app.put('/v1/scores/clear',scores.clear);

//------------------------------------------------------------------
//
// Indicate any other api requests are not implemented
//
//------------------------------------------------------------------
app.all('/v1/*', function(request, response) {
	response.writeHead(501);
	response.end();
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
