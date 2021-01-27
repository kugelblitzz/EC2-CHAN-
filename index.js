const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config/config');


bot.on('ready', () =>
{
    console.info(`Logged in as ${bot.user.tag}!`);

    bot.user.setPresence(
    {
        activity: { name: `${config.Status}` }, status: 'Online'
    })
    .then(console.log("Waiting For Messages....")).catch(console.error);
});

bot.on('message', msg =>
{
    
    if(msg.author.bot)
        return;

    
    if(msg.content.startsWith(config.Prefix))
    {
        if(msg.member.roles.cache.some(r => r.name === config.Role))
        {
            rawmsg = msg.content.toLowerCase();
            msgBody = rawmsg.split(config.Prefix)
            msg.channel.send(msgBody)
        }
        else
        {
            msg.channel.send(`To Use This Command, The Role ${config.Role} is Needed.`)
        }
    }

});

bot.login(config.Token);