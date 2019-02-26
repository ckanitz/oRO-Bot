const { prefix } = require( '../config.json' );

module.exports = {
	/**
	 * ValidateMessage function.
	 *
	 * @description Checks if retreived message is a valid command.
	 * @param  {Object} message  The message object retreived from discord.
	 * @return {false|Object}    False if no valid command, command and args if valid.
	 */
	validateMessage: ( message, withPrefix = true ) => {
		// Ignore other bots.
		if ( message.author.bot ) {
			const command = false;
			const args    = false;
			return { command, args };
		};

		// Ignore messages without set prefix.
		if ( withPrefix && message.content.indexOf( prefix ) !== 0 ) {
			const command = false;
			const args    = false;
			return { command, args };
		};

		// Here we separate our "command" name, and our "arguments" for the command.
		// e.g. if we have the message "+say Is this the real life?" , we'll get the following:
		// command = say
		// args = ["Is", "this", "the", "real", "life?"]
		const args    = message.content.slice( prefix.length ).trim().split( / +/g );
		const command = args.shift().toLowerCase();

		return { command, args };
	},
};
