const moment = require("moment-timezone");
moment.tz.setDefault('America/Sao_Paulo');

const { EmbedBuilder } = require("discord.js");
const { BadUsageEmbed } = require("../utils/badusage.js");

const { Users, Setups } = require("../config/database.js");

module.exports = {
    config: {
        name: 'setup',
        category: 'hungergames',
        description: {
            "pt-br": "Use este comando para criar um setup.",
            "en-us": "Use this command to create a new setup."
        },
        aliases: ['s'],
        usage: ['[create/list/info]', 'create [name] [@user1/id1] [@user2/id2] [...] [@user24/id24]', 'list', 'info [name]'],
        example: ['create lucky_setup @Lucky', 'list', 'info lucky_setup'],
        botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
        userPermissions: []
    },
    run: async function (client, message, args) {
        const badusage = await BadUsageEmbed(message);

        const action = args[0];
        if (!action) return message.reply(badusage);

        if (action.toLowerCase() != "create" && action.toLowerCase() != "list" && action.toLowerCase() != "info") {
            return message.reply(badusage);
        } else {
            if (action.toLowerCase() == "create") {
                const name = args[1];
                if (!name) return message.reply(badusage);

                const search_setup = await Setups.findOne({ _id: `${name}:${message.guild.id}` });
                if (search_setup) return message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`O **nome** selecionado para o **setup** já existe no sistema, escolha outro nome.`)
                    .setColor(process.env.ERROR)
                ]});

                const players = args.slice(2);                
                if (players.length == 0) return message.reply(badusage);
                
                let able_players = [],
                    unable_players = [];
                let repeated_entries = 0;

                for (let player of players) {
                    player = player.replace(/<@(\d+)>/,'$1');

                    if (able_players.includes(player) || unable_players.includes(player)) {
                        repeated_entries = repeated_entries + 1;
                        continue;
                    }

                    const user = message.guild.members.cache.get(player);
                    if (!user) {
                        if (able_players.length == 24) continue;
                        unable_players.push(player);
                    } else {
                        let User = await Users.findOne({ _id: `${player}:${message.guild.id}` });
                        if (!User) {
                            User = await new Users({
                                _id: `${player}:${message.guild.id}`,
                                user_id: player,
                                server_id: message.guild.id
                            });
                            await User.save();
                        }

                        if (able_players.length == 24) continue;
                        able_players.push(player);
                    }
                }

                if (able_players == 0) return message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`Todos as menções ou ids fornecidos são inválidos ou desconhecidos por mim.`)
                    .setColor(process.env.ERROR)
                ]});

                const setup = await new Setups({
                    _id: `${name}:${message.guild.id}`,
                    name: name,
                    server_id: message.guild.id,
                    players: able_players,
                    creation: { creator_id: message.author.id }
                });
                await setup.save();

                message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`Sucesso! O setup de hungergames foi criado com sucesso.`)
                    .setFooter({ 'text': `Estatísticas: Inválidos (${unable_players.length}), Excedentes (${players.length - 24}), Repetidos (${repeated_entries}) e Validados (${able_players.length})` })
                    .setColor(process.env.SUCCESS)
                ]});
            } else if (action.toLowerCase() == "list") {
                const setups = await Setups.find({ server_id: message.guild.id });
                
                message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**Lista de setups**:\n${(setups.length == 0) ? "Ainda não foi criado nenhum setup." : setups.map(setup => `\`${setup.name}\``).join(", ")}`)
                    .setColor(process.env.SUCCESS)
                ]});
            } else {
                const name = args[1];
                if (!name) return message.reply(badusage);

                const setup = await Setups.findOne({ _id: `${name}:${message.guild.id}` });
                if (!setup) return message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`O **nome** do **setup** que está a procurar não corresponde a nenhum setup existente.`)
                    .setColor(process.env.ERROR)
                ]});

                message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .addFields([
                        { name: 'Nome:', value: `${setup.name}`, inline: true },
                        { name: 'Criado por:', value: `<@${setup.creation.creator_id}>`, inline: true },
                        { name: 'Criado em:', value: `${moment(setup.creation.createdAt).format('LL')}`, inline: true },
                        { name: 'Jogadores:', value: `${setup.players.map(player_id => `<@${player_id}>`).join(", ")}`, inline: true }
                    ])
                    .setFooter({ 'text': `Jogadores predefenidos: ${setup.players.length}` })
                    .setColor(process.env.INFO)
                ]});
            }
        }
    }
}