var express = require('express');
var bodyParser = require('body-parser');

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
	var matchedTodo;

	todos.forEach(function(todo) {
		if(todoid === todo.id) {
			matchedTodo = todo;
		}
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send('No match found! Try a lower number');
	}

});

// POST /todos
app.post('/todos', function(req, res) {
	var body = req.body;
	// console.log('description: ' + body.description);
	body.id = todoNextId;
	todoNextId++;

	todos.push(body);

	res.json(body);
});

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});