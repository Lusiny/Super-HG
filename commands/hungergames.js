//const { yellow } = require("colors");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ActionRow, Attachment } = require("discord.js");
//const axios = require('axios');

const { Users, Servers, Setups } = require("../config/database.js");
const { BadUsageEmbed } = require("../utils/badusage.js");
const { HungerGames } = require("../utils/hungergames.js");

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
        // Carrega a embed de uso errado docomando
        const badusage = await BadUsageEmbed(message);

        // Capta o primeiro argumento
        let option = args[0];
        if (!option || option && option.toLowerCase() != "create") return message.reply(badusage);

        option = option.toLowerCase();
        if (option == "create") {
            // Caminho para criar um novo HG, capta o segundo argumento 
            let type = args[1];
            if (!type || type && type.toLowerCase() != "setup" && type.toLowerCase() != "normal") return message.reply(badusage);

            let players = [];
            type = type.toLowerCase();

            // Usa um setup de jogadores pre-definidos
            if (type == "setup") {
                let name = args[2];
                if (!name) return message.reply(badusage);

                // Procura por um setup com X nome daquele servidor
                const setup = await Setups.findOne({ _id: `${name}:${message.guild.id}` });
                if (!setup) return message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`O **nome** do **setup** que está a procurar não corresponde a nenhum setup existente.`)
                    .setColor(process.env.ERROR)
                ]});

                // Existindo o setup guarda os jogadores na variávle players
                players = setup.players.filter(player => message.guild.members.cache.get(player));
            } else {
                // Remove os dois argumentos anteriores
                args = args.slice(2);
                for (let arg of args) {
                    // Para cada argumento restante se for menção removemos os extras ficando apenas o ID
                    player = arg.replace(/<@(\d+)>/,'$1');

                    // Se tiver mais de 24 jogadores cancela
                    if (players.length == 24) break;

                    const user = message.guild.members.cache.get(player);
                    if (user) {
                        // Existindo o utilizador no servidor, verificamos se já está na base de dados
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

                    // Se o jogador não estiver na lista é adicionado
                    if (!players.includes(player)) players.push(player);
                }
            }

            // Caso faltem jogadores para completar os 24
            if (players.length < 24) {
                message.reply({ embeds: [ new EmbedBuilder()
                    .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`O número de pessoas válidas para jogar o Super HG não é válido, serão adicionadas novas pessoas.`)
                    .setFooter({ 'text': 'Nota: Serão adicionados pessoas repetidas, na falta de usuários.' })
                    .setColor(process.env.LOADING)
                ]});

                // Dá fetch a todos os membros do servidor que não sejam bots
                let members = await message.guild.members.fetch();
                members = members.filter(member => !member.user.bot);

                // Criamos uma variável para no caso de não ter membros suficientes no servidor os jogadores possam ser repetidos.
                let repeat = false;
                if (members.size < 24) repeat = true;

                for (let i = 0; players.length + 1 <= 24; i++) {
                    // Escolhe um membro de forma aleatória
                    member = members.random();

                    // Caso o servidor tenha mais de 24 membros não vai aceitar membros repetidos e vai procurar por outro
                    if (!repeat) {
                        while (players.includes(member.user.id)) {
                            member = members.random();
                        }
                    }
                    
                    const user = message.guild.members.cache.get(member.user.id);
                    if (user) {
                        // Novamente verificamos se já está inserido na base de dados, caso não esteja é inserido

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
            
            // Botão de Start
            const start = new ButtonBuilder()
            start.setCustomId('start_button');
            start.setLabel('Que começem os jogos!');
            start.setStyle(ButtonStyle.Success);

            // Adicionamos o Botão ao ActionRow
            const components = new ActionRowBuilder();
            components.addComponents(start);

            // Mensagem para começar o HG
            message.channel.send({
                content: '**Que comecem os jogos!**\nEstá começando mais uma edição do Super HG.',
                files: ['images/Fundo.png'],
                components: [components] })
            .then(async msg => {
                const collector = msg.createMessageComponentCollector({ filter: (response) => response.user.id == message.author.id && response.message.id == msg.id, max: 1 });

                // Quando quem usou o comando interagir com o botão
                collector.on('collect', async interaction => {
                    await msg.edit({ components:[] }); // Remove a botão
                    
                    const HG = await new HungerGames(message, players);
                    HG.showEachDistrict();
                });
            });
        }
    }
}