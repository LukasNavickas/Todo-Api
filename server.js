var express = require('express');
var app = express();
var todos = [{
	id: 1,
	description: 'Meet mom for lunch',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'read a book',
	completed: true
}];

var PORT = process.env.PORT || 3000;

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

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});