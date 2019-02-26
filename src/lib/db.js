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
		console.log( 'lib-db: executing SELECT query' );
		return new Promise(
			( resolve, reject ) => {
				connection.query( query, ( error, results, fields ) => {
					if ( null === error ) {
						resolve( results );
					} else {
						reject( error );
					}
				} );
			}
		);
	}
}
