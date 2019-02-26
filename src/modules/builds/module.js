/**
 * oRO-Bot Builds module.
 * This module handles the '!builds' command
 * and provides a list of available builds
 * depending on which keyword was send.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { version }   = require( '../../../package.json' );
const { getDbData } = require( '../../lib/db.js' );
const { prefix }    = require( '../../config.json' );
const Module        = require( '../module.js' );
const { command }   = require( './builds.json' );
const { isEmpty, forEach }   = require( 'lodash' );

const tables = {
	builds    : 'module_builds_builds',
	tags      : 'module_builds_tags',
	buildtags : 'module_builds_build_tag',
}

/**
 * Builds-Module Class
 */
class Builds extends Module {
	/**
	 * Constructor.
	 *
	 * @param {Object} client  the discordjs client.
	 * @param {Array} modules  array of all enabled modules.
	 */
	constructor( client, modules ) {
		super( client );
		this.client  = client;
		this.modules = modules;
	}

	/**
	 * OnMessage function.
	 *
	 * @param  {Object} message        The message object received from discord.
	 * @param  {String} messageCommand The command sent by someone.
	 * @param  {Array} args            The arguments sent by someone with the command.
	 * @return {void}                  Do stuff depending on args.
	 */
	onMessage( message, messageCommand, args ) {
		// Handle message if checks don't return false.
		if ( command === messageCommand ) {
			console.log( `mod-help: $CMD ${ messageCommand } ${ args } EXEC BY @${ message.author.username }#${ message.author.discriminator }` );
			this.handleMessage( message, args );
		}
	}

	/**
	 * HandleMessage function.
	 *
	 * @param  {Object} message The message object received from discord.
	 * @param  {Array}  args    Array of args send with the command message.
	 * @return {void}           Do stuff depending on args.
	 */
	handleMessage( message, args ) {
		let requestType = 'undefined';

		// prepare the response.
		let response = {
			color: 0x0787f7,
			title: "__**oRO-Bot Builds:**__",
			fields: [],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		if ( isEmpty( args ) ) {
			response.fields.push( {
				name: '**Kein Stichwort :/**',
				value: `Bitte gib mir ein paar Stichworte.\nBeispiele:\n- \`${ prefix }${ command } Assa\` für Assassinen Builds\n- \`${ prefix }${ command } vit knight\` für Vit-Knight Builds.`
			} );

			// Send the message.
			message.channel.send( { embed: response } );
			return;
		}

		// Just init the query string to return an empty result.
		let query = `SELECT b.id FROM \`${ tables.builds }\` AS b WHERE 1 = 0`;

		// Check if the first arg is a number.
		if ( 1 === args.length && ! isNaN( parseInt( args[0] ) ) ) {
			// User wants a specific build.
			requestType = 'build-search';

			// SELECT * FROM `discord_bot`.`module_builds_builds` AS b
			// WHERE b.id = 1;
			query = `SELECT * FROM \`${ tables.builds }\` AS b
			             WHERE b.id = ${ parseInt( args[0] ) }`;

		} else {
			// User wants a list of builds by tag name(s)
			requestType = 'tag-search';

			// SELECT b.id,b.author,b.title FROM `discord_bot`.`module_builds_builds` AS b
			// LEFT JOIN `discord_bot`.`module_builds_build_tag` AS bt ON bt.buildid = b.id
			// JOIN `discord_bot`.`module_builds_tags` AS t ON t.id = bt.tagid
			// WHERE t.name = 'Assa';
			query = `SELECT b.id,b.author,b.title FROM \`${ tables.builds }\` AS b
			             LEFT JOIN \`${ tables.buildtags }\` AS bt ON bt.buildid = b.id
			             JOIN \`${ tables.tags }\` AS t ON t.id = bt.tagid
			             WHERE t.name = '${ args[0] }'`;

			// Append other args as simple "OR",
			// maybe refactor that later and make it smarter.
			if ( args.length > 1 ) {
				 for ( let i = 1; i < args.length; i++ ) {
					 query += `OR t.name = '${ args[ i ] }'`;
				 }
			 }
		}


		getDbData( query )
			.then( dbResponse => {
				let buildList = ``;

				if ( 'tag-search' === requestType ) {
					forEach( dbResponse, build => {
						buildList += `\`!builds ${ build.id }\` - **${ build.title }**, *von ${ build.author }*\n`
					} );

					response.fields.push(
						{
							name: `**Folgende Builds gefunden:**`,
							value: buildList
						},
						{
							name: `**Hinweis:**`,
							value: `Kopiere den oberen Befehl \`!builds {nummer}\` oder tippe ihn ab um den Build zu sehen.`
						}
					);
				} else if ( 'build-search' === requestType ) {
					const build = dbResponse[0];

					// Add Build-Info.
					response.title       = `__**${ build.title }**__`;
					response.author      = { name: build.author };
					response.description = build.description;

					// Add Stats-Info.
					if ( ! isEmpty( build.stats ) ) {
						response.fields.push( {
							name: '**Statuspunkte**',
							value: build.stats
						} );
					}

					// Add Skills-Info.
					if ( ! isEmpty( build.skills ) ) {
						response.fields.push( {
							name: '**Skillpunkte**',
							value: build.skills
						} );
					}

					// Add Gear-Info.
					if ( ! isEmpty( build.gear ) ) {
						response.fields.push( {
							name: '**Equipment**',
							value: build.gear
						} );
					}
				} else {
					response.fields.push( {
						name: '**ERROR**',
						value: 'if you can read this someone really fucked up...'
					} );
				}

				message.channel.send( { embed: response } );
				return;
			} )
			.catch( error => {
				console.log( 'mod-help: SQL-Error: ', error );
				message.channel.send( 'Database-Error: Datenbank müde, Datenbank schlafen 😴' );
				return;
			} );
	}
}

module.exports = Builds;
