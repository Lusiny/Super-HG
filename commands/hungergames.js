const { yellow } = require("colors");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    config: {
        name: 'hungergames',
        description: {
            "pt-br": "Use este comando para criar um novo hungergames.",
            "en-us": "Use this command to create a new hungergames."
        },
        aliases: ['hg'],
        permissions: [],
        owner: true
    },
    run: async (client, message, args) => {
        const _default = [];
    }
}