const { cmd } = require('../command');
const yts = require('yt-search');
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
    pattern: "video",
    alias: "ytvideo",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        // 1️⃣ Determine the query (text or replied message)
        let query = q?.trim();

        if (!query && m?.quoted) {
            query =
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text ||
                m.quoted.text;
        }

        if (!query) {
            return reply("⚠️ Please provide a video name or YouTube link (or reply to a message).");
        }

        // 2️⃣ Convert Shorts link to normal link
        if (query.includes("youtube.com/shorts/")) {
            const videoId = query.split("/shorts/")[1].split(/[?&]/)[0];
            query = `https://www.youtube.com/watch?v=${videoId}`;
        }

        // 3️⃣ YouTube search
        const search = await yts(query);
        if (!search.videos.length) return reply("*❌ No results found.*");

        const data = search.videos[0];
        const ytUrl = data.url;

        const formats = {
            "240p": `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}&format=240`,
            "360p": `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}&format=360`,
            "480p": `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}&format=480`,
            "720p": `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}&format=720`
        };

        const caption = `
*📽️ RANUMITHA-X-MD VIDEO DOWNLOADER 🎥*

*🎵 \`Title:\`* ${data.title}
*⏱️ \`Duration:\`* ${data.timestamp}
*📆 \`Uploaded:\`* ${data.ago}
*📊 \`Views:\`* ${data.views}
*🔗 \`Link:\`* ${data.url}

🔢 *Reply Below Number*

1. *Video FILE 📽️*
   1.1 240p Qulity 📽️
   1.2 360p Qulity 📽️
   1.3 480p Qulity 📽️
   1.4 720p Qulity 📽️

2. *Document FILE 📂*
   2.1 240p Qulity 📂
   2.2 360p Qulity 📂
   2.3 480p Qulity 📂
   2.4 720p Qulity 📂

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;

        conn.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg?.message) return;

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text;

            const isReply =
                msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReply) return;

            let quality, isDoc = false;

            switch (text.trim()) {
                case "1.1": quality = "240p"; break;
                case "1.2": quality = "360p"; break;
                case "1.3": quality = "480p"; break;
                case "1.4": quality = "720p"; break;

                case "2.1": quality = "240p"; isDoc = true; break;
                case "2.2": quality = "360p"; isDoc = true; break;
                case "2.3": quality = "480p"; isDoc = true; break;
                case "2.4": quality = "720p"; isDoc = true; break;

                default:
                    return reply("*❌ Invalid option*");
            }

            // ⬇️ Download start
            await conn.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

            const { data: api } = await axios.get(formats[quality]);
            if (!api?.success) return reply("❌ Download failed");

            // ⬆️ Upload start
            await conn.sendMessage(from, { react: { text: "⬆️", key: msg.key } });

            if (isDoc) {
                await conn.sendMessage(from, {
                    document: { url: api.result.downloadUrl },
                    mimetype: "video/mp4",
                    fileName: `${api.result.title}.mp4`
                }, { quoted: msg });
            } else {
                await conn.sendMessage(from, {
                    video: { url: api.result.downloadUrl },
                    mimetype: "video/mp4"
                }, { quoted: msg });
            }

            // ✔️ Sent complete
            await conn.sendMessage(from, { react: { text: "✔️", key: msg.key } });
        });

    } catch (e) {
        console.log(e);
        reply("*Error*");
    }
});
