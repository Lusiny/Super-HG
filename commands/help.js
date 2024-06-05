const { EmbedBuilder } = require("discord.js");
const { BadUsageEmbed } = require("../utils/badusage.js");

const { Servers, Setups } = require("../config/database.js");

module.exports = {
    config: {
        name: 'help',
        category: 'info',
        description: {
            "pt-br": "Use este comando para descobrir o uso dos comandos.",
            "en-us": "Use this command to discover the usage of commands."
        },
        aliases: ['ajuda', 'h'],
        usage: ['<command>'],
        example: ['', 'hungergames'],
        botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
        userPermissions: []
    },
    run: async function (client, message, args) {
        let command = args[0];
        const server = await Servers.findOne({ _id: message.guild.id });

        const hungergames = client.commands.filter(command => command.config.category == "hungergames"),
              info = client.commands.filter(command => command.config.category == "info");

        if (!command) return message.reply({ embeds: [ new EmbedBuilder()
            .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
            .addFields([
                { name: 'HungerGames:', value: `${(hungergames.size == 0) ? `\`Sem comandos nesta categoria\`` : `${hungergames.map(command => `\`${server.prefix}${command.config.name}\``).join(" ")}`}`, inline: true },
                { name: 'Informação:', value: `${(info.size == 0) ? `\`Sem comandos nesta categoria\`` : `${info.map(command => `\`${server.prefix}${command.config.name}\``).join(" ")}`}`, inline: true }
            ])
            .setFooter({ 'text': `Dica. Use ${server.prefix}ajuda <comando>.` })
            .setColor(process.env.SUCCESS)
        ]});
        command = command.toLowerCase();

        const comando = client.commands.get(command) || client.aliases.get(command);
        if (!comando || comando && comando.config.category == 'owner' && message.author.id != "606553920793346150") return message.reply({ embeds: [ new EmbedBuilder()
            .setTitle("COMANDO NÃO ENCONTRADO")
            .setDescription(`O comando ${command} não foi encontrado na minha lista de comandos.`)
            .setColor(process.env.ERROR)
        ]});

        let category = "Hungergames";
        if (comando.config.category == "info") {
            category = "Informação";
        }

        message.reply({ embeds: [ new EmbedBuilder()
            .setAuthor({ 'name': client.user.username, 'iconURL': client.user.displayAvatarURL({ dynamic: true }) })
            .addFields([
                { name: 'Comando:', value: `\`\`\`ini\n[ ${server.prefix}${comando.config.name} ]\`\`\``, inline: true },
                { name: 'Descrição:', value: `\`\`\`fix\n${comando.config.description[server.language]}\`\`\``, inline: true },
                { name: 'Category:', value: `\`\`\`ini\n[ ${category} ]\`\`\``, inline: true },
                { name: 'Aliases:', value: `\`\`\`fix\n${comando.config.aliases.map(alias => `${server.prefix}${alias}`).join("\n") || "Sem aliases"}\`\`\``, inline: true },
                { name: 'Utilização:', value: `\`\`\`fix\n${comando.config.usage.map(usage => `${server.prefix}${comando.config.name} ${usage}`).join("\n") || `${server.prefix}${comando.config.name}`}\`\`\``, inline: true },
                { name: 'Exemplo:', value: `\`\`\`fix\n${comando.config.example.map(example => `${server.prefix}${comando.config.name} ${example}`).join("\n") || `${server.prefix}${comando.config.name}`}\`\`\``, inline: true },
                { name: 'Permissões do BOT:', value: `\`\`\`ini\n[ ${(comando.config.botPermissions.length == 0) ? "Nenhuma permissão necessária" : comando.config.botPermissions.join(", ")} ]\`\`\``, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: 'Permissões do Usuário:', value: `\`\`\`ini\n[ ${(comando.config.userPermissions.length == 0) ? "Nenhuma permissão necessária" : comando.config.userPermissions.join(", ")} ]\`\`\``, inline: true }
            ])
            .setThumbnail('https://cdn.discordapp.com/attachments/822857448708374568/1128030292003782758/cejm-cavalcade.gif')
            .setFooter({ 'text': "Guia de argumentos: <opcional> [obrigatório]" })
            .setColor(process.env.INFO)
        ]});
    }
}