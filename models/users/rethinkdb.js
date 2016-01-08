
/*------
Model Users (rethinkdb)
------------*/

module.exports = function(config) {

	/*------
	Dependencies
	------------*/

	var r = require('rethinkdb');
	var crypto = require('crypto');
	var _ = require('underscore');

	/*------
	Helpers
	------------*/

	var helpers = {

		connect: function(connected) {
			r.connect({
				host: config.RETHINKDB_HOST,
				port: config.RETHINKDB_PORT,
				db: config.RETHINKDB_DB
			}, function(err, connection) {
				if (err) { throw err; }
				connected(connection);
			});
		},

		hash: function(str) {
			return crypto.createHash('md5')
				.update(str + config.APP_SALT)
				.digest('hex');
		},
		
		randomstring: function() {
			return crypto.randomBytes(20).toString('hex');
		},

		safelist: function(user) { 
			var user = _.omit(user, ['password', 'token']);
			return _.isEmpty(user) ? null : user;
		},

		whitelist: function(user) {
			var user = _.pick(user, [ 'id', 'email', 'password', 'token' ]);
			return _.isEmpty(user) ? null : user;
		}

	};

	/*------
	Defining Model
	------------*/

	var model = {

		_init: function() {
			helpers.connect(function(connection) {
				r.dbCreate('app').run(connection, function(err, result) {
					r.db('app').table('users').run(connection, function(err, result) {
						if (err) { 
							r.db('app').tableCreate('users').run(connection, function(err, result) { });
						}
					});
				})
			});
		},

		assignTokenToUser: function(id, callback) {
			helpers.connect(function(connection) {
				var token = helpers.randomstring();
				r.table('users')
					.get(id)
					.update({ token: token })
					.run(connection, function(err, result) {
						if (err) { return callback(500, null, err); }
						return callback(200, { token: token });
					});
			});
		},

		createWithEmailAndPassword: function(email, password, callback) {
			helpers.connect(function(connection) {
				r.table('users')
					.insert({ 
						email: email, 
						password: helpers.hash(password) 
					})
					.run(connection, function(err, result) {
						if (err) { return callback(500, null, err); }
						return callback(200, { email: email });
					});
			});
		},

		delete: function(id, callback) {
			helpers.connect(function(connection) {
				r.table('users')
					.get(id)
					.delete()
					.run(connection, function(err, result) {
						if (err) { return callback(500, null, err); }
						return callback(204, {});	
					});
			});
		},

		getByToken: function(userToken, callback) {
			helpers.connect(function(connection) {
				r.table('users')
					.filter({ token: userToken })
					.run(connection, function(err, cursor) {
						if (err) { return callback(500, null, err); }

						cursor.toArray(function(err, result) {
							if (err) { return callback(500, null, err); }

							var user = result[0];
							user = helpers.safelist(user);
							if (!user) { return callback(404, null); }
							return callback(200, user);
						});
					});
			});
		},

		getByEmail: function(email, callback) {
			helpers.connect(function(connection) {
				r.table('users')
					.filter({ email: email })
					.run(connection, function(err, cursor) {
						if (err) { return callback(500, null, err); }

						cursor.toArray(function(err, result) {
							if (err) { return callback(500, null, err); }

							var user = result[0];
							user = helpers.safelist(user);
							if (!user) { return callback(404, null); }
							return callback(200, user);
						});
					});
			});
		},

		getByEmailAndPassword: function(email, password, callback) {
			helpers.connect(function(connection) {
				r.table('users')
					.filter({ 
						email: email, 
						password: helpers.hash(password) 
					})
					.run(connection, function(err, cursor) {
						if (err) { return callback(500, null, err); }

						cursor.toArray(function(err, result) { 
							if (err) { return callback(500, null, err); }

							var user = result[0];
							user = helpers.safelist(user);
							if (!user) { return callback(404, null); }
							return callback(200, user);							
						});
					});
			});
		},

		update: function(id, userArgs, callback) {
			helpers.connect(function(connection) {

				//Make sure we're not overwriting our token on user info update
				var userArgs = _.omit(userArgs, ['token']);
				userArgs = helpers.whitelist(userArgs);	

				if (!userArgs) { return callback(400, null); }

				//If password has been passed, we make sure to hash our value
				if (userArgs.password) { userArgs.password = helpers.hash(userArgs.password); }

				r.table('users')
					.get(id)
					.update(userArgs)
					.run(connection, function(err, result) {
						if (err) { return callback(500, null, err); }
						var user = helpers.safelist(userArgs);
						return callback(200, user);
					});
			});
		}

	};

	/*------
	Returning Model
	------------*/

	return model;

};
