const { Types } = require("mongoose");
const { Servers, Users } = require("../config/database.js");

const { Permissions } = require("discord.js");

module.exports = async (client, message) => {
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

    if (!comando || comando && comando.config.owner && message.author.id != "606553920793346150") return;
    comando.run(client, message, args);

}