const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { xsearch } = require('../../functions/xbox');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xsearch')
        .setDescription('Lookup user information or provide a custom input.')
        .addStringOption(option => option.setName('user').setDescription('Xbox user to search').setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('user')
        const searching = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Xlookup Result')
            .setDescription('Fetching all users...')
            .addFields(
                { name: 'User', value: username, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'XLookup Command' });

        await interaction.reply({ embeds: [searching] });
        try{
            await xsearch(interaction, username)
        } catch (error) {
            const searching = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle('Error')
                .setDescription('Error while fetching all users this could be due to ')
                .addFields(
                    { name: 'User', value: username, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: 'XLookup Command' });

            await interaction.editReply({ embeds: [searching] });
        }
    },
}

// This is simple nothing much
// Main file for this is in functions/xbox