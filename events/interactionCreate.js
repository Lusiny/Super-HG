const { red } = require("colors");

module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slash.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        if (error) console.error(`${red('[ERRO]')} Ocorre um erro durante a utilização do comando ${interaction.commandName}: `, error);
        await interaction.reply({ content: 'Calma aê pai tá errado!', ephemeral: true });
    }
}