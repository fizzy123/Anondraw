var config = require("../common/config.js");

var mysql = require("mysql");


var database = mysql.createConnection({
	        host: config.mysql.host,
	        user: config.mysql.user,
	        password: config.mysql.password,
	        database: config.mysql.database,
	        multipleStatements: true
});

var PlayerDatabase = require("./scripts/PlayerDatabase.js");
var playerDatabase = new PlayerDatabase(database);
playerDatabase.isIdBanned("test", function () {
	console.log(arguments)
});
