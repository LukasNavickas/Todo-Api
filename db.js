var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development'; // access predefined nodeJS variable
var sequelize;

if (env === 'production') { // only true when running on Heroku
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres' // connect to ppostgres database on Heroku
	});

} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite', // if its not on herok, but local, use sqlite database
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}


var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; // set to object in order to return multiple files