// For testing purposes, this command does the same as promo.js without pinging users and sends the result in your current channel
require('dotenv').config();

const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const { ChannelSelectMenuBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const controller = require('../controller.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('setpromochannel')
		.setDescription('Define onde os avisos serão postados.'),
	async execute(interaction) {
        console.log(`${interaction.user.username} used /setpromochannel`); // logging purposes
        
        if(interaction.member.permissions.any([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ModerateMembers])){
            let channels = interaction.guild.channels.cache;

            const select = new ChannelSelectMenuBuilder({
                custom_id: 'channelid',
                placeholder: 'selecione um canal',
                channel_types: [0]
            });

            const row = new ActionRowBuilder()
                .addComponents(select);

            const response = await interaction.reply({
                ephemeral: true,
                content: 'Escolha o canal de promoções:',
                components: [row],
            });
            
            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 30000 });
                await controller.setDefaultChannel(confirmation.guildId, confirmation.values[0]);
                await confirmation.update({ content: `Canal <#${confirmation.values[0]}> definido como canal de promoções.`, components: [] });
            } catch (e) {
                await interaction.editReply({ content: 'Falha ao atualizar o canal padrão: ' + e, components: [] });
            }
        }else{
            await interaction.reply({
                ephemeral: true,
                content: 'Você não tem permissão para usar este comando (admin/mod).'
            });
        }
        
	},
};