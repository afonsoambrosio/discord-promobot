// Import Admin SDK
const { getDatabase } = require('firebase-admin/database');

// Get a database reference to our blog
const db = getDatabase();
const ref = db.ref('config');

function setDefaultChannel(guild, channelId){
    const guildConfigRef = ref.child('guilds');

    guildConfigRef.update({
      [guild]: {
        defaultChannel: channelId,
      }
    });
}

function updateSettings(guild, settings){
    const guildConfigRef = ref.child('guilds/' + guild);

    guildConfigRef.update(settings);
}

async function getSettings(guild){
    const guildConfigRef = ref.child('guilds/' + guild);

    return guildConfigRef.once('value').then(childsnapshot => childsnapshot.val());
}

module.exports = { setDefaultChannel, getSettings, updateSettings };