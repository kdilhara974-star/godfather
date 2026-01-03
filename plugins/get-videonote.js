const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

cmd({
  pattern: "getvnote",
  alias: ["gvn"],
  desc: "Convert video to WhatsApp Video Note",
  category: "owner",
  react: "🎥",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    let buffer;

    if (m.quoted && m.quoted.mtype === "videoMessage") {
      buffer = await m.quoted.download();
    } else if (q) {
      const res = await fetch(q);
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      return reply("⚠️ Video ekakata reply karanna naththang URL ekak denna");
    }

    const inPath = path.join(__dirname, `../temp/in_${Date.now()}.mp4`);
    const outPath = path.join(__dirname, `../temp/out_${Date.now()}.mp4`);
    fs.writeFileSync(inPath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inPath)
        .outputOptions([
          "-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512",
          "-c:v libx264",
          "-profile:v baseline",
          "-level 3.0",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-c:a aac",
          "-b:a 128k",
          "-shortest"
        ])
        .on("end", resolve)
        .on("error", err => reject(err))
        .save(outPath);
    });

    await conn.sendMessage(from, {
      video: fs.readFileSync(outPath),
      mimetype: "video/mp4",
      ptv: true,
    }, { quoted: mek });

    fs.unlinkSync(inPath);
    fs.unlinkSync(outPath);

  } catch (e) {
    console.error("FFMPEG ERROR:", e);
    reply("❌ Video Note convert fail una. FFmpeg check karanna.");
  }
});
