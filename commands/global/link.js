const { SlashCommandBuilder, EmbedBuilder, ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const fs = require('fs')
const axl = require("app-xbox-live")
const { Authflow, Titles } = require('prismarine-auth')
const { xlookup } = require('../../functions/xbox')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your account to use more commands.'),
    async execute(interaction) {
        const loading = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Link')
            .setDescription('Loading the link command this may take a second.')
            .setTimestamp()
            .setFooter({ text: 'Link Command' });

        await interaction.reply({ embeds: [loading] });
        try{
            if (fs.existsSync(`./authcache/${interaction.user.username}`)) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffffff')
                            .setTitle('Error')
                            .setDescription('You are already linked. To relink an account or to check what account you have linked, do **/unlink** or **/account**.')
                            .setTimestamp()
                            .setFooter({ text: 'Link Command' })
                    ], 
                    components: [],
                    ephemeral: true
                });
            }
        
            try {
                const auth = await new Authflow(interaction.user.id, `./authcache/${interaction.user.username}`, { 
                    flow: "live", 
                    authTitle: Titles.MinecraftNintendoSwitch, 
                    deviceType: "Nintendo", 
                    doSisuAuth: true 
                }, async (code) => {
                    const verificationEmbed = new EmbedBuilder()
                        .setColor('#ffffff')
                        .setTitle(`Link Your Account`)
                        .setDescription(`Please go to [Microsoft](${code.verification_uri}) and enter the code **${code.user_code}**. This code expires in <t:${Math.floor(Date.now() / 1000) + code.expires_in}:R>.`)
                        .setTimestamp();
        
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Link Account')
                                .setStyle(ButtonStyle.Link)
                                .setURL(`http://microsoft.com/link?otc=${code.user_code ?? "unknown"}`)
                        );
        
                    await interaction.editReply({ embeds: [verificationEmbed], components: [row], ephemeral: true });
        
                    setTimeout(async () => {
                        await interaction.editReply({ components: [] });
                    }, 5 * 60 * 1000);
                });

                const token = await auth.getXboxToken();
                if (token) {
                    const xl = new axl.Account(`XBL3.0 x=${token.userHash};${token.XSTSToken}`)
                    const xbox = await xl.people.get(token.userXUID)
                    if(!xbox) return
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ffffff')
                                .setTitle('Link')
                                .setDescription(`Your discord account was linked to ${xbox.people[0].gamertag}. You are now able to use all link only commands have fun!`)
                                .setTimestamp()
                                .setFooter({ text: 'Link Command' })
                        ], 
                        components: [],
                        ephemeral: true
                    });
                }
            } catch (error) {
                console.error("Error initializing Authflow:", error);
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffffff')
                            .setTitle('Error')
                            .setDescription('There was an error starting the authentication process. Please try again later.')
                            .setTimestamp()
                            .setFooter({ text: 'Link Command' })
                    ], 
                    components: [],
                    ephemeral: true
                });
            }
    } catch (error) {
            console.log(error)

            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffffff')
                        .setTitle('Error')
                        .setDescription('Error in the linking proccess report this to a dev.')
                        .setTimestamp()
                        .setFooter({ text: 'Link Command' })
                ], 
                components: [],
                ephemeral: true });
        }
    },
}




// You can do the linking diff this is jst how i do it as its easy. You can add
// In so it logs to a data.json but i dont do that its useless (in drex i do to keep handle of what the users doing)
// You might wanna make a database for this. if you dont have memory use mongo db, or use your server.