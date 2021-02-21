/**
 * oRO-Bot Modules Base Class.
 * This Base Class handles event that all moduley rely on.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { assign, forEach } = require('lodash');
const { validateMessage } = require( '../lib/helper.js' );

/**
 * Modules Base Class.
 */
class Module {
	/**
	 * GetCommands function.
	 *
	 * @description should be implemented by all children.
	 * @param  {Object} message        The message object received from discord.
	 * @param  {String} messageCommand The command sent by someone.
	 * @param  {Array} args            The arguments sent by someone with the command.
	 * @return {void}                  Do stuff depending on args.
	 */
	getCommands() {
		const _commands = assign({}, this.config.commands);
		forEach(_commands, (info, cmd) => {
			_commands[cmd].obj = this;
		});
		return _commands;
	}
}

module.exports = Module;
