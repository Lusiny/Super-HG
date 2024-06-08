const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { displayDistrict } = require("../utils/display.js"); 

class HungerGames {
    constructor(message, players) {
        this.message = message;
        this.players = players.sort(() => Math.random() - 0.5); // Os jogadores são movidos de forma aleatória na array

        const self = this;
        this.players = players.map((player, i) => { // E posteriormente são transformados em objetos com mais propriedades
            return {
                id: player,
                get user () {
                    return self.message.guild.members.cache.get(this.id).user;
                },
                get username () {
                    return this.user.username;
                },
                get avatar () { // Usamos um Getter para que ele possa utilizar os items do próprio objeto uma vez que necessário pós carregamento
                    return this.user.displayAvatarURL({ dynamic: true, size: 512 })
                },
                district: Math.ceil((i + 1) / 2), // Define o distrito
                biome: '', // Por definir
                hp: 100, // Eventos podem causar hit kill, ou deixar o jogador à beira da morte.
                items: [], // Array com os items de cada jogador, os items influenciam diretamente os eventos
                armor: [], // Array de objetos com nome dos items, durabilidade e proteção oferecida
                effects: [], // Array de strings com efeitos do jogador
                // group: [], // Formar grupo com jogadores de outros distritos
                sex: 0, // Quantas vezes o jogador fez o dale e tome-le
                kills: 0, // Número de kills do jogador

                ressurected: false // Ativo apenas para a facção dos Deuses
            };
        });

        this.bosses = [
            {
                'Metal e Core': { isAlive: true }, 
                'Dan c\'Ifre': { isAlive: true },
                'Invís': { isAlive: true },
                'Zarch': { isAlive: true },
                'Coloba': { isAlive: true }
            }
        ];

        this.factions = [
            "Favela", // Membros do distrito recebem bônus para roubar outros jogadores
            "Burguesia", // Membros do distrito recebem bônus para patrocinadores
            "Cultista", // Membros do distrito recebem bônus de dano explosivo e chance de pegar bombas
            "Amazonas", // Membros do distrito não morreram escalando árvores e, se em Floresta recebem mais chance de achar items
            "Noias", // Membros do distrito não sofreram para qualquer tipo de envenenamento
            "Assassinos", // Membros do distrito teram buffs massivos de noite, se não tiverem arma suas chances de morreram duplicam
            "Fudidos", // Membros do distrito tomam debuff na coleta de items, dão menos dano e tem mais eventos azarados, mas levam menos dano
            "Sumidos", // Membros do distrito têm chance de fugir de eventos e boss fights,
            "Deuses", // Membros do distrito podem ressuscitar apenas uma vez o companheiro morto,
            "BOTs", // Membros do distrito não podem morrer de fome ou sede, e não sofrem com certos efeitos, entretanto não podem usar os items que pegam
            "Águias", // Membros do distrito de águias tem chance de critar de 100% usando Arco e Flecha
            "Dedadas", // Membros do distrito têm uma chance de 1%, todas as rodadas, de matar todos os jogadores.

            // Futuras facções novas por vir 
        ].sort(() => Math.random() - 0.5);
    }
    
    // Mostrar cada Distrito
    async showEachDistrict() {
        let self = this;

        // Cria uma array com 12 casas, preenche-as e substitui o seu conteúdo de cada casa com uma array de conteúdos entre o intervalo i*2 e i*2 + 2
        const districts = Array(12).fill().map((_, i) => self.players.slice(i*2, i*2 + 2));

        for (var i = 0; i < districts.length; i++) {
            await new Promise(async function (resolve, reject) {
                // Variável para guardar o distrito
                const district = districts[i];
                const [player1, player2] = [district[0], district[1]];

                const builder = new ButtonBuilder();
                builder.setCustomId(`show_district${i + 1}`);
                builder.setLabel('Próximo Distrito');
                builder.setStyle(ButtonStyle.Success);

                const components = new ActionRowBuilder();
                components.addComponents(builder);

                self.message.channel.send({
                    content: `**Distrito ${i + 1}**\n<@${player1.id}> e <@${player2.id}>`, 
                    files: [await displayDistrict(self.factions[i], i + 1, [player1, player2])],
                    components: [components], // NOTA.: Adicionar botão para descobrir o que a facção tem de especial.
                })
                .then(async msg => {
                    const collector = self.message.channel.createMessageComponentCollector({ filter: (response) => response.user.id === self.message.author.id && response.message.id == msg.id, max: 1 });
                    collector.on('collect', async interaction => {
                        await msg.edit({ components: [] });
                        return resolve();
                    });
                });
            });
        } 
    }
}

exports.HungerGames = HungerGames;