var Discord = require('discord.js'); //Necesario para usar API de discord
var bot = new Discord.Client(); //Necesario escucha cliente.

bot.on('message', message => {
    if (message.content === '!ping') {
        message.channel.send("pong");
    }
});

bot.on('ready', () => {

    console.log(`Logged in as ${bot.user.tag}!`);

});

bot.login(process.env.BOT_TOKEN); //Token necesario para identificar el bot.
