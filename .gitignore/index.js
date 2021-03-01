const Discord = require('discord.js')
const { listenerCount, errorMonitor } = require('ws')
const Client = new Discord.Client()
const ytdl = require('ytdl-core')
var list=[]

Client.on('ready', function(){
    Client.user.setActivity('Scrabble entre amis')
    Client.guilds.cache.find(guild=>guild.id==="814554235290255400").channels.cache.find(channel=>channel.id==="815271766582624286").messages.fetch('815280236324847616')
    console.log("Opérationnel !")
})

/*LES COMMANDES - MESSAGES - ! */

Client.on('message', function(message){
    if(message.content.startsWith('!play')){
        if (message.channel.id==('814554235290255405')){
            if (message.member.voice.channel){
                let args = message.content.split(" ")
                const url_valid=ytdl.validateURL(args[1])
                if(args[1]== undefined || !args[1].startsWith('https://www.youtube.com/watch?v=') || !url_valid){
                    message.reply("Le lien vers la vidéo est erronée...")
                }
                else{
                    if(list.length>0){
                        list.push(args[1])
                        message.reply("Ajoutée à la file d'attente !")
                    }
                    else{
                        list.push(args[1])
                        message.reply("Prêt à être joué")
                        message.member.voice.channel.join().then(connection => {
                            playMusic(connection)
                            connection.on("disconnect",()=>{
                                list=[]
                            })
                        })
                    }
                }
            }
            else{
                message.reply("Connecte-toi à un vocal.")
            }
        }
        else{
            message.delete()
            message.reply('Cette commande ne peut être exécutée ici. Veuillez aller à <#814554235290255405>')
        }
    }
    if(message.content=="!skip"){
        if (message.channel.id==('814554235290255405')){
            if (message.member.voice.channel){
                list.splice(0,1)
                message.member.voice.channel.join().then(connection => {
                    playMusic(connection)
                })
            }
        }
        else{
            message.delete()
            message.reply('Cette commande ne peut être exécutée ici. Veuillez aller à <#814554235290255405>')
        }    
    }
    if(message.content==='!ms'){
        message.channel.send(`🏓Ton ping est de ${message.createdTimestamp-Date.now() }ms.`)
    }
    /* MODERATEURS*/

    if(message.content.startsWith('!clear')){
        if (message.member.roles.cache.has("815592023578378260")){
            let args=message.content.split(" ")
            if (args[1]==undefined){
                message.reply('Il manque un nombre')
            }
            else{
                let nb=parseInt(args[1])
                if(isNaN(nb)){
                    message.reply("C'est pas un nombre, désolé...")
                }
                else{
                    message.channel.bulkDelete(nb)
                }
            }
        }
        else{
            message.delete()
            message.reply("Tu n'es pas modérateur. La permission ne t'est pas accordée.")
        }
    }
    else if(message.content.startsWith('!ban')){
        if (message.member.roles.cache.has("815592023578378260")){
            let mention=message.mentions.members.first()
            if (mention==undefined){
                message.reply('Il manque une mention')
            }
            else{
                if(mention.bannable){
                    mention.ban()
                    message.channel.send(mention.displayName+" a été banni(e) :rage:")
                }
                else{
                    message.reply("Tu t'attaques à plus fort que toi mon ami. Recule !")
                }
            }
        }
        else{
            message.delete()
            message.reply("Tu n'es pas modérateur. La permission ne t'est pas accordée.")
        }
    }
    else if(message.content.startsWith('!kick')){
        if (message.member.roles.cache.has("815592023578378260")){
            let mention=message.mentions.members.first()
            if (mention==undefined){
                message.reply('Il manque une mention')
            }
            else{
                if(mention.kickable){
                    mention.kick()
                    message.channel.send(mention.displayName+" a été kické(e) !")
                }
                else{
                    message.reply("Tu t'attaques à plus fort que toi mon ami. Recule !")
                }
            }
        }
        else{
            message.delete()
            message.reply("Tu n'es pas modérateur. La permission ne t'est pas accordée.")
        }
    }
    else if(message.content.startsWith('!mute')){
        if (message.member.roles.cache.has("815592023578378260")){
            let mention=message.mentions.members.first()
            if (mention==undefined){
                message.reply('Il manque une mention')
            }
            else{
                mention.roles.add('815605244880093186')
                message.channel.send(mention.displayName+" a été mute :no_mouth: !")
            }
        }
    }
    else if(message.content.startsWith('!unmute')){
        if (message.member.roles.cache.has("815592023578378260")){
            let mention=message.mentions.members.first()
            if (mention==undefined){
                message.reply('Il manque une mention')
            }
            else{
                mention.roles.remove('815605244880093186')
                message.channel.send(mention.displayName+" a été unmute :smile: !")
            }
        }
    }
    else if(message.content.startsWith('!tempmute')){
        if (message.member.roles.cache.has("815592023578378260")){
            let mention=message.mentions.members.first()
            if (mention==undefined){
                message.reply('Il manque une mention')
            }
            else{
                let args=message.content.split(" ")
                mention.roles.add('815605244880093186')
                message.channel.send(mention.displayName+" a été mute pendant "+args[2]+"s  :no_mouth: !")
                setTimeout(function(){
                    mention.roles.remove('815605244880093186')
                    message.channel.send("<@"+mention.id+"> tu viens de retrouver ta voix ! (enfin façon de parler...)")
                },args[2]*1000)
            }
        }
    }
    /*FIN MODERATEURS*/
})

/*LES COMMANDES - ASYNC */

Client.on('message',async message=>{
    if (message.content=='!file'){
        if  (message.channel.id==('814554235290255405')){
            let msg="**FILE D'ATTENTE !**\n"
            for(var i=0;i<list.length;i++){
                let son
                let obtInfo=await ytdl.getInfo(list[i])
                son=obtInfo.videoDetails.title
                msg+="> "+i+" - "+son+"\n"
            }
            message.reply(msg)
        }
        else{
            message.delete()
            message.reply('Cette commande ne peut être exécutée ici. Veuillez aller à <#814554235290255405>')
        }
    }
})

/*FIN DES COMMANDES - MESSAGES !*/

function playMusic(connection){
    let dispatcher = connection.play(ytdl(list[0],{quality:'highestaudio'}))
    dispatcher.on('finish',()=>{
        list.shift()
        dispatcher.destroy()
        if (list.length>0){
            playMusic(connection)
        }
        else{
            connection.disconnect()
        }
    })
    dispatcher.on('error',err=>{
        dispatcher.destroy()
        connection.disconnect()
    })
}

Client.on('guildMemberAdd', member=>{const channel = member.guild.channels.cache.find(channel => channel.id==='814938403535192077').send("Bienvenue "+ member.toString() +", nous t'attendons ! :wave:")})

Client.on('messageReactionAdd',(reaction,user)=>{
    console.log("oui")
    if (reaction.emoji.name==="👍"){
        var member=reaction.message.guild.members.cache.find(member => member.id===user.id)
        member.roles.add('815271464005140491')}
})

Client.on('messageReactionRemove',(reaction,user)=>{
    console.log("non")
    if (reaction.emoji.name==="👍"){
        var member=reaction.message.guild.members.cache.find(member => member.id===user.id)
        member.roles.remove('815271464005140491')}
})

Client.login(process.env.TOKEN)
