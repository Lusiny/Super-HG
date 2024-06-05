const { Servers, Users } = require("../config/database.js");

const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
    // if (message.author.id == "725525536478068788") message.delete();
    
    if (message.author.bot) return;
    if (!message.guild.members.me.permissions.has(["SEND_MESSAGES", "EMBED_LINKS", "ADD_REACTIONS"])) return;

    let server = await Servers.findOne({ _id: message.guild.id });
    if (!server) {
        let Server = await new Servers({ _id: message.guild.id });
        await Server.save();

        server = Server;
    }

    let user = await Users.findOne({ _id: `${message.author.id}:${message.guild.id}` });
    if (!user) {
        let User = await new Users({
            _id: `${message.author.id}:${message.guild.id}`,
            user_id: message.author.id,
            server_id: message.guild.id
        });
        await User.save();

        user = User;
    }

    if (message.content == "<@1122116698124861510>") {
        if (message.author.id == "176132496390488065") return message.channel.send("\<:pepeshotgun:1083220573708107848>");
        return message.reply({ embeds: [ new EmbedBuilder()
            .setDescription(`O meu prefixo nesse servidor é \`${server.prefix}\` use **${server.prefix}ajuda** para conhecer meus comandos.`)
            .setColor(process.env.INFO)
        ]});
    }

    if (message.content == "perguntei_nada" && message.author.id == "606553920793346150") {
        message.delete();
        message.channel.send("https://cdn.discordapp.com/attachments/547889321554739200/1051933128098328636/Screenshot_20221013_140109.png")
    }

    if (message.content.indexOf(server.prefix) != 0) return;
    if (message.mentions.members.first()) {
        const members = message.mentions.members; 
        await Promise.all(members.map(async member => {
            if (!member.user.bot) {
                let mentions = await Users.findOne({ _id: `${member.user.id}:${message.guild.id}` });
                if (!mentions) {
                    mentions = await new Users({
                        _id: `${member.user.id}:${message.guild.id}`,
                        user_id: member.user.id,
                        server_id: message.guild.id
                    });
                    await mentions.save();
                }
            }
        }));
    }
    
    const args = message.content.slice(server.prefix.length).trim().split(/ +/g), 
          command = args.shift().toLowerCase(),
          comando = client.commands.get(command) || client.aliases.get(command); 

    if (!comando || comando && comando.config.category == "owner" && message.author.id != "606553920793346150") return;
    comando.run(client, message, args);

}