require("../config/database.js");

const { REST, Routes } = require("discord.js");
const { cyan, green, red, magenta } = require("colors");

module.exports = async (client) => {
    const CLIENT_ID = client.user.id;
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    (async function () {
        console.log(`${magenta('[CARREGANDO]')} Carregando os comandos de slash para os servidores...`)
        try {
            await rest.put(
                Routes.applicationCommands(CLIENT_ID), {
                    body: Array.from(client.slash.values()).map(command => command.data)
                },
            );
            console.log(`${green(" >")} Todos os comandos de slash foram carregados!`)
        } catch (error) {
            if (error) return console.error(`${red(" >")} Não foi possível carregar todos os comandos de slash: `, error);
        }

        console.log(`${cyan('[LIGADO]')} O BOT foi ligado com sucesso.`);
    })();
}

