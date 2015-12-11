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
	var queryParams = req.query // e.g todos?completed=true
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; // return objects whose description fields have the word in "q"
		});
	}

	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoid = parseInt(req.params.id, 10); // always use 10 for normal cases, means nothing...
	var matchedTodo = _.findWhere(todos, {
		id: todoid
	}); // give object, where todos.id = :id
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
		return res.status(404).send();
	}

	body.description = body.description.trim();

	body.id = todoNextId;
	todoNextId++;

	todos.push(body);

	res.json(body);
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		res.status(404).json({
			"error": "No ToDo found with provided id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
});

app.put('/todos/:id', function(req, res) { // UPDATES TODO LIST
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed'); // keep only description and completed on body/post request
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(404).send();
	}

	// HERE WE JUST OVERWRITE OUR ARRAY
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

app.listen(PORT, function() {
	console.log('express listening on port ' + PORT + '!');
});