/**
 * oRO-Bot Mvptimer module.
 * This module handles the '!mvptimer' command
 * and provides a list of available commands
 * depending on which modules are activated.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { forEach } = require('lodash');
const { add, format, parseISO, toDate } = require('date-fns');
const { version } = require('../../../package.json');
const { prefix } = require('../../config.json');
const Module = require('../module.js');
const config = require('./config.json');

const MVP_SPAWNTIMES_IN_MIN = {
	bio3: {
		fixed: 100,
		flexible: [5,5,5,5,5,5],
	},
};

/**
 * Mvptimer-Module Class
 */
class Mvptimer extends Module {
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
	onMvptimer(args, message) {
		// prepare the response.
		const response = {
			color: 0x00ff6e,
			title: "__**Next MVP Spawn:**__",
			fields: [],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		// Get the spawninfo of the MVP.
		let killtime = null;
		let spawninfo = null;

		if ( 'undefined' !== typeof args[0] && 'undefined' !== typeof MVP_SPAWNTIMES_IN_MIN[args[0]] ) {
			spawninfo = MVP_SPAWNTIMES_IN_MIN[args[0]];
		} else {
			this.sendError( message, [
				{
					name: 'unknown MVP',
					value: 'The MVP you try to track is unknown.',
				},
				{
					name: 'known MVPs:',
					value: 'bio3',
				}
			]);
			return;
		}



		// Get the min spawntime.
		const today = toDate(new Date());
		let killDate = null;

		if ( 'undefined' !== args[1] ) {
			killtime = args[1];
			killDate = parseISO(`${format(today, 'yyyy-MM-dd')}T${killtime}`);
		}

		if ( null === killtime || killDate.getTime() !== killDate.getTime() ) {
			this.sendError( message, [
				{
					name: 'no valid killtime provided',
					value: 'please provide the killtime in format HH:mm:ss (eg. 13:33:37)'
				}
			]);
			return;
		}

		// Push fields with a responsetext.
		response.fields.push( {
			name: 'Killtime',
			value: killtime,
		} );

		const minspawnDate = add(killDate, {minutes: spawninfo.fixed});

		response.fields.push( {
			name: 'Minimum Spawntime',
			value: format(minspawnDate, 'HH:mm:ss'),
		} );

		let spawnResponseValue = '';
		let tmpDate = minspawnDate;
		for ( let i = 0; i < spawninfo.flexible.length; i++ ) {
			tmpDate = add( tmpDate, { minutes: spawninfo.flexible[i] } );
			spawnResponseValue += format(
				tmpDate,
				'HH:mm:ss'
			);

			if ( i < spawninfo.flexible.length - 1) {
				spawnResponseValue += '\n';
			}
		}

		response.fields.push( {
			name: 'Flexible Spawntime',
			value: spawnResponseValue,
		} );

		// Send the message.
		// Testrole
		message.channel
			.send(`${format(minspawnDate, 'HH:mm:ss')} <@&795564364362940426>`)
			.then( msg => msg
							.react('👍')
							.then( () => msg.react('🤌') ) // :pinched_fingers:
							.then( () => msg.react('👎') )
			);

		// test
		// <@&797791785048604692>

		// thonk aktive mvpler
		// message.send(`MINSPAWN <@&795564364362940426>`);
		message.channel.send({ embed: response });
	}

	sendError( message, fields ) {
		// prepare the response.
		const response = {
			color: 0xff006e,
			title: "__**ERROR**__",
			fields,
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};
		message.channel.send({ embed: response });
	}
}

module.exports = Mvptimer;
