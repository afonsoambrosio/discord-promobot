const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// Puppeteer
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

// require executablePath from puppeteer
const {executablePath} = require('puppeteer');

// Generating filenames
const crypto = require("crypto");

module.exports = {
    data: new SlashCommandBuilder()
		.setName('promo')
		.setDescription('Gera um anuncio')
        .addStringOption(option => option
                         .setName('link')
                         .setDescription('Link do bagulho')
                         .setRequired(true)),
	async execute(interaction) {
        
        console.log(`${interaction.user.username} usou /promo`);
        
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

            const channel = interaction.guild.channels.cache.get('1007451500173328494');
            //const channel = interaction.channel;
            await channel.send('<@&1006723058935005294>').catch(console.error);
            await channel.send({ embeds: [resposta] }).catch(console.error);

            
        }
        
	},
};

// Acessa o link e retorna o print
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

        await page.screenshot({path: '/home/afonso/www/knu.do/promobot/' + imagem});
        
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
    
    return { error: false, url: 'https://knu.do/promobot/' + imagem, title: title.substring(0, 255), price: price };
}