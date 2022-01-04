const Discord = require('discord.js');
const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES"] });
const secrets = require(`./secrets.json`);
const ids = require(`./ids.json`);
const prefix = '-';
const prefixMod = '+';
var serverID = '';
const fs = require('fs');
const cron = require('node-cron');
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}
let usedThanksRecently = new Set(); 
let usedQuestionRecently = new Set();

// Live '59 23 * * Sun' - Runs every week at Sunday 11:59 PM EST
// Test '* * * * *' - Runs every minute
cron.schedule('59 23 * * Sun', function() { // Every minute
    bot.commands.get('weeklyCron').execute(bot);
});

bot.once('ready', () => {
    console.log('FretBot is online!');
});
  
bot.on('messageCreate', async msg => {
    
    // If user DMs, do nothing
    if (msg.channel.type == "dm") {
        return;
    } 

    else{ 
        serverID = msg.guild.id;
        
        //Monitors #promotion channel only and creates threads for it
        if(msg.channel.id === ids.promoChannel && !msg.author.bot) {
            bot.commands.get('promo').execute(msg);
        }

        if(msg.channel.id === ids.impersonateChannel && !msg.author.bot) {
            bot.commands.get('impersonate').execute(bot, msg);
        }

        //When message doesnt start with '-', '+' or author is bot
        else if((!msg.content.startsWith(prefix) && !msg.content.startsWith(prefixMod)) || msg.author.bot) {
            return;
        }

        //user commands 
        if(msg.content.startsWith(prefix) && !msg.author.bot) {
            
            //Splices via space (ie "-thanks @robert")
            const withoutPrefix = msg.content.slice(prefix.length);
            const split = withoutPrefix.split(/ +/);
            const command = split[0];
            const args = split.slice(1);

            //Reads commands and does stuff
            switch(command) {

                case 'thank':
                case 'thanks':
                    if(usedThanksRecently.has(msg.author.id)){
                        cooldownReminder("thank", 2, msg);
                    }
                    else {
                        bot.commands.get('thanks').execute(prefix, msg, args)
                        setThanksCooldown(2, msg);
                    }
                    break;
                case 'rankup':
                    bot.commands.get('rankup').execute(msg);
                    break;
                case 'points':
                    bot.commands.get('points').execute(prefix, msg, args);
                    break;
                case 'w':
                    // Will only work when used in weekly
                    if(msg.channel.id === ids.weeklyChannel){
                        bot.commands.get('weekly').execute(bot, prefix, msg, args);
                    }
                    break;
                case 'q':
                    // Will only work when used in question channel
                    if(msg.channel.id === ids.helpForumChannel){
                        if(usedQuestionRecently.has(msg.author.id)){
                            cooldownReminder("ask a question", 2, msg);
                        }
                        else {
                            bot.commands.get('question').execute(prefix, msg, args);
                            setQuestionCooldown(2, msg);
                        }
                    }
                    break;
                case 'help':
                    bot.commands.get('help').execute(bot, prefix, msg, args);
                    break;
            }
        }
        else if(msg.content.startsWith(prefixMod) && !msg.author.bot) {
            
            if (msg.member.roles.cache.has(ids.DBmanager)){
                //Splices via space (ie "+thanks @robert")
                const withoutPrefix = msg.content.slice(prefixMod.length);
                const split = withoutPrefix.split(/ +/);
                const command = split[0];
                const args = split.slice(1);

                //Reads commands and does stuff
                switch(command) {

                    case 'ping':
                        msg.channel.send(`${ids.botName} is online`);
                        break;
                    case 'points':
                        bot.commands.get('pointsMod').execute(prefixMod, msg, args);
                        break;
                    case 'w':
                        bot.commands.get('weeklyMod').execute(bot, prefixMod, msg, args);
                        break;
                    case 'help':
                        bot.commands.get('helpMod').execute(prefixMod, msg);
                        break;
                }
            } else {
                msg.channel.send("You are not permitted to use that command");
            }
        }
    }
});

/**
 * sends a message reminding the user of a command's cooldown.
 * @param {String} reminder - the phrase to remind with
 * @param {Number} cd - number of minutes to cooldown for
 * @param {Message} msg - original message sent to the channel
 */
function cooldownReminder(reminder, cd, msg){
    msg.channel.send(`**${msg.author.username}**` + `, you can only ` + reminder + ` once every ${cd} minutes.`)
    .then(sentMsg => {
        setTimeout(() => sentMsg.delete(), 5000)
    }).catch();
}

/**
 * sets the cooldown of a -thanks command for a certain user
 * @param {Number} cd - number of minutes to cooldown for
 * @param {Message} msg - original message sent to the channel
 */
function setThanksCooldown(cd, msg) {
    
    usedThanksRecently.add(msg.author.id);
    setTimeout(() => {
        usedThanksRecently.delete(msg.author.id);
    }, (Math.floor((60000)*cd))); //1min * cd
}

/**
 * sets the cooldown of a -q command for a certain user
 * @param {Number} cd - number of minutes to cooldown for
 * @param {Message} msg - original message sent to the channel
 */
function setQuestionCooldown(cd, msg) {
    
    usedQuestionRecently.add(msg.author.id);
    setTimeout(() => {
        usedQuestionRecently.delete(msg.author.id);
    }, (Math.floor((60000)*cd))); //1min * cd
}
//keep this at the last line of the file
bot.login(secrets.Token);

