/**
 * oRO-Bot Help module.
 * This module handles the '!help' command
 * and provides a list of available commands
 * depending on which modules are activated.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const { isEmpty, findIndex, forEach } = require('lodash');
const { version } = require('../../../package.json');
const { prefix } = require('../../config.json');
const Module = require('../module.js');
const config = require('./config.json');
const FileHandler = require('./fileHandler.js');
const MONSTERS = require('./monsters.json');

const JOB_CLASSES = [
	'Novice',
	'Swordman', 'Thief', 'Mage', 'Merchant', 'Archer', 'Acolyte',
	'TaekwonKid', 'Ninja', 'Gunslinger', 'Super Novice',
	'Knight', 'Crusader',
	'Assassin', 'Rogue',
	'Wizard', 'Sage',
	'Blacksmith', 'Alchemist',
	'Hunter', 'Bard', 'Dancer',
	'Priest', 'Monk',
	'TaekwonMaster', 'Soullinker',
	'LordKnight', 'Paladin',
	'AssassinCross', 'Stalker',
	'HighWizard', 'Professor',
	'Whitesmith', 'Creator',
	'Sniper', 'Clown', 'Gypsy',
	'HighPriest', 'Champion'
];

/**
 * Monstermission-Module Class
 */
class Monstermission extends Module {
	/**
	 * Constructor.
	 *
	 * @param {Array} modules  array of all enabled modules.
	 */
	constructor(modules) {
		super(modules);
		this.config = config;
		this.modules = modules;
		this.db = new FileHandler();
	}

	onHelp(args, message) {
		const response = {
			color: 0xff6e00,
			title: 'Monster Mission Commandlist:',
			fields: [],
			footer: {
				text: `oRO-Bot v${ version } - MonsterMission version v${config.version}`,
			},
		};

		const fields = [];

		forEach(config.commands, ({description, args}, cmd) => {
			fields.push({
				name: `${cmd} ${args}`,
				value: description,
			});
		});

		fields.push({
			name: 'JobClasses:',
			value: JOB_CLASSES.join(', '),
		});

		response.fields = fields;

		message.channel.send({embed: response});
	}

	/**
	 * Command: `!mmnew`.
	 *
	 * Registers a new char and responds with the first mission.
	 *
	 * @param  {Array}  args    Possible passed arguments: "${jobClass} ${charName}".
	 * @param  {Object} message Discord message object.
	 * @return {void}
	 */
	onCharRegistration(args, message) {
		// We need a valid jobclass and charname.
		if ( 'undefined' === typeof args[0] || JOB_CLASSES.indexOf(args[0]) < 0 || 'undefined' === typeof args[1] || isEmpty( args[1] ) ) {
			message.channel.send('**Invalid arguments!**\nTry: `!mmnew {jobClass} {Charname}`. For example: `!mmnew AssassinCross James Paul mieft`');
			return;
		}

		// Prepare new character object.
		const newChar = {
			id: message.author.id,
			name: message.author.username,
			discriminator: message.author.discriminator,
			charName: this.getCharName(args, 1),
			class: args[0],
			score: 0,
			currentMission: {
				monsterId: 0,
				kills: 0
			}
		}

		const dbResponse = this.db.maybeAddNewChar(newChar, message.guild);

		message.channel.send(dbResponse.message);

		if (!!dbResponse.character) {
			this.sendNewMissionMessage(dbResponse.character, message.channel);
		}
	}

	/**
	 * Command: `!mmkill`.
	 *
	 * Updates the killcount of the current mission of the given character.
	 * Responds with new mission if killcount is >= 100.
	 *
	 * @param  {Array}  args    Possible passed arguments: "${killsAmount} ${$charName}".
	 * @param  {Object} message Discord message object.
	 * @return {void}
	 */
	onUpdateKillCount(args, message) {
		if ('undefined' === typeof args[0] && 'number' === typeof parseInt(args[0]) || 'undefined' === typeof args[1]) {
			message.channel.send('**Invalid arguments!**\nTry: `!mmkill {amount} {Charname}`. For example: `!mmkill 42 James Paul mieft`');
			return;
		}

		const killcount = parseInt(args[0]);

		if (killcount <= 0) {
			message.channel.send('**Invalid kill amount!** Value must be higher than 0');
			return;
		}

		// Get Chardata.
		const charName = this.getCharName(args, 1);
		const character = this.db.readCharacter({ id: message.author.id, charName }, message.guild);
		const newCharacter = {...character};

		if (! character) {
			message.channel.send('**Character not registered**. Join the hunt with `!mmnew {jobClass} {Charname}`. For example: `!mmnew AssassinCross James Paul mieft`')
			return;
		}

		const newKillcount = killcount + character.currentMission.killcount;

		// Check if killcount triggers new mission.
		if (newKillcount < 100) {
			newCharacter.currentMission.killcount = newKillcount;
			message.channel.send(`Good job, Monsterslayer! Still ${100 - newKillcount} more to behead!`);
		} else {
			const newMission = this.db.createMission(character.currentMission.monsterId);
			newCharacter.currentMission = newMission;
			newCharacter.score = newCharacter.score + 1;
			message.channel.send(`Well done! Your current score is: **${newCharacter.score}**`);
			this.sendNewMissionMessage(newCharacter, message.channel);
		}

		// Finally update the char.
		this.db.updateCharacter(newCharacter, message.guild);
	}

