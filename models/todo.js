module.exports = function(sequelize, DataTypes) {
	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false, // validation
			validate: {
				len: [1, 250] // take strings who lenght are 1 or greater than 1
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false, // validation
			defaultValue: false
		}
	});

};