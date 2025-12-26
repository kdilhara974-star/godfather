const { cmd } = require("../command");

cmd({
  pattern: "rch",
  react: "🤖",
  desc: "React to quoted message (REAL reaction)",
  category: "tools",
  use: "Reply to a message with: .rch 💛",
  filename: __filename
},
async (conn, mek, m, { from }) => {

  const reply = (text) =>
    conn.sendMessage(from, { text }, { quoted: m });

  // emoji get
  const body =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    "";

  const emoji = body.split(" ").slice(1).join(" ") || "💛";

  // check quoted message
  const quoted =
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  const quotedKey =
    m.message?.extendedTextMessage?.contextInfo?.stanzaId;

  const participant =
    m.message?.extendedTextMessage?.contextInfo?.participant;

  if (!quoted || !quotedKey) {
    return reply("❌ Channel post / message එක reply කරලා `.rch 💛` use කරන්න");
  }

  // REAL reaction
  await conn.sendMessage(from, {
    react: {
      text: emoji,
      key: {
        remoteJid: from,
        fromMe: false,
        id: quotedKey,
        participant: participant || from
      }
    }
  });

  return reply(
`🤖 *REACTION SENT (REAL)*
━━━━━━━━━━━━━━
😀 Emoji: ${emoji}
✅ Status: Done`
  );
});
