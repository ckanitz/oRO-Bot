/**
 * The oRO-Bot.
 *
 * @type {oROBot}
 */

// Import functions, configs etc.
const { token } = require('../config.json');
const { exit, getCommands, validateMessage } = require('./helper');

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
	constructor(client, token, defaultModules = []) {
		// Bail if client is not an object.
		if (typeof client !== 'object' ) {
			exit('invalid Discord Client provided');
		}

		// Bail if no modules are defined to load.
		if (defaultModules.length === 0) {
			exit('no modules defined');
		}

		// The Discord Client object.
		this.client  = client;
		// Hold for refference.
		this.modules = defaultModules;
		// The exposed commands.
		this.commands = getCommands(this.modules);

		this.onClientReady();
		this.onClientMessage();
		this.onClientDisconnect();
		this.handleClientLogin(token);
	}

	/**
	 * HandleClientLogin function.
	 *
	 * @return {void} connects the bot to discord.
	 */
	handleClientLogin() {
		console.log('oRO-Bot: Login to Discord...');
		this.client.login(token);
	}

	/**
	 * OnClientReady function.
	 *
	 * @description Handles events the bot should react to.
	 * @param  {object} client The discord.js object.
	 * @return {void}
	 */
	onClientReady() {
		console.log('oRO-Bot: creating `ready` eventlistener...');

		this.client.on( 'ready', () => {
			console.log('oRO-Bot is up and ready');
		} );
	}

	onClientMessage() {
		// Listen on "message" event.
		this.client.on( 'message', async message => {
			// Apply some checks for commands.
			const { command, args } = validateMessage( message );

			if (!!command && typeof this.commands[command] !== 'undefined' ) {
				const cmd = this.commands[command];
				// Handle message if checks don't return false.
				console.log( `oRO-Bot: $CMD ${command} ${ args } EXEC BY @${ message.author.username }#${ message.author.discriminator }` );
				cmd.obj[cmd.callback](args, message);
			}
		} );
	}

	onClientDisconnect() {
		this.client.on( 'error', (err) => {
			this.handleClientLogin();
		} );
	}
}

module.exports = oROBot;
