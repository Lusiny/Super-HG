const { yellow } = require("colors");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ActionRow } = require("discord.js");
const axios = require('axios');

const { Users, Servers, Setups } = require("../config/database.js");
const { BadUsageEmbed } = require("../utils/badusage.js");
const { loadDistrictMenu, presentDistricts, HungerGames } = require("../utils/hungergames.js");

module.exports = {
    config: {
        name: 'hungergames',
        category: 'hungergames',
        description: {
            "pt-br": "Use este comando para criar um novo hungergames.",
            "en-us": "Use this command to create a new hungergames."
        },
        aliases: ['hg'],
        usage: ['[create] [setup/normal] [@user1/id1] [...] [@user24/id24]'],
        example: ['create setup lucky_setup', 'create normal @Lusiny 1002726785630343290 221303369652895746 176132496390488065'],
        botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
        userPermissions: []
    },
    run: async function (client, message, args) {
        const badusage = await BadUsageEmbed(message);

        let option = args[0];
        if (!option || option && option.toLowerCase() != "create") return message.reply(badusage);

        option = option.toLowerCase();
        if (option == "create") {
            let type = args[1];
            if (!type || type && type.toLowerCase() != "setup" && type.toLowerCase() != "normal") return message.reply(badusage);

            let players = [];
            type = type.toLowerCase();

            if (type == "setup") {
                let name = args[2];
                if (!name) return message.reply(badusage);

                const setup = await Setups.findOne({ _id: `${name}:${message.guild.id}` });
                if (!setup) return message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`O **nome** do **setup** que está a procurar não corresponde a nenhum setup existente.`)
                    .setColor(process.env.ERROR)
                ]});

                players = setup.players.filter(player => message.guild.members.cache.get(player));
            } else {
                args = args.slice(2);
                for (let arg of args) {
                    player = arg.replace(/<@(\d+)>/,'$1');

                    if (players.length == 24) break;
                    const user = message.guild.members.cache.get(player);
                    if (user) {
                        let User = await Users.findOne({ _id: `${player}:${message.guild.id}` });
                        if (!User) {
                            User = await new Users({
                                _id: `${player}:${message.guild.id}`,
                                user_id: player,
                                server_id: message.guild.id
                            });
                            await User.save();
                        }
                    }

                    if (!players.includes(player)) players.push(player);
                }
            }

            if (players.length < 24 && players.length != 0) {
                message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`O número de pessoas válidas para jogar o Super HG não é válido, serão adicionadas novas pessoas.`)
                    .setFooter({ 'text': 'Nota: Serão adicionados pessoas repetidas, na falta de usuários.' })
                    .setColor(process.env.LOADING)
                ]});

                let members = await message.guild.members.fetch();
                members = members.filter(member => !member.user.bot);

                let repeat = false;
                if (members.size < 24) repeat = true;

                for (let i = 0; players.length + 1 <= 24; i++) {
                    member = members.random();
                    if (!repeat) {
                        while (players.includes(member.user.id)) {
                            member = members.random();
                        }
                    }
                    
                    const user = message.guild.members.cache.get(member.user.id);
                    if (user) {
                        let User = await Users.findOne({ _id: `${member.user.id}:${message.guild.id}` });
                        if (!User) {
                            User = await new Users({
                                _id: `${member.user.id}:${message.guild.id}`,
                                user_id: member.user.id,
                                server_id: message.guild.id
                            });
                            await User.save();
                        }

                        players.push(member.user.id);
                    }
                }
            }

            players = players.sort(() => Math.random() - 0.5);
            
            const districts = Array(Math.ceil(players.length / 2)).fill().map((_, i) => players.slice(i * 2, i * 2 + 2));
            const groups = Array(Math.ceil(districts.length / 3)).fill().map((_, i) => districts.slice(i * 3, i * 3 + 3));            

            let start = new ButtonBuilder();
			start.setCustomId('main_menu');
			start.setLabel('Começar');
			start.setStyle(ButtonStyle.Primary);

            let components = new ActionRowBuilder();
			components.addComponents(start);

            message.reply({ embeds: [ new EmbedBuilder()
                .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**Que comecem os jogos!**\nEstá começando mais uma edição do Super HG.`)
                .setImage('attachment://Fundo.png')
                .setThumbnail('attachment://Vazio.png')
                .setColor(process.env.INFO)
                .setFooter({ 'text': 'Nota: O sistema encontra-se em desenvolvimento, caso encontre um erro reporte.'})
            ], files: ['./images/Fundo.png', './images/Vazio.png'], components: [components] })
            .then(async msg => {
                let collector = msg.createMessageComponentCollector({ filter: (response) => response.user.id == message.author.id, max: 1 });
                collector.on('collect', async interaction => {
                    collector.stop();

                    await interaction.message.edit({ components: [] });
                    await presentDistricts(message, districts, 0)

                    let next = new ButtonBuilder();
                    next.setCustomId('next');
                    next.setLabel('Próximo');
                    next.setStyle(ButtonStyle.Success);

                    let components = new ActionRowBuilder();
                    components.addComponents(next);

                    message.reply({ embeds: [ new EmbedBuilder()
                        .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`**Que comecem os jogos!**\nEstes são os jogadores dessa edição e os seus distritos.`)
                        .setImage('attachment://image.jpg')
                        .setColor(process.env.INFO)
                    ], files: [await loadDistrictMenu(message, groups)], components: [components] })
                    .then(async msg => {
                        let collector = msg.createMessageComponentCollector({ filter: (response) => response.user.id == message.author.id, max: 1 });
                        collector.on('collect', async interaction => {
                        collector.stop();

                         await interaction.message.edit({ components: [] });
                         await HungerGames(message, districts, players);
                        });
                    });
                });
            });
        }
    }
}