const { yellow } = require("colors");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: 'hungergames',
        category: 'owner',
        description: {
            "pt-br": "Use este comando para criar um novo hungergames.",
            "en-us": "Use this command to create a new hungergames."
        },
        aliases: ['hg'],
        usage: ['<create>'],
        example: ['@Lusiny 176132496390488065', 'lucky_setup'],
        botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    },
    run: async function (client, message, args) {
        const _default = 1;
    }
}