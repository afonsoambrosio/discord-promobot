// For testing purposes, this command does the same as promo.js without pinging users and sends the result in your current channel

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
		.setName('testpromo')
		.setDescription('Gera um anuncio em modo teste')
        .addStringOption(option => option // Makes it possible to receive the link with the slash command
                         .setName('link')
                         .setDescription('Link do bagulho')
                         .setRequired(true)),
	async execute(interaction) {
        
        console.log(`${interaction.user.username} used /testpromo`); // logging purposes
        
        await interaction.deferReply({ ephemeral: true });
        
        const link = interaction.options.getString('link');
        
        const page = await loadPage(link);
        
        console.log(` > Generated ${page.url}`);
        
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
            
            // uncomment this line if you want the bot to send the resulting message in a target channel
            //const channel = interaction.guild.channels.cache.get(target);
            
            // uncomment this line if you want the bot to send the resulting message in your current channel
            const channel = interaction.channel; 
            
            // this pings a specific role (use the role's ID)
            //await channel.send('<@&1006723058935005294>').catch(console.error); 
            
            // sends the embed message
            await channel.send({ embeds: [resposta] }).catch(console.error);

            
        }
        
	},
};

// Uses puppeteer to access the link and generate a screenshot
async function loadPage(link) {
    
    // where to store the file
    const image_path = 'public/ss/';
    
    // generates random name
    const image_name = crypto.randomBytes(8).toString('hex') + '.png';
    var html_content = '';
    
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

        await page.waitForTimeout(1299);

        await page.screenshot({ path: image_path + image_name });
        
        html_content = await page.content();

        await browser.close();
    } catch (e) {
        console.log('deu ruim: ', e);
        return { error: true, img: '' };
    }
    
    var title = html_content.match('<title>(.*?)<\/title>');
    var price = html_content.match('"price": *"(.*?)",');
    
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
    
    const image = `http://knu.do:8880/ss/${image_name}`;
    return { error: false, url: image, title: title.substring(0, 255), price: price };
}