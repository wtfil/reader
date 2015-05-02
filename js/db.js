var sqlite = require('react-native-sqlite');
var co = require('co');
function dbConnect() {
	if (dbConnect.promise) {
		return dbConnect.promise;
	}
	dbConnect.promise = new Promise(function (resolve, reject) {
		sqlite.open('app.sqlite', function (err, db) {
			if (err) {
				return reject(err);
			}
			resolve(db);
		});
	});
	return dbConnect.promise;
}
function dbCall(query, params) {
	return dbConnect().then(function (db) {
		return new Promise(function (resolve, reject) {
			var rows = [];
			db.executeSQL(
				query,
				params || [],
				rows.push.bind(rows),
				function (err) {
					return err ? reject(err) : resolve(rows);
				}
			);
		});
	});
}


co(function* () {
	/*yield dbCall('drop table books');*/
	var tables = yield dbCall('select name from sqlite_master where type="table" and name="books"');
	if (!tables.length) {
		yield dbCall('create table books(id auto_increment, name varchar(30), text text)');
	}
	var books = yield dbCall('select * from books');
	console.log(books);
}).catch(console.error.bind(console));


