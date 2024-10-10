const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);
const fs = require('fs');
const config = require('./config.json');

const client = new Client({     
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,           // Required for managing members (assigning roles)
        GatewayIntentBits.GuildMessages,          // Required to read and send messages in guilds
        GatewayIntentBits.GuildMessageReactions,  // Required to detect reactions
        GatewayIntentBits.MessageContent,         // Required to access message content
        GatewayIntentBits.DirectMessages,         // Allows bot to handle DMs
        GatewayIntentBits.GuildMessageTyping,     // Optional: Detects typing in guild channels
        GatewayIntentBits.DirectMessageTyping,    // Optional: Detects typing in DMs
        GatewayIntentBits.GuildPresences          // Used to fetch presents
    ]
}); 



const functions = fs.readdirSync("./loading").filter(file => file.endsWith(".js"));
client.commands = new Collection();
const commandFolders = fs.readdirSync("./commands");
const path = "./commands"
client.once('ready', async () => {
    for (file of functions) {
        require(`./loading/${file}`)(client);
    }

    client.handleCommands(commandFolders, "./commands");


    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        console.log(`${interaction.user.username} just used ${interaction.commandName}`);
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(config.token);
