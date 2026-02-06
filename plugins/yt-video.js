const axios = require('axios');
const yts = require('yt-search');
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

        // 5️⃣ Send selection menu (image + caption)
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

3. *WhatsApp Compatible Video 🎬*
   3.1 WA Compatible 360p
   3.2 WA Compatible 480p
   3.3 WA Compatible 720p

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;

        // 6️⃣ Listen for user replies
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText =
                receivedMsg.message.conversation ||
                receivedMsg.message.extendedTextMessage?.text;

            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot =
                receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                let selectedFormat, isDocument = false, isWhatsAppCompatible = false;

                switch (receivedText.trim().toUpperCase()) {
                    case "1.1": selectedFormat = "240p"; break;
                    case "1.2": selectedFormat = "360p"; break;
                    case "1.3": selectedFormat = "480p"; break;
                    case "1.4": selectedFormat = "720p"; break;
                    case "2.1": selectedFormat = "240p"; isDocument = true; break;
                    case "2.2": selectedFormat = "360p"; isDocument = true; break;
                    case "2.3": selectedFormat = "480p"; isDocument = true; break;
                    case "2.4": selectedFormat = "720p"; isDocument = true; break;
                    case "3.1": selectedFormat = "360p"; isWhatsAppCompatible = true; break;
                    case "3.2": selectedFormat = "480p"; isWhatsAppCompatible = true; break;
                    case "3.3": selectedFormat = "720p"; isWhatsAppCompatible = true; break;
                    default:
                        return reply("*❌ Invalid option!*");
                }

                // React ⬇️ when download starts
                await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

                if (isWhatsAppCompatible) {
                    // WhatsApp Compatible API භාවිතා කරන්න
                    try {
                        // WhatsApp Compatible API URL (කුඩා file size සහ compatible codec සමග)
                        const whatsappUrl = `https://api.vevioz.com/api/button/mp4/${ytUrl.split('v=')[1]}`;
                        
                        const { data: whatsappRes } = await axios.get(whatsappUrl);
                        
                        if (!whatsappRes || !whatsappRes[selectedFormat.replace('p', '')]) {
                            throw new Error("WhatsApp API failed");
                        }
                        
                        const downloadUrl = whatsappRes[selectedFormat.replace('p', '')];
                        
                        // React ⬆️ before uploading
                        await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
                        
                        // WhatsApp සඳහා optimized metadata සමග send කරන්න
                        await conn.sendMessage(senderID, {
                            video: { 
                                url: downloadUrl 
                            },
                            mimetype: "video/mp4",
                            caption: `*${data.title}*\n📊 Quality: ${selectedFormat}\n✅ WhatsApp Compatible`,
                            // WhatsApp වීඩියෝ සඳහා required parameters
                            ptt: false,
                            gifPlayback: false,
                            // සුළු file size සහිතව
                            fileLength: 104857600, // 100MB max
                            seconds: data.duration.seconds || 300
                        }, { quoted: receivedMsg });
                        
                        // React ✅ after upload complete
                        await conn.sendMessage(senderID, { react: { text: '✔️', key: receivedMsg.key } });
                        
                    } catch (whatsappError) {
                        console.error("WhatsApp API Error:", whatsappError);
                        // Backup API භාවිතා කරන්න
                        await conn.sendMessage(senderID, { react: { text: '🔄', key: receivedMsg.key } });
                        
                        // Fallback to regular API with WhatsApp compatible settings
                        const backupUrl = `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=${selectedFormat.replace('p', '')}&apikey=YOU_API_KEY`;
                        
                        const { data: backupRes } = await axios.get(backupUrl);
                        
                        if (!backupRes?.status || !backupRes.result?.download) {
                            await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                            return reply(`❌ Unable to download WhatsApp compatible ${selectedFormat} version.`);
                        }
                        
                        const result = backupRes.result;
                        
                        // React ⬆️ before uploading
                        await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
                        
                        await conn.sendMessage(senderID, {
                            video: { url: result.download },
                            mimetype: "video/mp4",
                            caption: `*${data.title}*\n📊 Quality: ${selectedFormat}\n⏱️ Duration: ${data.timestamp}`,
                            ptt: false,
                            gifPlayback: false
                        }, { quoted: receivedMsg });
                        
                        // React ✅ after upload complete
                        await conn.sendMessage(senderID, { react: { text: '✔️', key: receivedMsg.key } });
                    }
                    
                } else if (receivedText.trim().toUpperCase() === "1.2" || receivedText.trim().toUpperCase() === "2.2") {
                    // Ominisave API භාවිතා කරන්න
                    const ominisaveUrl = `https://ominisave.vercel.app/api/ytmp4?url=${encodeURIComponent(ytUrl)}`;
                    
                    try {
                        const { data: apiRes } = await axios.get(ominisaveUrl);
                        
                        if (!apiRes?.status || !apiRes.result?.url) {
                            await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                            return reply(`❌ Ominisave API failed. Try another option!`);
                        }
                        
                        const downloadUrl = apiRes.result.url;
                        const filename = apiRes.result.filename || `${data.title}.mp4`;
                        
                        // React ⬆️ before uploading
                        await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
                        
                        if (isDocument) {
                            await conn.sendMessage(senderID, {
                                document: { url: downloadUrl },
                                mimetype: "video/mp4",
                                fileName: filename
                            }, { quoted: receivedMsg });
                        } else {
                            await conn.sendMessage(senderID, {
                                video: { url: downloadUrl },
                                mimetype: "video/mp4",
                                caption: `*${data.title}*\n📊 Quality: ${selectedFormat}\n⏱️ Duration: ${data.timestamp}`,
                                ptt: false,
                                gifPlayback: false
                            }, { quoted: receivedMsg });
                        }
                        
                        // React ✅ after upload complete
                        await conn.sendMessage(senderID, { react: { text: '✔️', key: receivedMsg.key } });
                        
                    } catch (error) {
                        console.error("Ominisave API Error:", error);
                        await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                        return reply("❌ Error downloading from Ominisave API.");
                    }
                } else {
                    // අනෙක් quality වලට පැරණි API එකම භාවිතා කරන්න
                    try {
                        const formats = {
                            "240p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=240&apikey=YOU_API_KEY`,
                            "360p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=360&apikey=YOU_API_KEY`,
                            "480p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=480&apikey=YOU_API_KEY`,
                            "720p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=720&apikey=YOU_API_KEY`
                        };

                        const { data: apiRes } = await axios.get(formats[selectedFormat]);

                        if (!apiRes?.status || !apiRes.result?.download) {
                            await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                            return reply(`❌ Unable to download the ${selectedFormat} version. Try another one!`);
                        }

                        const result = apiRes.result;

                        // React ⬆️ before uploading
                        await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

                        if (isDocument) {
                            await conn.sendMessage(senderID, {
                                document: { url: result.download },
                                mimetype: "video/mp4",
                                fileName: `${data.title} - ${selectedFormat}.mp4`
                            }, { quoted: receivedMsg });
                        } else {
                            await conn.sendMessage(senderID, {
                                video: { url: result.download },
                                mimetype: "video/mp4",
                                caption: `*${data.title}*\n📊 Quality: ${selectedFormat}\n⏱️ Duration: ${data.timestamp}`,
                                ptt: false,
                                gifPlayback: false
                            }, { quoted: receivedMsg });
                        }

                        // React ✅ after upload complete
                        await conn.sendMessage(senderID, { react: { text: '✔️', key: receivedMsg.key } });
                        
                    } catch (error) {
                        console.error("API Error:", error);
                        await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                        return reply("❌ An error occurred while downloading.");
                    }
                }
            }
        });

    } catch (error) {
        console.error("Video Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
