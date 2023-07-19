const { ApplicationCommandOptionType, Embed } = require("discord.js");

module.exports = {
    data: {
        name: 'fake',
        description: 'Use este comando para enviar uma mensagem falsa de certo usuário.',
        options: [
            {
                name: 'usuário',
                description: 'Insira a menção do usuário.',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'texto',
                description: 'Insira o texto falso.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    },
    execute: async (client, interaction) => {
        await interaction.deferReply({ content: "Criando o perfil falso...", ephemeral: true });

        const user = interaction.options.getUser('usuário');
        const text = interaction.options.getString('texto');
        
        const member = interaction.guild.members.cache.get(user.id);
        webhook = await interaction.channel.createWebhook({
            name: (member.nickname) ?  member.nickname : user.username,
            avatar: user.displayAvatarURL({ dynamic: true }),
            reason: 'Comando /fake'
        })
        await webhook.send(text)
        await webhook.delete();

        interaction.editReply({ content: "A mensagem foi enviada com sucesso.", ephemeral: true })
    }
}