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
const Module        = require( '../module.js' );
const { command }   = require( './builds.json' );

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
		const query = "SELECT * FROM `module_builds_builds`";
		getDbData( query );
		// prepare the response.
		let response = {
			color: 0x0787f7,
			title: "__Folgende Builds gefunden:__",
			fields: [
				{
					name: 'Dual Dagger Sin',
					value: 'Build by Jenks'
				}
			],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		// Send the message.
		message.channel.send( { embed: response } );
	}
}

module.exports = Builds;
