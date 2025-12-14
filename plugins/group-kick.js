const { cmd } = require('../command'); // oya command system eka reference karanna
const { getGroupAdmins } = require('../lib/functions'); // admin check karanna

cmd({
    pattern: 'kick',
    desc: 'Removes a user by replying to their message',
    fromMe: false, // true karoth me command eka oyage message walata mathu wenawa
    type: 'group'
}, async (message, match) => {
    try {
        if (!message.isGroup) return await message.send('⚠️ This command can only be used in groups.');

        const botNumber = message.conn.user.jid.split(':')[0] + '@s.whatsapp.net';
        const groupAdmins = await getGroupAdmins(message.chat);

        if (!groupAdmins.includes(botNumber)) {
            return await message.send('⚠️ I need to be an admin to kick users.');
        }

        if (!message.quoted) {
            return await message.send('⚠️ Please reply to the user\'s message you want to kick.');
        }

        const userToKick = message.quoted.sender;

        if (groupAdmins.includes(userToKick)) {
            return await message.send('⚠️ Cannot kick an admin!');
        }

        await message.groupRemove([userToKick]);
        await message.send('✅ User has been removed from the group.');
    } catch (error) {
        console.log(error);
        await message.send('❌ Failed to kick the user.');
    }
});
