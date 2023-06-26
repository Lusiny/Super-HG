require("dotenv").config();

const { Client, GatewayIntentBits, Partials, Collection, PartialGroupDMChannel } = require("discord.js");
const { red, magenta } = require("colors");
const { readdirSync } = require("fs"); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.User,
        Partials.Message,
        Partials.Reaction      
    ]
});

client.commands = new Collection();
client.aliases = new Collection();

client.slash = new Collection();

(async function() {
    console.log(`${magenta('[CARREGANDO]')} Carregando os eventos...`)
    await Promise.all(readdirSync('./events/').map(event => {
        let file = require(`./events/${event}`);
        let name = event.split(".")[0];

        client.on(name, file.bind(null, client));
        console.log(` ${magenta(name)} foi carregado com sucesso!`);
    }));

    console.log(`${magenta('[CARREGANDO]')} Carregando os comandos...`)
    await Promise.all(readdirSync('./commands/').map(async command => {
        let comando = require(`./commands/${command}`);
        let name = command.split(".")[0];

        if (!comando.config || comando.config && comando.config.aliases == undefined) {
            console.log(` ${red(name)} não pode ser carregado!`);
            return;
        }
        console.log(` ${magenta(name)} foi carregado com sucesso!`);

        client.commands.set(name, comando);
        await Promise.all(comando.config.aliases.map(alias => {
            client.aliases.set(alias, comando);
            console.log(`  ${magenta(alias)} foi carregada com sucesso!`);
        }));
    }));

    console.log(`${magenta('[CARREGANDO]')} Carregando os comandos de slash...`);
    await Promise.all(readdirSync('./slash/').map(async command => {
        let comando = require(`./slash/${command}`);
        let name = command.split(".")[0];

        if (!comando.data || comando.data && comando.data.name == undefined) {
            console.log(` ${red(name)} não pode ser carregado!`)
            return;
        }
        console.log(` ${magenta(name)} foi carregado com sucesso!`)

        client.slash.set(name, comando);
    }));
})();

process.on('unhanunhandledRejection', err => {
    console.error(`${red('[ERRO]')} Ocorreu um erro durante a execução do programa:`);
    console.error(err);
});

client.login(process.env.TOKEN)
.catch(err => console.log(`${red('[ERRO]')} Ocorreu um erro ao iniciar:\n`, err));