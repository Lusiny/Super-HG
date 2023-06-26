const { yellow } = require("colors");
const { readdirSync } = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: 'reload',
        description: {
            "pt-br": "Use este comando para recarregar todos os comandos.",
            "en-us": "Use this command to reload all the comands."
        },
        aliases: ['rr'],
        permissions: [],
        owner: true
    },
    run: async (client, message, args) => {
        let command = args[0];
        if (command) {
            command = command.toLowerCase();
            const getComando = client.commands.get(command) || client.aliases.get(command);
            if (!getComando) return message.reply({ embeds: [ new EmbedBuilder()
                .setTitle("COMANDO NÃO ENCONTRADO")
                .setDescription(`O comando \`${command}\` não foi encontrado na minha lista de comandos.`)
                .setColor(process.env.ERROR)
            ]});

            await new Promise(async (resolve, reject) => {
                delete require.cache[require.resolve(`../commands/${getComando.config.name}.js`)]
                const comando = require(`../commands/${getComando.config.name}.js`);
                
                client.commands.set(getComando.config.name, comando);
                getComando.config.aliases.forEach(alias => client.aliases.set(alias, comando));
                resolve();
            });

            message.reply({ embeds: [ new EmbedBuilder()
                .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Sucesso! O comando \`${command.toLowerCase()}\` foi reiniciado com sucesso.`)
                .setColor(process.env.SUCCESS)
            ]});
        } else {
            message.reply({ embeds: [ new EmbedBuilder()
                .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Iniciando o processo de reinício dos comandos.`)
                .setColor(process.env.LOADING)
            ]})
            .then(async Message => {
                await new Promise(async (resolve, reject) => {
                    const comandos = readdirSync('./commands');
                    for (file of comandos) {
                        delete require.cache[require.resolve(`../commands/${file}`)]
                        const comando = require(`../commands/${file}`);
                        if (!comando.config) {
                            console.warn(`${yellow('[AVISO]')} O BOT não encontrou a configuração do ficheiro ${file}.`);
                            continue;
                        }
                        if (!comando.config.name) {
                            console.warn(`${yellow('[AVISO]')} O BOT não encontrou o nome do comando do ficheiro ${file}.`);
                            continue;
                        }
                        client.commands.set(comando.config.name, comando);
                    
                        if (!comando.config.aliases) {
                            console.warn(`${yellow('[AVISO]')} O BOT não encontrou as aliases do comando do ficheiro ${file}.`);
                            continue;
                        }
                        comando.config.aliases.forEach(alias => client.aliases.set(alias, comando));
                    }
                    resolve();
                });

                Message.edit({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true })})
                    .setDescription(`Sucesso! Os comandos foram reiniciados com sucesso.`)
                    .setColor(process.env.SUCCESS)
                ]});
            });
        }    
    }
}