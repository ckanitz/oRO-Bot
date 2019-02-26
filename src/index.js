/**
 * oRO-Bot
 * A discord-bot for Ragnarök Online guilds
 * playing on <https://originsro.org/>
 *
 * @author Christopher Kanitz
 * @license MIT
 * @type {Discordbot}
 */

// Import functions, configs etc.
const { isEmpty } = require( 'lodash' );
const oROBot  = require( './lib/oRO-Bot.js' )
const { Client }  = require( 'discord.js' );
const { token, modules } = require( './config.json' );

// Check if a token exists.
if ( isEmpty( token ) ) {
	console.log( 'You forgot to provide the Discord server token.' );
	process.exit();
}

// Create the bot instance.
new oROBot( new Client(), token, modules );
