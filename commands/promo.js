require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// Puppeteer
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

// require executablePath from puppeteer
const {executablePath} = require('puppeteer');

// For generating filenames for the screenshots
const crypto = require("crypto");

module.exports = {
    data: new SlashCommandBuilder()
		.setName('promo')
		.setDescription('Gera um anuncio')
        .addStringOption(option => option // Makes it possible to receive the link with the slash command
                         .setName('link')
                         .setDescription('Link do bagulho')
                         .setRequired(true)),
	async execute(interaction) {
        
        console.log(`${interaction.user.username} usou /promo`); // logging purposes
        
        await interaction.deferReply({ ephemeral: true });
        
        const link = interaction.options.getString('link');
        
        const page = await loadPage(link);
        
        if(page.error){
            await interaction.editReply({content: 'deu ruim aqui, verifica se o link ta correto :c' });
        }else{
            
            await interaction.editReply({content: 'calmaê que ja vai' });

            const resposta = new EmbedBuilder()
                .setColor(0xe309a2)
                .setTitle(page.title)
                .setURL(link)
                .addFields({ name: 'Preço *`beta`*', value: `**${page.price}**` })
                .setImage(page.url)
                .setTimestamp()
                .setFooter({ text: interaction.user.username });

            
            // Specifies the channel where the bot should send the embed message (channel ID)
            const target = '1007451500173328494';
            
            const channel = interaction.guild.channels.cache.get(target);
            //const channel = interaction.channel; // uncomment this line if you want the bot to send the resulting message in your current channel
            
            await channel.send('<@&1006723058935005294>').catch(console.error); // this tags a specific role
            await channel.send({ embeds: [resposta] }).catch(console.error); // sends the embed message

            
        }
        
	},
};

// Uses puppeteer to access the link and generate a screenshot
async function loadPage(link) {
    const imagem = crypto.randomBytes(8).toString('hex') + '.png';
    var content = '';
    
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        `--window-size=1280,960`
    ];

    puppeteerExtra.use(pluginStealth());
    const browser = await puppeteerExtra.launch({
        args: args,
        defaultViewport: {
            width:1280,
            height:960
        },
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: executablePath(),
    });
    
    try{
        const page = await browser.newPage();

        await page.goto(link);

        await page.waitForTimeout(1501);

        await page.screenshot({path: process.env.IMAGES_FOLDER + imagem});
        
        content = await page.content();

        await browser.close();
    } catch (e) {
        console.log('deu ruim: ', e);
        return { error: true, img: '' };
    }
    
    var title = content.match('<title>(.*?)<\/title>');
    var price = content.match('"price": *"(.*?)",');
    
    if(title){
        title = title[1];
    }else{
        title = link;
    }
    
    if(price){
        price = price[1];
    }else{
        price = '----';
    }
    
    
    // I'm using another server to serve the images, you can change this base url to your server or even serve the images with node i.e. using express
    
    const baseserver = 'https://knu.do/promobot/'
    return { error: false, url: baseserver + imagem, title: title.substring(0, 255), price: price };
}