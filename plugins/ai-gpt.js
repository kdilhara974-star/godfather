const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "gpt",
    alias: ["chatgpt","openai","ai2"],
    desc: "Chat with GPT AI",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args }) => {
    try {

        // ✅ Get text from args first
        let userText = args.join(" ");

        // ✅ If no args, check replied message
        if (!userText && mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

            const quoted =
                mek.message.extendedTextMessage.contextInfo.quotedMessage;

            userText =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                "";
        }

        // ❌ If still empty
        if (!userText) {
            return conn.sendMessage(from, {
                text: "🧠 Please provide a message.\n\nExample:\n.gpt Hello\nOR\nReply to a message and type .gpt"
            }, { quoted: mek });
        }

        // ⏳ loading react
        await conn.sendMessage(from, {
            react: { text: "⏳", key: mek.key }
        });

        const apiUrl = `https://malvin-api.vercel.app/ai/gpt-5?text=${encodeURIComponent(userText)}`;

        const { data } = await axios.get(apiUrl);

        if (!data?.result) {
            throw new Error("No AI response");
        }

        await conn.sendMessage(from, {
            text: `🤖 *GPT-5 AI Response*\n\n${data.result}`
        }, { quoted: mek });

        // ✅ success react
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (err) {
        console.log(err);

        await conn.sendMessage(from, {
            react: { text: "❌", key: mek.key }
        });

        conn.sendMessage(from, {
            text: "Error communicating with AI."
        }, { quoted: mek });
    }
});
