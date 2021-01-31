const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config/config');

var AWS = require('aws-sdk');

AWS.config.update({region: 'ap-southeast-1'});
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
var params ={InstanceIds: config.instanceIDS, DryRun: false};

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
            msgBody =  msgBody[1].trim()

            async function getStatus()
            {
                ec2.describeInstances(params,function(err, data)
                {
                    if (err)
                    {
                        console.log("Error", err.stack);
                        msg.channel.send("Error: ", err)
                    }
                    else
                    {
                        msg.channel.send(`Status of instance ${config.instanceIDS}`)
                        estate = JSON.stringify(data["Reservations"][0]["Instances"][0]["State"]["Name"]);
                        ip = JSON.stringify(data["Reservations"][0]["Instances"][0]['PublicDnsName']);
                        msg.channel.send(`Final Status : ${estate} \nIP : ${ip}`)
                        console.log(`Final Status : ${estate} \nIP : ${ip}`)
                    }
                });
            }

            async function startInstance()
            {
                ec2.startInstances(params, function(err, data)
                {
                    if (err)
                    {
                        console.log("Error", err);
                        msg.channel.send("Error: ", err)
                    }
                    else if (data)
                    {
                        msg.channel.send(`Starting Instance ${config.instanceIDS}`)
                        console.log("Success", data.StartingInstances);
                        console.log("Success", data.StartingInstances[0]['CurrentState']['Name']);
                        msg.channel.send(`Current State: ${data.StartingInstances[0]['CurrentState']['Name']} \nPrevious State: ${data.StartingInstances[0]['PreviousState']['Name']} `)
                    }
                });
            }

            async function stopInstance()
            {
                ec2.stopInstances(params, function(err, data)
                {
                    if (err)
                    {
                        console.log("Error", err);
                        msg.channel.send("Error: ", err)
                    }
                    else if (data)
                    {
                        msg.channel.send(`Stopping Instance ${config.instanceIDS}`)
                        console.log(data.StoppingInstances[0])
                        msg.channel.send(`Current State: ${data.StoppingInstances[0]['CurrentState']['Name']} \nPrevious State: ${data.StoppingInstances[0]['PreviousState']['Name']} `)
                    }
                });
            }

            switch(msgBody)
            {
                case "status":
                    getStatus()
                break;
                case "start":
                    startInstance()
                break;
                case "stop":
                    stopInstance()
                break;
                default:
                    msg.channel.send(`Command Not Found`)
            }
        }
        else
        {
            msg.channel.send(`To Use This Command, The Role ${config.Role} is Needed.`)
        }
    }
});

bot.login(config.Token);