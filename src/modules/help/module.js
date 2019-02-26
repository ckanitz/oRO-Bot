/**
 * oRO-Bot Help module.
 * This module handles the '!help' command
 * and provides a list of available commands
 * depending on which modules are activated.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { version }         = require( '../../../package.json' );
const { prefix }          = require( '../../config.json' );
const Module              = require( '../module.js' );
const { command }         = require( './help.json' );

/**
 * Help-Module Class
 */
class Help extends Module {
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
		// prepare the response.
		let response = {
			color: 0x00ff6e,
			title: "__oRO Bot Help__",
			fields: [],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		/*
		 * Check if we got any modules
		 * even though this is a module itself
		 * so there most be some, duh...
		 * well, just do things right!
		 */
		if ( this.modules.length ) {
			// Init the availableCommands string.
			let availableCommands = '';

			// Loop through the modules.
			this.modules.forEach( ( module ) => {
				// Get the modules info.
				const moduleHelp = require( `../${ module }/${ module }.json` );

				// Append content.
				availableCommands += `**${ prefix }${ moduleHelp.command }${ moduleHelp.args }** - ${ moduleHelp.description }\n`;
			} );

			// Push a new field with available commands.
			response.fields.push( {
				name: 'Verfügbare Befehle',
				value: availableCommands
			} );
		} else {
			// Push a field with a response.
			response.fields.push( {
				name: 'Verfügbare Befehle',
				value: 'aktuell keine Befehle verfügbar, sorry :('
			} );
		}

		// Send the message.
		message.channel.send( { embed: response } );
	}
}

module.exports = Help;
