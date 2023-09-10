// For testing purposes, this command does the same as promo.js without pinging users and sends the result in your current channel
require('dotenv').config();

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const controller = require('../controller.js');

module.exports = {
    data: new SlashCommandBuilder()
		.setName('setping')
		.setDescription('Define qual cargo sera pingado ao enviar novos anúncios.'),
	async execute(interaction) {
        console.log(`${interaction.user.username} used /setping`); // logging purposes
        
        // check if the user has permission to issue this command
        if(interaction.member.permissions.any([PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ModerateMembers])){
            await interaction.deferReply({ ephemeral: true });
            const guildSettings = await controller.getSettings(interaction.guildId);
            
            const selectRow = new ActionRowBuilder();
            selectRow.addComponents(new RoleSelectMenuBuilder({
                custom_id: 'roleid',
                placeholder: 'selecione um cargo',
            }));
            
            const disableRow = new ActionRowBuilder();
            disableRow.addComponents(new ButtonBuilder()
                .setCustomId('disable')
                .setLabel('Desabilitar ping')
                .setStyle(ButtonStyle.Secondary));

            let components = [selectRow];
            
            if('ping' in guildSettings){
                if(guildSettings.ping){
                    components.push(disableRow);
                }
            }

            const response = await interaction.editReply({
                ephemeral: true,
                content: 'Escolha o cargo que será pingado:',
                components: components,
            });
            
            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 30000 });
                if(confirmation.customId == 'roleid'){
                    await controller.updateSettings(confirmation.guildId, {
                        ping: true,
                        pingRole: confirmation.values[0]
                    });
                    await confirmation.update({ content: `Cargo <@&${confirmation.values[0]}> será pingado ao enviar anúncios.`, components: [] });
                }else if(confirmation.customId == 'disable'){
                    await controller.updateSettings(confirmation.guildId, {
                        ping: false
                    });
                    await confirmation.update({ content: `Ping desabilitado.`, components: [] });
                }else{
                    await interaction.editReply({ content: 'Falha ao atualizar configurações de ping.', components: [] });
                }
                
            } catch (e) {
                await interaction.editReply({ content: 'Falha ao atualizar configurações de ping: ' + e, components: [] });
            }
        }else{
            await interaction.reply({
                ephemeral: true,
                content: 'Você não tem permissão para usar este comando (admin/mod).'
            });
        }
        
	},
};