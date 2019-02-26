# Module architecture
The file structure of a module should look like the following:

```
/modules/{modulename}                   // the basefolder should be named like the module itself.
/modules/{modulename}/module.js         // the classfile for the module should be named 'module.js'.
/modules/{modulename}/{modulename}.json // the infofile should be named like the module itself.
```

## Module example

**modules.js**

```JS
const { version } = require( '../../../package.json' ); // get the current bots version
const { prefix }  = require( '../../config.json' );     // the used prefix for commands
const Modules     = require( '../modules.js' );         // Module base class
const { command } = require( './moduleExample.json' );  // the command the module should react to

class ModuleExample extends Modules {

	constructor( client, modules ) {
		super( client );        // always call the super constructor
		this.client  = client;  // save discordjs client as own attribute
		this.modules = modules; // save activated modules as own attribute
	}

	// React to messages.
	onMessage( message, messageCommand, args ) {
		// Check if message contains the modules command.
		if ( command === messageCommand ) {
			this.handleMessage( message, args );
		}
	}

	handleMessage( message, args ) {
		// prepare the response.
		let response = {
			color: 0x00ff6e,
			title: '__oRO Bot Help__',
			fields: [
				{
					name: 'This is a reply field of the ModuleExample module',
					value: 'Fields should be added depending on what the module does.'
				}
			],
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		// Send the message.
		message.channel.send( { embed: response } );
	}
}

module.exports = ModuleExample;
```

## Module infofile example

**moduleExample.json**

```JS
{
	"command": "examplecommand",
	"args": " {keyword} ",
	"description": "Bsp.: **!examplecommand sloth**, shows a sloth-picture."
}
```
