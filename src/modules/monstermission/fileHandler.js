const fs = require('fs');
const path = require('path');
const { findIndex } = require('lodash');
const MONSTERS = require('./monsters.json');

class FileHandler {

	/**
	 * Class constructor.
	 */
	constructor() {
		this.dir = path.dirname(__filename);
	}

	//
	// "Public" functions
	//

	/**
	 * Register a new character if not already registered.
	 *
	 * @param  {Object} character Full set initial data.
	 * @param  {Object} guild     Discord `Guild` object received from message.
	 * @return {Object}           Response with `created` flag, a `message` and `currentMission` info.
	 */
	maybeAddNewChar(character, guild) {
		console.log('getCharFromDb');

		// Init repsone.
		const response = {
			created: false,
			message: 'Error, Sacer fucked up.',
			character: false,
		}

		// Check if a high score for the given guild exists.
		const guildScore = this.readGuildScore(guild);
		const charScoreIndex = this.getCharacterIndex(character, guild, guildScore);
		const charExists = -1 < charScoreIndex;

		if ( charExists ) {
			response.created = false;
			response.message = `Character **${character.charName}** is already registered.`;
			response.character = guildScore[ charScoreIndex ];
		} else {
			// Create a new char.
			const newCharacter = this.createCharacter(character, guild, guildScore);
			response.created = true;
			response.message = `Character **${newCharacter.charName}** successfully registered.`
			response.character = newCharacter;
		}

		return response;
	}

	//
	// Helper functions
	//

	/**
	 * Build the ranking file path.
	 *
	 * @param  {Object} guild Discord guild object.
	 * @return {String}       Full path to the ranking file of the given guild.
	 */
	getGuildScoreFilePath(guild) {
		return `${this.dir}/rankings/${escape(guild.name)}_-_${guild.id}.json`;
	}

	/**
	 * Get the index of a character in the ranking of give guild.
	 * @param  {Object} character                               Character Object.
	 * @param  {Object} guild                                   Discord Guild Object.
	 * @param  {mixed} [guildScore=this.readGuildScore(guild)]  Current guildScore or read from file.
	 * @return {number}                                         The index or -1 if not found.
	 */
	getCharacterIndex(character, guild, guildScore = null) {
		const _guildScore = guildScore || this.readGuildScore(guild);
		return findIndex(_guildScore, { id: character.id, charName: character.charName})
	}

	/**
	 * Returns a monster ID randomly picked from `MONSTERS`.
	 *
	 * @return {number} The monster ID.
	 */
	getRandomMonster() {
		const rand = Math.floor(Math.random() * MONSTERS.length);
		const monster = MONSTERS[rand];

		return monster.id;
	}

	//
	// CREATE functions
	//

	/**
	 * Create a new ranking file.
	 * @param  {String} filePath Full path of the new file.
	 * @return {String}          File contents as string.
	 */
	createGuildScore(filePath) {
		// Prepare initial data.
		const initArgs = [];
		const contents = JSON.stringify(initArgs);

		// Create the file.
		fs.writeFileSync(filePath, contents, 'utf8');

		return contents;
	}

	/**
	 * Register a new character and add the first mission.
	 *
	 * @param  {Object} character  The current character data set.
	 * @param  {Object} guild      Discord guild object.
	 * @param  {array}  guildScore The current guild score.
	 * @return {Object}            The updated character containing the first mission.
	 */
	createCharacter(character, guild, guildScore) {
		console.log('createCharacter');
		// Get the first mission.
		const newCharacter = {...character};
		const firstMission = this.createMission(character.currentMission.monsterId);

		newCharacter.currentMission = firstMission;

		// Add char to current guildScore.
		const newGuildScore = [...guildScore];
		newGuildScore.push(newCharacter);

		// Update the guildScore.
		this.updateGuildScore(guild, newGuildScore);

		return newCharacter;
	}

	/**
	 * Return a new monster mission.
	 * @param  {number} monsterId The monsterID of the character's current mission.
	 * @return {Object}           New mission object.
	 */
	createMission(oldMonsterId) {
		console.log('createMission');
		let newMonsterId = oldMonsterId;

		// The new mission should be a new monster.
		do {
			newMonsterId = this.getRandomMonster()
		} while (newMonsterId === oldMonsterId);

		return {
			monsterId: newMonsterId,
			killcount: 0,
		};
	}

	// End CREATE functions.

	//
	// READ functions
	//

	readGuildScore(guild) {
		console.log('readGuildScore');
		const filePath = this.getGuildScoreFilePath(guild);
		let file = '';

		if ( fs.existsSync(filePath) ) {
			// Get the file.
			file = fs.readFileSync(filePath);
		} else {
			file = this.createGuildScore(filePath);
		}

		const score = JSON.parse(file);

		return score;
	}

	/**
	 * Get the character data of guild's ranking if it exists.
	 * @param  {Object} character Character Object.
	 * @param  {object} guild     Discord guild object.
	 * @return {mixed}            The character data or false.
	 */
	readCharacter(character, guild) {
		console.log('readCharacter');
		const guildScore = this.readGuildScore(guild);
		const charScoreIndex = this.getCharacterIndex(character, guild, guildScore);
		console.log({charScoreIndex});
		return guildScore[ charScoreIndex ] || false;
	}

	// End READ functions.

	//
	// UPDATE functions
	//

	/**
	 * Update the ranking of the given guild.
	 *
	 * @param  {Object} guild Discord guild object.
	 * @param  {Array}  score The new ranking score.
	 * @return {void}
	 */
	updateGuildScore(guild, score) {
		console.log('updateGuildScore');
		const filePath = this.getGuildScoreFilePath(guild);
		const contents = JSON.stringify(score);
		fs.writeFileSync(filePath, contents, 'utf8');
	}

	updateCharacter(character, guild, guildScore = null) {
		const _guildScore = guildScore || this.readGuildScore(guild);
		const newGuildScore = [..._guildScore];
		const charScoreIndex = this.getCharacterIndex(character, guild, guildScore);

		newGuildScore[ charScoreIndex ] = character;

		this.updateGuildScore(guild, newGuildScore);
	}

	//
	// DELETE functions
	//
}

module.exports = FileHandler;
