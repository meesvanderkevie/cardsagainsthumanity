const { AkairoClient, CommandHandler } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const winston = require('winston');
const path = require('path');
const DeckManager = require('./DeckManager');

module.exports = class Client extends AkairoClient {
	constructor(options) {
		super(options);

		this.commandHandler = new CommandHandler(this, {
			directory: path.join(__dirname, '..', 'commands'),
			prefix: msg => msg.channel.type === 'text' ? options.prefix : '',
			aliasReplacement: /-/g,
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 60000,
			fetchMembers: true,
			defaultCooldown: 1000,
			defaultPrompt: {
				modifyStart: (text, msg) => stripIndents`
					${msg.author}, ${text}
					Antwoord met \`cancel\` om het commando te anuleren. Dit commando zal automatisch worden geanuleerd in 30 seconden.
				`,
				modifyRetry: (text, msg) => stripIndents`
					${msg.author}, ${text}
					Antwoord met \`cancel\` om het commando te anuleren. Dit commando zal automatisch worden geanuleerd in 30 seconden.
				`,
				timeout: msg => `${msg.author}, commando geanuleerd. Je hebt te lang gewacht.`,
				ended: msg => `${msg.author}, 2 kansen en nog steeds begrijp je het niet, commando geanuleerd.`,
				cancel: msg => `${msg.author}, cancelled command.`,
				retries: 2,
				stopWord: 'finish'
			}
		});
		this.logger = winston.createLogger({
			transports: [new winston.transports.Console()],
			format: winston.format.combine(
				winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
				winston.format.printf(log => `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`)
			)
		});
		this.games = new Map();
		this.decks = new DeckManager();
	}

	setup() {
		this.commandHandler.loadAll();
		this.decks.register(path.join(__dirname, '..', 'assets', 'json', 'decks'));
	}
};