	/**
	 * Command: `!mmreroll`.
	 *
	 * Reroll the current mission to receive another monster target.
	 *
	 * @param  {Array}  args    Possible passed arguments: "${charName}".
	 * @param  {Object} message Discord message object.
	 * @return {void}
	 */
	onReRollMission(args, message) {
		if ('undefined' === typeof args[0]) {
			message.channel.send('**Invalid arguments!**\nTry: `!mmreroll {Charname}`. For example: `!mmreroll James Paul mieft`');
			return;
		}

		const charName = this.getCharName(args, 1);
		const character = this.db.readCharacter({ id: message.author.id, charName }, message.guild);
		const newCharacter = {...character};

		if (! character) {
			message.channel.send('**Character not registered**. Join the hunt with `!mmnew {jobClass} {Charname}`. For example: `!mmnew AssassinCross James Paul mieft`')
			return;
		}

		const newMission = this.db.createMission(character.currentMission.monsterId);
		newCharacter.currentMission = newMission;
		this.sendNewMissionMessage(newCharacter, message.channel);
		this.db.updateCharacter(newCharacter, message.guild);
	}

	onShowScore(args, message) {
		if ('undefined' === typeof args[0]) {
			message.channel.send('**Invalid arguments!**\nTry: `!mmscore {Charname}`. For example: `!mmscore James Paul mieft`');
			return;
		}

		const charName = this.getCharName(args, 0);
		const character = this.db.readCharacter({ id: message.author.id, charName }, message.guild);

		if (!character) {
			message.channel.send('**Character not registered**. Join the hunt with `!mmnew {jobClass} {Charname}`. For example: `!mmnew AssassinCross James Paul mieft`');
			return;
		}

		message.channel.send(`Current score of ${charName}: **${character.score}**`);
	}

	/**
	 * Command: `!mmranking`.
	 *
	 * Responds with the current top ten high score.
	 * Either of everyone or specific to the given class.
	 * If `charName` is given the response will be
	 * the current place of the character wether overall or
	 * specific to the given class,
	 * plus the place +/- 1 in the ranking.
	 *
	 * @param  {Array}  args    Possible passed arguments: "${null|all|class} ${null|charName}".
	 * @param  {Object} message Discord message object.
	 * @return {void}
	 */
	onGetRanking(args, message) {
		//message.channel.send('onGetRanking');
		message.channel.send('under construction... :|');
	}

	/**
	 * Send a richtext message to the channel teasing the new mission.
	 * @param  {Object} character Character info.
	 * @param  {Object} channel   Discord channel to send the message to.
	 * @return {void}
	 */
	sendNewMissionMessage(character, channel) {
		const monsterIndex = findIndex( MONSTERS, {id: character.currentMission.monsterId});
		const monster = MONSTERS[ monsterIndex ];
		const response = {
			color: 0x00ff6e,
			title: `Ahoy \`${character.name}\`! Here is your current mission for \`${character.charName}\`. Don't fuck it up.`,
			thumbnail: {
				url: `https://cp.originsro.org/data/images/monsters/${monster.id}.gif`,
			},
			fields: [
				{
					name: 'Monster:',
					value: `${monster.name} (ID:${monster.id})\n` + '`@killcount ' + monster.id + '`',
				},
				{
					name: 'Spawns:',
					value: this.getTopMonsterSpawns(monster.maps),
				},
				{
					name: 'Info:',
					value: `https://cp.originsro.org/monster/view/?id=${monster.id}`,
				}
			],
			footer: {
				text: `oRO-Bot v${ version } - MonsterMission version v${config.version}`,
			},
		};
		console.log(response);
		channel.send({embed: response});
	}

	/**
	 * Build the full charname from args in case in contains spaces.
	 * This only works since the charName is always the last argument.
	 *
	 * @param  {array}  args   The arguments passed by the users message.
	 * @param  {number} offset Index to start building the name.
	 * @return {String}        The fullcharname including spaces.
	 */
	getCharName(args, offset = 0) {
		let name = args[ offset ];

		if (args.length > offset + 1) {
			for (let i = offset + 1; i < args.length; i++) {
				name += ` ${args[i]}`;
			}
		}

		return name;
	}

	/**
	 * Filter spawns by given maps and return the top 3 as list string.
	 *
	 * @param  {array} maps Array of spawn objects.
	 * @return {String}     Top 3 spawns as list string.
	 */
	getTopMonsterSpawns(maps) {
		let response = '---';

		if (maps.length <= 0) {
			return response;
		}

		// Sort the maps by highest spawn amount.
		// @see: https://stackoverflow.com/a/1129270/11096646
		const sortedMaps = maps.sort((a,b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));
		const mapCount = sortedMaps.length < 3 ? sortedMaps.length : 3;

		for (let i = 0; i < mapCount; i++) {
			const { map, amount, respawn } = sortedMaps[ i ];
			const suffix = '';//respawn > 0 ? ` - ${respawn}min` : '';

			if (i > 0) {
				response += '\n';
			}

			response += `- ${map} (${amount}${suffix})`;
		}

		return response;
	}
}

module.exports = Monstermission;
