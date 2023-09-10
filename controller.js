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

module.exports = { setDefaultChannel };