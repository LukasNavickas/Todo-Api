var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var todos = [];
var todoNextId = 1;

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // we will be able to access any json via req.body, because bodyParser will parse it automatically

app.get('/', function(req, res) {
	res.send('Todo API root');
});

app.get('/todos', function(req, res) {
	res.json(todos);
});

app.get('/todos/:id', function(req, res) {
    var todoid = parseInt(req.params.id, 10); // always use 10 for normal cases, means nothing...
	var matchedTodo = _.findWhere(todos, {id: todoid}); // give object, where todos.id = :id
	// var matchedTodo;

	// todos.forEach(function(todo) {
	// 	if(todoid === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// });

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send('No match found! Try a lower number');
	}

});

// POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed'); // keep only description and completed on body/post request
	// console.log('description: ' + body.description);
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { // trim removes empty spaces
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId;
	todoNextId++;

	todos.push(body);

	res.json(body);
});

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});