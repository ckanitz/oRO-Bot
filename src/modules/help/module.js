/**
 * oRO-Bot Help module.
 * This module handles the '!help' command
 * and provides a list of available commands
 * depending on which modules are activated.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { forEach } = require('lodash');
const { version } = require('../../../package.json');
const { prefix } = require('../../config.json');
const Module = require('../module.js');
const config = require('./config.json');

/**
 * Help-Module Class
 */
class Help extends Module {
	/**
	 * Constructor.
	 *
	 * @param {Array} modules  array of all enabled modules.
	 */
	constructor(modules) {
		super(modules);
		this.config = config;
		this.modules = modules;
	}

	/**
	 * OnMessage function.
	 *
	 * @param  {Array}  args           The arguments sent by someone with the command.
	 * @param  {Object} message        The message object received from discord.
	 * @return {void}                  Do stuff depending on args.
	 */
	onHelp(args, message) {
		// prepare the response.
		const response = {
			color: 0x00ff6e,
			title: "__**oRO Bot Help**__",
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
				const config = require( `../${ module }/config.json` );

				forEach(config.commands, (info, cmd) => {
					// Append content.
					availableCommands += `**${ prefix }${ cmd } ${ info.args ? info.args : '' }** - ${ info.description }\n`;
				});
			} );

			// Push a new field with available commands.
			response.fields.push( {
				name: 'Available commands',
				value: availableCommands
			} );
		} else {
			// Push a field with a response.
			response.fields.push( {
				name: 'Available commands',
				value: 'no commands available, sorry :('
			} );
		}

		// Send the message.
		message.channel.send({ embed: response });
	}
}

module.exports = Help;
