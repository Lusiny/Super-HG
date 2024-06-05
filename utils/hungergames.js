const { createCanvas, loadImage } = require("canvas");
const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Embed } = require("discord.js");

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Carregar imagens com evento
async function _loadImage(message, players, text) {
    const canvas = createCanvas(500, 180);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./images/Fundo50Blur500x300.png');
    ctx.drawImage(background, 0, 0, 500, 180);

    ctx.font = '20px Arial';
    ctx.fillStyle = "#ffffff";

    let preview = ctx.measureText(text);
    let width = preview.width;

    ctx.fillText(text, 250 - (width / 2), 155);
    await Promise.all(players.map(async (player, i) => {
        const imageURL = message.guild.members.cache.get(player.id).user.displayAvatarURL().replace(".webp", ".jpeg");
        const image = await loadImage(imageURL);

        const xPrincipalCentral = 500 / 2 - (80 * players.length + 20 * (players.length - 1)) / 2 
        const x = xPrincipalCentral + 100 * i
              y = 30;

        ctx.drawImage(image, x, y, 80, 80);
    }));

    const buffer = canvas.toBuffer('image/jpeg');
    const attachment = new AttachmentBuilder(buffer, { 'name': 'image.jpg' });

    return attachment;
}

async function HungerGames(message, districts, players) {
    async function getComponents() {
        const custom_id = `show_next_interaction`;

        const next = new ButtonBuilder();
        next.setCustomId(custom_id);
        next.setLabel('Próximo');
        next.setStyle(ButtonStyle.Success);
    
        const components = new ActionRowBuilder();
        components.addComponents(next);

        return components;
    }

    async function OneWay(message, players) {
        await new Promise(async (resolve, reject) => {
            message.reply({ embeds: [ new EmbedBuilder()
                .setAuthor({ 'name': message.guild.members.me.user.username, 'iconURL': message.guild.members.me.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`A seleção não é **NATURAL**!\n\nOs jogadores serão teletransportados para **biomas aleatoriamente** onde poderão coletar recursos e enfrentar desafios.`)
                .setImage('attachment://Biomas.png')
                .setColor(process.env.INFO)
            ], components: [await getComponents()], files: ['./images/Biomas.png'] })
            .then(msg => {
                const collector = message.channel.createMessageComponentCollector({ filter: (response) => response.user.id === message.author.id, max: 1 });
                collector.on('collect', async interaction => {
                    collector.stop();

                    await interaction.message.edit({ components: [] });

                    for (let i = 0; i < players.length; i++) {
                        await new Promise(async (resolve, reject) => {

                        })
                    }

                    resolve();
                });
            });
        });
    }

    async function Lobby(message, players) {
        /*for (let i = 0; i < players.length; i++) {
            await new Promise(async (resolve, reject) => {
                const player = players[i]
                const biomes = ["Montanha", "Deserto", "Planícies", "Floresta", "Taiga"];
                players[i].biome = biomes.sort(() => Math.random() - 0.5)[0];

                const custom_id = `show_next_interaction`;

                const next = new ButtonBuilder();
                next.setCustomId(custom_id);
                next.setLabel('Próximo');
                next.setStyle(ButtonStyle.Success);
            
                const components = new ActionRowBuilder();
                components.addComponents(next);
        
                const text = `${message.guild.members.cache.get(player.id).user.username} foi para o bioma de ${player.biome}.`;

                message.reply({ embeds: [  new EmbedBuilder() 
                    .setAuthor({ 'name': message.guild.members.me.user.username, 'iconURL': message.guild.members.me.user.displayAvatarURL({ dynamic: true }) })
                    .setImage('attachment://image.jpg')
                    .setColor(process.env.INFO)
                ], components: [components], files: [await _loadImage(message, [player], text)] })
                .then(msg => {
                    const collector = message.channel.createMessageComponentCollector({ filter: (response) => response.user.id === message.author.id, max: 1 });
                    collector.on('collect', async interaction => {
                        collector.stop();
        
                        await interaction.message.edit({ components: [] });
                        resolve();
                    });
                });
            });
        }
        return players;*/
    }

    let ObjectPlayers = [];
    await Promise.all(players.map(player => {
        ObjectPlayers.push({
            id: player,
            district: districts.findIndex(players => players.includes(player)) + 1,
            health: 100,
            biome: "Centro",
            items: [],
            effects: []
        });
    }));

    players = ObjectPlayers;

    const random = players.sort(() => Math.random() - 0.5);
    await OneWay(message, random);
    /*let day = 0, night = false;

    // Enquanto tiver mais que um jogador em pé
    while (players.filter(player => player.health > 0).length > 1) {
        const random = players.sort(() => Math.random() - 0.5);
        if (day == 0) {
            players = await Lobby(message, random);
        } else {
            if (!night) {
                let chance = Math.floor(Math.random() * 101);
            } else {
                night = !night;
            }
        }

        day = day + 1;
    };*/


}

// Função que carrega a imagem dos distritos individualmente
async function loadImagesDistrict(message, district, index) {
    const canvas = createCanvas(500, 300);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./images/Fundo50Blur500x300.png');
    ctx.drawImage(background, 0, 0, 500, 333);

    ctx.font = '25px Arial';
    ctx.fillStyle = "#ffffff";

    let preview = ctx.measureText(`Distrito ${index + 1}`);
    let width = preview.width;

    ctx.fillText(`Distrito ${index + 1}`, 250 - (width / 2), 30);
    await Promise.all(district.map(async (player, i) => {
        const imageURL = message.guild.members.cache.get(player).user.displayAvatarURL().replace(".webp", ".jpeg");
        const image = await loadImage(imageURL);

        const x = 40 * (i + 1) + 180 * i,
              y = 50;

        ctx.drawImage(image, x, y, 180, 180);

        const username = message.guild.members.cache.get(player).user.username;
        ctx.font = '24px Arial';
        ctx.fillStyle = "#ffffff";

        preview = ctx.measureText(username);
        width = preview.width;

        if (width > 180) {
            ctx.font = "20px Arial";
            preview = ctx.measureText(username);
            width = preview.width;
        }

        xCentralizado = (x + x + 180) / 2 - width / 2;
        ctx.fillText(username, xCentralizado, y + 220);
    }));

    const buffer = canvas.toBuffer('image/jpeg');
    const attachment = new AttachmentBuilder(buffer, { 'name': 'image.jpg' });

    return attachment;
}

// Função que carrega os distritos individualmente
async function presentDistricts(message, districts, i) {
    return new Promise(async (resolve, reject) => {
        const custom_id = `show_next_district_${i}`;

        const next = new ButtonBuilder();
        next.setCustomId(custom_id);
        next.setLabel('Próximo Distrito');
        next.setStyle(ButtonStyle.Success);
    
        const components = new ActionRowBuilder();
        components.addComponents(next);

        message.reply({ content: `Membros do Distrito ${i + 1}: <@ ${districts[i][0]}> e <@ ${districts[i][1]}>`, embeds: [  new EmbedBuilder() 
            .setAuthor({ 'name': message.guild.members.me.user.username, 'iconURL': message.guild.members.me.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Os jogadores do \`Distrito ${i + 1}\` são: **${message.guild.members.cache.get(districts[i][0]).user.username}** e **${message.guild.members.cache.get(districts[i][1]).user.username}**`)
            .setImage('attachment://image.jpg')
            .setColor(process.env.INFO)
        ], components: [components], files: [await loadImagesDistrict(message, districts[i], i)] })
        .then(msg => {
            const collector = message.channel.createMessageComponentCollector({ filter: (response) => response.user.id === message.author.id, max: 1 });
            collector.on('collect', async interaction => {
                collector.stop();

                await interaction.message.edit({ components: [] });
                if (i == 11) return resolve();

                await presentDistricts(message, districts, i + 1);
                resolve();
            });
        });
    });
}

// Função que carrega os distritos todos
async function loadDistrictMenu(message, groups) {
    const canvas = createCanvas(925, 875);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./images/Fundo50Blur.png');
    ctx.drawImage(background, 0, 0, 925, 875);

    await groups.reduce(async (previousPromise, group, i) => {
        await previousPromise;

        return group.reduce(async (prev, district, j) => {
            let x = 30 + j * 300,
                y = 45 + (i * 210);

            const title = `Distrito ${j + 1 + i * 3}`;
            ctx.font = '20px Arial';
            ctx.fillStyle = "#ffffff";

            preview = ctx.measureText(title);
            width = preview.width;

            if (width > 300) {
                ctx.font = "16px Arial";
                preview = ctx.measureText(title);
                width = preview.width;
            }

            xCentralizado = (x + x + 274) / 2 - width / 2;
            ctx.fillText(title, xCentralizado, y - 10);

            await prev;
            return district.reduce(async (p, player, k) => {
                await p;

                const x = 30 + (k * 144) + j * 300;
                const y = 45 + (i * 210);

                const imageURL = message.guild.members.cache.get(player).user.displayAvatarURL().replace(".webp", ".jpeg");
                const image = await loadImage(imageURL);
                ctx.drawImage(image, x, y, 130, 130);

                const username = message.guild.members.cache.get(player).user.username;
                ctx.font = '20px Arial';
                ctx.fillStyle = "#ffffff";

                preview = ctx.measureText(username);
                width = preview.width;

                if (width > 130) {
                    ctx.font = "16px Arial";
                    preview = ctx.measureText(username);
                    width = preview.width;
                }

                xCentralizado = (x + x + 130) / 2 - width / 2;
                ctx.fillText(username, xCentralizado, y + 160);
            }, Promise.resolve());
        }, Promise.resolve());
    }, Promise.resolve());

    const buffer = canvas.toBuffer('image/jpeg');
    const attachment = new AttachmentBuilder(buffer, { 'name': 'image.jpg' });

    return attachment; 
}

exports.delay = delay;
exports.presentDistricts = presentDistricts;
exports.loadDistrictMenu = loadDistrictMenu;
exports.HungerGames = HungerGames;