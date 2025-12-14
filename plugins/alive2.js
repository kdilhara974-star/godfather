const { cmd } = require('../command');
const config = require('../config');
const os = require("os");
const { runtime } = require('../lib/functions');

if (!global.aliveMessages) global.aliveMessages = [];

// ALIVE COMMAND
cmd({
    pattern: "alive2",
    alias: ["hyranu2", "ranu2", "status2", "a2"],
    react: "🌝",
    desc: "Send alive message with ping. Reply 2 to alive to get ping again.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, sender, reply }) => {
    try {
        await robin.sendPresenceUpdate('recording', from);

        // Calculate initial ping
        const startTime = Date.now();
        const emojis = ['⚡', '💀'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const ping = Date.now() - startTime;

        // Alive message caption
        const status = `
╭─〔 💠 ALIVE STATUS 💠 〕─◉
│
│🐼 *Bot*: 𝐑𝐀𝐍𝐔𝐌𝐈𝐓𝐇𝐀-𝐗-𝐌𝐃
│🤵‍♂ *Owner*: ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴ𝐴
│⏰ *Uptime*: ${runtime(process.uptime())}
│⏳ *Ram*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖊 *Prefix*: [ ${config.PREFIX} ]
│🛠 *Mode*: [ ${config.MODE} ]
│🖥 *Host*: ${os.hostname()}
│🌀 *Version*: ${config.BOT_VERSION}
│⚡ *Ping*: _${ping}ms_ ${randomEmoji}
╰─────────────────────────────⊷
     
      1. ʙᴏᴛ ꜱᴘᴇᴇᴅ  
      2. ʙᴏᴛ ᴍᴇɴᴜ 
> 𝐌𝐚𝐝𝐞 𝐛𝐲 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝐀 🥶`;

        // Send image + alive caption
        let aliveMsg = await robin.sendMessage(from, {
            image: { url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_20250726_193256660.jpg" },
            caption: status
        }, { quoted: mek });

        // Store alive message ID for reply detection
        global.aliveMessages.push(aliveMsg.key.id);

    } catch (e) {
        console.log("Alive Error:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});

// REPLY HANDLER: Check reply to alive message
cmd({
    pattern: "",
    fromMe: false,
    desc: "Detect reply to alive message and respond",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, sender, quoted, reply }) => {
    try {
        if (!quoted || !quoted.key) return;

        // Only trigger if reply is to an alive message
        if (!global.aliveMessages.includes(quoted.key.id)) return;

        const text = (m.text || "").trim();

        // Random emoji for reactions
        const emojis = ['⚡', '💀'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React
        await robin.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        });

        if (text === "1") {
            // Reply 1 → Send ping
            const startTime = Date.now();
            let sentMsg = await robin.sendMessage(from, { text: "Calculating ping..." }, { quoted: mek });
            const ping = Date.now() - startTime;

            await robin.sendMessage(from, {
                edit: sentMsg.key,
                text: `*Ping: _${ping}ms_ ${randomEmoji}*`
            });

        } else if (text === "2") {
            // Reply 2 → Also send ping (or you can send menu here)
            const startTime = Date.now();
            let sentMsg = await robin.sendMessage(from, { text: "Calculating ping..." }, { quoted: mek });
            const ping = Date.now() - startTime;

            await robin.sendMessage(from, {
                edit: sentMsg.key,
                text: `*Ping: _${ping}ms_ ${randomEmoji}*`
            });
        }

    } catch (e) {
        console.error("Alive reply error:", e);
    }
});
