# oRO-Bot
A simple Discord-Bot to handle information received from [originsro.org](https://originsro.org/) API and other stuff.

# Purpose
Es6bot was designed as a pure ES6 JavaScript replacement for BooBot in the Egee.io Discord server. The scope of Es6bot was later paired down to be a very simple self-hosted Discord bot.

Es6bot's current feature set includes:

* **!help** command - show available commands
* **!build** command - shows available character builds

# Architecture
oRO-Bot is a modular discord bot.

Entrypoint: `/src/index.js`
Modules: `/src/modules/`
Library: `/src/lib/`

# Building
Prerequisits:
- [NodeJS](https://nodejs.org/en/)
- NPM (mostly bundled with NodeJS)
- [Docker](https://www.docker.com/)
- docker-compose

Get Started:
- Copy `docker-compose.yml.example` and save the copy as `docker-compose.yml`
- Adjust the config fields to your needs
- Copy `/src/config.json.example` and save the copy as `config.json`
- Adjust the values to your needs

Run:
- `npm run bot` - shorthand for `npm install && docker-compose up -d && node /src/index.js`

# Changelog
**[0.0.1]**
- Added base architecture
- Added module `help`
- Added module `build` (WIP)

# License
oRO-Bot is licensed under MIT so that the core functionality of the bot remains open source and free for everyone but any code you write (including server and room IDs for example) for your own Discord servers doesn't have to be.
