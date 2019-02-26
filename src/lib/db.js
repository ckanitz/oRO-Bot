const { dbInfo } = require( '../config.json' );
const mysql = require( 'mysql' );

const connection = mysql.createConnection( {
	host     : dbInfo.host,
	user     : dbInfo.user,
	password : dbInfo.password,
	database : dbInfo.database
} );

module.exports = {
	getDbData( query ) {
		connection.query( query, ( error, results, fields ) => {
			console.log( error, results, fields );
		} );
	}
}
