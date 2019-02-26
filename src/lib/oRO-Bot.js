/**
 * The oRO-Bot.
 *
 * @type {oROBot}
 */

/**
 * oROBot class
 */
class oROBot {
	/**
	 * Constructor
	 *
	 * @param {Object} client  The discordjs client.
	 * @param {String} token   The bots token.
	 * @param {Array}  modules Which modules should be loaded.
	 */
	constructor( client, token, modules ) {
		this.client  = client;
		this.modules = modules;

		this.createModules();
		this.handleEvents();

		client.login( token );
	}

	/**
	 * HandlEvents function.
	 *
	 * @description Handles events the bot should react to.
	 * @param  {[type]} client [description]
	 * @return {[type]}        [description]
	 */
	handleEvents( client ) {
		client.on( 'ready', () => {
			console.log( 'oRO-Bot is up and ready' );
		} );
	}

	/**
	 * CreateModules function.
	 *
	 * @return {void} Creates modules dependig on config.modules.
	 */
	createModules() {
		// Loop through the config.modules array.
		this.modules.forEach( ( moduleName ) => {
			const Mod = require( `../modules/${ moduleName }/module.js` );
			const module = new Mod( this.client, this.modules );
		} );
	}
}

module.exports = oROBot;
