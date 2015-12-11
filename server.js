var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var todos = [];
var todoNextId = 1;

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); // we will be able to access any json via req.body, because bodyParser will parse it automatically

app.get('/', function(req, res) {
	res.send('Todo API root');
});

app.get('/todos', middleware.requireAuthentication, function(req, res) { // requireAuthentication called before showing ToDos
	var queryParams = req.query // e.g todos?completed=true
		// var filteredTodos = todos;
		// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		// 	filteredTodos = _.where(filteredTodos, {
		// 		completed: true
		// 	});
		// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		// 	filteredTodos = _.where(filteredTodos, {
		// 		completed: false
		// 	});
		// }

	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; // return objects whose description fields have the word in "q"
	// 	});
	// }
	// res.json(filteredTodos);
	// EXAMPLE JSON

	// EXAMPLE DATABASE
	var where = {};

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		where.completed = false;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		where.description = {
			$like: '%' + queryParams.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	})
});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoid = parseInt(req.params.id, 10); // always use 10 for normal cases, means nothing...
	// EXAMPLE USING JSON
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoid
	// }); // give object, where todos.id = :id
	// var matchedTodo;
	// todos.forEach(function(todo) {
	// 	if(todoid === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// });
	// if (matchedTodo) {
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send('No match found! Try a lower number');
	// }
	// EXAMPLE USING JSON

	// EXAMPLE USING DATABASE
	db.todo.findById(todoid).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}

	}, function(e) {
		res.status(500).send();
	});

});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	// EXAMPLE USING JSON
	var body = _.pick(req.body, 'description', 'completed'); // keep only description and completed on body/post request
	// // console.log('description: ' + body.description);
	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { // trim removes empty spaces
	// 	return res.status(404).send();
	// }

	// body.description = body.description.trim();

	// body.id = todoNextId;
	// todoNextId++;

	// todos.push(body);

	// res.json(body);
	// EXAMPLE USING JSON

	// EXAMPLE USING DATABASE
	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(404).json(e);
	});
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (!matchedTodo) {
	// 	res.status(404).json({
	// 		"error": "No ToDo found with provided id"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo);
	// }

	// EXAMPLE DATABASE
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send(); // with 204 we do not send anything, with 200 we do (e.g. message)
		}
	})
}, function() {
	res.status(500).send();
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) { // UPDATES TODO LIST
	var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });
	var body = _.pick(req.body, 'description', 'completed'); // keep only description and completed on body/post request
	var validAttributes = {};

	// if (!matchedTodo) {
	// 	return res.status(404).send();
	// }

	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	validAttributes.completed = body.completed;
	// } else if (body.hasOwnProperty('completed')) {
	// 	return res.status(404).send();
	// }

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	validAttributes.description = body.description;
	// } else if (body.hasOwnProperty('description')) {
	// 	return res.status(404).send();
	// }
	// HERE WE JUST OVERWRITE OUR ARRAY
	// _.extend(matchedTodo, validAttributes);
	// res.json(matchedTodo);

	// EXAMPLE DATABASE
	if (body.hasOwnProperty('completed')) {
		validAttributes.completed = body.completed; // vlidation is happening in todo.js
	}

	if (body.hasOwnProperty('description')) {
		validAttributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(validAttributes).then(function(todo) {
				res.json(todo.toJSON()); // success callback, fires if todo.update goes smoothly
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password'); // just take email and password from the request
	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON()); // return only email, createdat, updatedAt
	}, function(e) {
		res.status(400).json(e);
	});
});

// logging in for users
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');

		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());			
		} else {
			res.status(401).send();
		}
		
	}, function() {
		res.status(401).send();
	});

	
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('express listening on port ' + PORT + '!'); // start server
	});
}); // sync database