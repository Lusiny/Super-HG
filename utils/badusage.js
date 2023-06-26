const { Servers } = require("../config/database.js");
const { EmbedBuilder } = require("discord.js");

exports.BadUsageEmbed = async function(message) {
    const server = await Servers.findOne({ _id: message.guild.id });
    const command = message.content.slice(server.prefix.length).trim().split(/ +/g).shift().toLowerCase();

    let badUsage = new EmbedBuilder();
    badUsage.setAuthor({ 'name': message.guild.members.me.user.username, 'iconURL': message.guild.members.me.user.displayAvatarURL({ dynamic: true }) });
    badUsage.setDescription(`O comando está a ser utilizado de forma incorreta! Use \`${server.prefix}ajuda ${command}\` para verificar como utilizar o comando.`);
    badUsage.setColor(process.env.ERROR);

    return { embeds: [badUsage] };;
}