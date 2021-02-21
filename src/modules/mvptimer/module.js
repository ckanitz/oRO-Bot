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
const { add, differenceInMilliseconds, format, parseISO, sub, toDate } = require('date-fns');
const { version } = require('../../../package.json');
const { prefix } = require('../../config.json');
const Module = require('../module.js');
const config = require('./config.json');
const bossInfo = require('./boss-info.json');
const intruderMapInfo = require('./intruder-maps.json');

const MVP_SPAWNTIMES_IN_MIN = bossInfo.mvps;
const MINI_BOSS_SPAWNTIMES_IN_MIN = bossInfo.miniBosses;
const TEST_PING_ROLE = '<@&797791785048604692>'; // Test
const INTRUDER_ROLE = 'INTRUDERALERT';
const INTRUDER_MAPS = intruderMapInfo.maps;

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
		// Get the spawninfo of the MVP.
		let killtime = null;
		let spawninfo = null;
		let reminder = null;

		const isMvp = 'undefined' !== typeof MVP_SPAWNTIMES_IN_MIN[args[0].toLowerCase()];
		const isMiniBoss = 'undefined' !== typeof MINI_BOSS_SPAWNTIMES_IN_MIN[args[0].toLowerCase()]


		if ( 'undefined' !== typeof args[0] ) {
			if ( 'list' === args[0] ) {
				// prepare the response.
				const response = {
					color: 0x006eff,
					title: `__**MVP/Mini Boss List:**__`,
					fields: [
						{
							name: 'Known MVPs:',
							value: this.getAllMonsters(MVP_SPAWNTIMES_IN_MIN),
						},
						{
							name: 'Known Mini Bosses:',
							value: this.getAllMonsters(MINI_BOSS_SPAWNTIMES_IN_MIN),
						},
					],
					footer: {
						text: `oRO-Bot v${ version }`
					}
				};
				message.channel.send({embed: response});
				return;
			}

			if ( isMvp ) {
				spawninfo = MVP_SPAWNTIMES_IN_MIN[args[0]];
			} else {
				spawninfo = MINI_BOSS_SPAWNTIMES_IN_MIN[args[0]];
			}
		} else {
			let allMvpNames = this.getAllMonsters(MVP_SPAWNTIMES_IN_MIN);
			let allMiniBossNames = this.getAllMonsters(MINI_BOSS_SPAWNTIMES_IN_MIN);

			this.sendError( message, [
				{
					name: 'unknown MVP/Miniboss',
					value: 'The MVP you try to track is unknown.',
				},
				{
					name: 'known MVPs:',
					value: allMvpNames,
				},{
					name: 'known Mini Bosses:',
					value: allMiniBossNames,
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

		// get reminder
		if ( 'undefined' !== typeof args[2] ) {
			reminder = args[2];
		}

		// prepare the response.
		const response = {
			color: 0x00ff6e,
			title: `__**Next ${spawninfo.name} Spawn:**__`,
			fields: [],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		// Push fields with a responsetext.
		response.fields.push( {
			name: 'Killtime',
			value: killtime,
		} );

		const minspawnDate = add(killDate, {minutes: spawninfo.fixed});
		const spawntimes = { minspawnDate, maxspawnDate: '' };

		response.fields.push( {
			name: 'Minimum Spawntime',
			value: format(minspawnDate, 'HH:mm:ss'),
		} );

		if ( spawninfo.flexible.length > 0 ) {
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

			spawntimes.maxspawnDate = tmpDate;
		}

		// Send the message.
		if ( ( reminder === 'ping' || reminder === 'channel' ) && typeof spawninfo.ping !== 'undefined' ) {
			message.channel
				.send(`${format(minspawnDate, 'HH:mm:ss')} ${spawninfo.ping}`)
				.then( msg => msg
								.react('👍')
								.then( () => msg.react('🤏') ) // :pinched_hand:
								.then( () => msg.react('👎') )
				);
		}
		message.channel.send({ embed: response });

		// Check for reminder arg.
		if ( null !== reminder ) {
			const delay = differenceInMilliseconds( sub( minspawnDate, { minutes: 5 } ), new Date() );

			switch ( args[2] ) {
				case 'pm':
					setTimeout(() => {
						const reminderResponse = this.getChannelReminderMessage( message, spawninfo, spawntimes );
						message.author.send({ embed: reminderResponse });
					}, delay);
					break;
				case 'channel':
					setTimeout(() => {
						const reminderResponse = this.getChannelReminderMessage( message, spawninfo, spawntimes );
						message.channel.send('TBD')
						message.channel.send({ embed: reminderResponse });
					}, delay);
					break;
				default:
					return;
			}
		}
	}

	onIntruderAlert(args, message) {
		const hasMapInfo = typeof args[0] !== 'undefined' && typeof INTRUDER_MAPS[args[0]] !== 'undefined';

		if (hasMapInfo) {
			// message.channel.send(`${INTRUDER_ROLE} ! X players on map(s) ____`);
			const timerCommand = args[1] || false;

			if (timerCommand === 'start') {
				message.channel.send('start big brother');
			} else if (timerCommand === 'stop') {
				message.channel.send('stop big brother');
			} else {
				message.channel.send('unknown command');
			}
		} else {
			message.channel.send('unknown dungeon');
		}
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

	getChannelReminderMessage( message, spawninfo, spawntimes ) {
		const minspawntime = format( spawntimes.minspawnDate, 'HH:mm:ss' );
		const maxspawntime = format( spawntimes.maxspawnDate, 'HH:mm:ss' );
		// prepare the response.
		const response = {
			color: 0x00ff6e,
			title: `__**MVP/Boss-Reminder: ${spawninfo.name}**__`,
			fields: [
				{
					name: 'Next Spawn in **5** Minutes!',
					value: `${spawninfo.name} at ${spawninfo.map}`,
				},
				{
					name: 'Spawntime:',
					value: `${minspawntime} ~ ${maxspawntime}`,
				}
			],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};
		return response;
	}

	getAllMonsters(list) {
		let allBossNames = '';

		let tmpCount = 0;
		forEach( list, (value, key) => {
			allBossNames += `${key} (${value.fixed}m)`;

			if (tmpCount < Object.keys(list).length - 1) {
				allBossNames += ', ';
			}
			tmpCount++;
		});
		return allBossNames;
	}
}

module.exports = Mvptimer;
