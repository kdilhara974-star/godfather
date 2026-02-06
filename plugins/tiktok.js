const { cmd } = require('../command');
const axios = require('axios');

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
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video with full details and numbered options",
    category: "downloader",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        // ✅ Get TikTok link from command or replied message
        let tiktokUrl = q?.trim();
        if (!tiktokUrl && m?.quoted) {
            tiktokUrl =
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text ||
                m.quoted.text;
        }

        if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
            return reply("⚠️ Please provide a valid TikTok link (or reply to a message).");
        }

        await conn.sendMessage(from, { react: { text: '🎥', key: m.key } });

        // ✅ Fetch TikTok info
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${encodeURIComponent(tiktokUrl)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.data) {
            return reply("❌ Failed to fetch TikTok video. Please check the link and try again.");
        }

        const dat = data.data;
        
        // Custom thumbnail
        const customThumb = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/RANUMITHA-X-MD%20TIKTOK%20LOGO.jpg";

        // Create caption
        const caption = `*🍇 RANUMITHA-X-MD TIKTOK DOWNLOADER 🍇*

📑 *Title:* ${dat.title || "No title"}
⏱️ *Duration:* ${dat.duration || "N/A"}
👍 *Likes:* ${dat.like || dat.view || "0"}
💬 *Comments:* ${dat.comment || "0"}
🔁 *Shares:* ${dat.share || "0"}
📥 *Downloads:* ${dat.download || "0"}
🔗 *Link:* ${tiktokUrl}

💬 *Reply Below Number*

1️⃣ *HD Quality* 🔋
2️⃣ *SD Quality* 📱
3️⃣ *Audio (MP3)* 🎶

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        // Send menu message
        const sentMsg = await conn.sendMessage(from, {
            image: { url: customThumb },
            caption: caption
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;
        const connId = conn.id || conn.user?.id; // Unique connection identifier

        // Store message ID for this specific command instance
        if (!global.tiktokListeners) global.tiktokListeners = {};
        global.tiktokListeners[messageID] = {
            connId: connId,
            data: dat,
            timestamp: Date.now()
        };

        // Clean up old listeners (older than 5 minutes)
        for (const [id, listener] of Object.entries(global.tiktokListeners)) {
            if (Date.now() - listener.timestamp > 5 * 60 * 1000) {
                delete global.tiktokListeners[id];
            }
        }

        // Setup reply listener with timeout
        setTimeout(() => {
            if (global.tiktokListeners[messageID]) {
                delete global.tiktokListeners[messageID];
            }
        }, 5 * 60 * 1000); // 5 minutes timeout

    } catch (e) {
        console.error("TikTok plugin error:", e);
        reply("*❌ Error downloading TikTok video.*");
    }
});

// Separate event listener for handling replies
if (!global.tiktokReplyHandler) {
    global.tiktokReplyHandler = async (conn, msgData) => {
        try {
            const receivedMsg = msgData.messages?.[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || 
                                receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const replyToId = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId;
            
            if (!replyToId || !receivedText || !global.tiktokListeners[replyToId]) return;

            const listener = global.tiktokListeners[replyToId];
            
            // Clean up the listener since we're processing it
            delete global.tiktokListeners[replyToId];

            // React to show processing
            await conn.sendMessage(senderID, { 
                react: { text: '⬇️', key: receivedMsg.key } 
            });

            let mediaUrl, captionText, isAudio = false;

            switch (receivedText.trim()) {
                case "1":
                    // HD Quality
                    mediaUrl = listener.data.video || listener.data.video_url || listener.data.video_hd;
                    captionText = "📥 *Downloaded HD Quality*";
                    break;
                    
                case "2":
                    // SD Quality
                    mediaUrl = listener.data.sd_video || listener.data.video || listener.data.video_url;
                    captionText = "📥 *Downloaded SD Quality*";
                    break;
                    
                case "3":
                    // Audio
                    mediaUrl = listener.data.audio || listener.data.music;
                    isAudio = true;
                    captionText = "🎶 *Downloaded Audio*";
                    break;
                    
                default:
                    await conn.sendMessage(senderID, { 
                        text: "*❌ Invalid option! Please reply with 1, 2 or 3.*" 
                    }, { quoted: receivedMsg });
                    return;
            }

            if (!mediaUrl) {
                await conn.sendMessage(senderID, { 
                    text: "*❌ Media not available for this option.*" 
                }, { quoted: receivedMsg });
                return;
            }

            // Upload react
            await conn.sendMessage(senderID, { 
                react: { text: '⬆️', key: receivedMsg.key } 
            });

            // Send media
            if (isAudio) {
                await conn.sendMessage(senderID, {
                    audio: { url: mediaUrl },
                    mimetype: "audio/mp4",
                    ptt: false,
                    caption: captionText
                }, { quoted: receivedMsg });
            } else {
                await conn.sendMessage(senderID, {
                    video: { url: mediaUrl },
                    mimetype: "video/mp4",
                    caption: captionText
                }, { quoted: receivedMsg });
            }

            // Success react
            await conn.sendMessage(senderID, { 
                react: { text: '✅', key: receivedMsg.key } 
            });

        } catch (error) {
            console.error("TikTok reply handler error:", error);
        }
    };

    // Register the global event listener
    if (typeof conn !== 'undefined' && conn.ev) {
        conn.ev.on("messages.upsert", (msgData) => global.tiktokReplyHandler(conn, msgData));
    }
        }
