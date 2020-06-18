const { prefix } = require('../config.json');
const { assign, map } = require('lodash');

module.exports = {
	/**
	 * ValidateMessage function.
	 *
	 * @description Checks if retreived message is a valid command.
	 * @param  {Object} message  The message object retreived from discord.
	 * @return {false|Object}    False if no valid command, command and args if valid.
	 */
	validateMessage: (message) => {
		let command = false;
		let args = false;

		// Ignore other bots.
		if (message.author.bot) {
			return { command, args };
		};

		// Ignore messages without set prefix.
		if (message.content.indexOf( prefix ) !== 0) {
			return { command, args };
		};

		// Here we separate our "command" name, and our "arguments" for the command.
		// e.g. if we have the message "+say Is this the real life?" , we'll get the following:
		// command = say
		// args = ["Is", "this", "the", "real", "life?"]
		args = message.content.slice( prefix.length ).trim().split( / +/g );
		command = args.shift().toLowerCase();

		return { command, args };
	},

	/**
	 * Shut down with optional message
	 *
	 * @param  {mixed} False if not provided.
	 * @return {void}
	 */
	exit(message = false) {
		if (!!message) {
			console.log(message);
			console.log('Pillow on bot goes psshhhhh (✖╭╮✖)')
		}

		process.exit();
	},

	/**
	 * Create modules and receive commands
	 * Returns array of objects with command as key.
	 *
	 * @param  {Array}  [modules=[]] Array of modulename strings.
	 * @return {Object}              Collection of loaded modules.
	 */
	getCommands(modules = []) {
		let commands = {};

		modules.forEach((moduleName) => {
			const Module = require( `../modules/${ moduleName }/module.js` );
			const moduleObject = new Module(modules);

			assign(commands, moduleObject.getCommands());
		});

		return commands;
	}
};
