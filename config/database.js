const { connect, connection, Schema, model } = require("mongoose");
const { red, cyan } = require("colors");

connect(process.env.DB_LINK, { useUnifiedTopology: true, useNewUrlParser: true });
connection.on('connected', () => console.log(`${cyan('[LIGADO]')} O BOT ligou à base dados com sucesso!`));
connection.on('error', e => console.error(`${red('[ERRO]')} Ocorre um erro ao iniciar à base de dados:\n`, e));

const Config = new Schema({
    _id: { type: String },
    maintenance: { type: Boolean, default: false },
    changelog: { type: Array, default: [] }
});

const Server = new Schema({
    _id: { type: String },
    prefix: { type: String, default: '.' },
    language: { type: String, default: 'pt-br' }
});

const User = new Schema({
    _id: { type: String },
    user_id: { type: String },
    server_id: { type: String }
});

const Configuration = model('Configuration', Config);
exports.Configuration = Configuration;

const Servers = model('Servers', Server);
const Users = model('Users', User);

exports.Servers = Servers;
exports.Users = Users;