/**
 * oRO-Bot
 * A discord-bot for Ragnarök Online guilds
 * playing on <https://originsro.org/>
 *
 * @author Christopher Kanitz
 * @license MIT
 * @type {Discordbot}
 */

/**
 * External dependencies
 */
const { isEmpty } = require( 'lodash' );

/**
 * Internal dependencies
 */
const oROBot  = require( './lib/oRO-Bot.js' )
const { Client }  = require( 'discord.js' );
const { token, modules } = require( './config.json' );

/**
 * List of modules via CLI args
 *
 * @type {Array}
 */
const modulesOverride = [];

// Check if a token exists.
if ( isEmpty( token ) ) {
	console.log( 'You forgot to provide the Discord server token.' );
	process.exit();
}

// Check args if specific modules should be load.
process.argv.forEach(function (val, index, array) {
	if ( val.indexOf( '--' ) === 0 ) {
		const module = val.substring(2, val.length);
		modulesOverride.push(module);
	}
});

// Create the bot instance.
new oROBot( new Client(), token, modulesOverride.length ? modulesOverride : modules );
