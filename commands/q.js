const Discord = require('discord.js');

/**
 * Creates a thread using the original message's question.
 * @param {Message} msg - the original command message
 */
function createThread(msg){
    
    // The bot crashes if the title is longer than 100 characters,
    // this gives some headroom.
    let threadTitle = msg.toString().substring(3, 83);
    if (msg.toString() > 83){
        threadTitle = threadTitle + "...";
    }
    msg.startThread({
        name: threadTitle
    });
}

/**
 * Sends embed message on how to use the command properly
 * @param {String} prefix - the prefix of the command
 * @param {Message} msg - the original command message
 */
 function incorrectUsage(prefix, msg){

    const embedMsg = new Discord.MessageEmbed()
    .setColor('#f51637')
    .addField('Ask a qeustion', `\`${prefix}q <your question>\``, false)
    msg.channel.send({embeds: [embedMsg]});
}

module.exports = {
    name: 'question',
    description: "this command opens a thread with the name set to the message",
    execute (prefix, msg, args){

        // Makes sure this code will not run when invoked in threads
        // If this if statement didn't exist, the bot will crash
        if (!(msg.channel.type == 'GUILD_PUBLIC_THREAD')){

            // if the user simply did the command with no arguments
            if (!args.length) {
                incorrectUsage(prefix, msg);
            }
            else {
                createThread(msg);
            }
        }
    }
}