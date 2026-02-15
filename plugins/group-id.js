const { cmd } = require('../command');

// Fake ChatGPT vCard
const fakevCard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

cmd({
  pattern: "ginfo",
  alias: ["groupinfo", "gid"],
  react: "👥",
  desc: "Get WhatsApp Group info",
  category: "whatsapp",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isGroup,
  reply
}) => {

  try {

    if (!isGroup) {
      return reply("❌ *This command can only be used in a group.*");
    }

    // Get Group Metadata
    const metadata = await conn.groupMetadata(from);

    if (!metadata) {
      return reply("❌ Failed to fetch group metadata.");
    }

    const groupInfo = `*— 乂 Group Info —*\n\n` +
      `🆔 *Group ID:* ${metadata.id}\n` +
      `📛 *Name:* ${metadata.subject}\n` +
      `📝 *Description:* ${metadata.desc || "No description"}\n` +
      `👑 *Owner:* ${metadata.owner || "Unknown"}\n` +
      `👥 *Members:* ${metadata.participants.length}\n` +
      `📅 *Created:* ${metadata.creation ? new Date(metadata.creation * 1000).toLocaleString("id-ID") : "Unknown"}\n\n` +
      `🔒 *Announce:* ${metadata.announce ? "Only Admins Can Send Messages" : "All Members Can Send Messages"}\n` +
      `✏️ *Edit Info:* ${metadata.restrict ? "Only Admins Can Edit Info" : "All Members Can Edit Info"}\n\n` +
      `> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // Send with group profile picture if available
    let pp;
    try {
      pp = await conn.profilePictureUrl(from, "image");
    } catch {
      pp = null;
    }

    if (pp) {
      await conn.sendMessage(from, {
        image: { url: pp },
        caption: groupInfo
      }, { quoted: fakevCard });
    } else {
      await reply(groupInfo);
    }

  } catch (error) {
    console.error("❌ Error in ginfo plugin:", error);
    reply("*Error fetching group info*");
  }

});
