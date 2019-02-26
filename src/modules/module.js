/**
 * oRO-Bot Modules Base Class.
 * This Base Class handles event that all moduley rely on.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { validateMessage } = require( '../lib/helper.js' );

/**
 * Modules Base Class.
 */
class Module {
	/**
	 * Constructor.
	 *
	 * @param {Object} client the discordjs client.
	 */
	constructor( client ) {
		// Listen on "message" event.
		client.on( 'message', async message => {
			// Apply some checks for commands.
			const { command, args } = validateMessage( message );

			if ( false !== command ) {
				this.onMessage( message, command, args );
			}
		} );
	}

	/**
	 * OnMessage function.
	 *
	 * @description should be implemented by all children.
	 * @param  {Object} message        The message object received from discord.
	 * @param  {String} messageCommand The command sent by someone.
	 * @param  {Array} args            The arguments sent by someone with the command.
	 * @return {void}                  Do stuff depending on args.
	 */
	onMessage( message, messageCommand, args ) {
		console.log( 'onMessage() needs to be implemented by modules' );
	}
}

module.exports = Module;
