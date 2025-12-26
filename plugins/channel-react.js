const _0x28e17f = function () {
  let _0x418ead = true;
  return function (_0x417d34, _0x265088) {
    const _0x487c49 = _0x418ead ? function () {
      if (_0x265088) {
        const _0x4454e3 = _0x265088.apply(_0x417d34, arguments);
        _0x265088 = null;
        return _0x4454e3;
      }
    } : function () {};
    _0x418ead = false;
    return _0x487c49;
  };
}();
const _0x3e7a9b = _0x28e17f(this, function () {
  return _0x3e7a9b.toString().search("(((.+)+)+)+$").toString().constructor(_0x3e7a9b).search("(((.+)+)+)+$");
});
_0x3e7a9b();
const {
  cmd
} = require("../command");
const _0x49392a = {
  a: "🅐",
  b: "🅑",
  c: "🅒",
  d: "🅓",
  e: "🅔",
  f: "🅕",
  g: "🅖",
  h: "🅗",
  i: "🅘",
  j: "🅙",
  k: "🅚",
  l: "🅛",
  m: "🅜",
  n: "🅝",
  o: "🅞",
  p: "🅟",
  q: "🅠",
  r: "🅡",
  s: "🅢",
  t: "🅣",
  u: "🅤",
  v: "🅥",
  w: "🅦",
  x: "🅧",
  y: "🅨",
  z: "🅩",
  "0": "⓿",
  "1": "➊",
  "2": "➋",
  "3": "➌",
  "4": "➍",
  "5": "➎",
  "6": "➏",
  "7": "➐",
  "8": "➑",
  "9": "➒"
};
const _0xd4fd14 = {
  "pattern": "chr",
  "alias": ["creact"],
  "react": "🔤",
  "desc": "React to channel messages with stylized text",
  "category": "owner",
  use: ".chr <channel-link> <text>",
  "filename": __filename
};
cmd(_0xd4fd14, async (_0x93e7b7, _0x55dc60, _0x5d52de, {
  from: _0x24009,
  quoted: _0x1c2c88,
  body: _0x167f09,
  isCmd: _0x20ab34,
  command: _0x3a0bbd,
  args: _0x4d1243,
  q: _0x4af22f,
  isGroup: _0x3efe21,
  sender: _0xd74c1b,
  senderNumber: _0x582723,
  botNumber2: _0x5b5e30,
  botNumber: _0x2c33d0,
  pushname: _0x1818d6,
  isMe: _0x51b154,
  isCreator: _0x12df73,
  groupMetadata: _0x3a7d18,
  groupName: _0x38f531,
  participants: _0xcf10e8,
  groupAdmins: _0x1a0311,
  isBotAdmins: _0x3a4f5f,
  isAdmins: _0x14d74f,
  reply: _0x5e2556
}) => {
  try {
    if (!_0x12df73) {
      return _0x5e2556("❌ Owner only command");
    }
    if (!_0x4af22f) {
      return _0x5e2556("Usage:\n" + _0x3a0bbd + " https://whatsapp.com/channel/1234567890 hello");
    }
    const [_0x388e7d, ..._0x3a88fb] = _0x4af22f.split(" ");
    if (!_0x388e7d.includes("whatsapp.com/channel/")) {
      return _0x5e2556("Invalid channel link format");
    }
    const _0x5ec723 = _0x3a88fb.join(" ").toLowerCase();
    if (!_0x5ec723) {
      return _0x5e2556("Please provide text to convert");
    }
    const _0x36e2d9 = _0x5ec723.split('').map(_0x546c02 => {
      if (_0x546c02 === " ") {
        return "―";
      }
      return _0x49392a[_0x546c02] || _0x546c02;
    }).join('');
    const _0x4e055d = _0x388e7d.split("/")[4];
    const _0x4acdbd = _0x388e7d.split("/")[5];
    if (!_0x4e055d || !_0x4acdbd) {
      return _0x5e2556("Invalid link - missing IDs");
    }
    const _0x145682 = await _0x93e7b7.newsletterMetadata("invite", _0x4e055d);
    await _0x93e7b7.newsletterReactMessage(_0x145682.id, _0x4acdbd, _0x36e2d9);
    return _0x5e2556("╭━━━〔 *RANUMITHA-X-MD* 〕━━━┈⊷\n┃▸ *Success!* Reaction sent\n┃▸ *Channel:* " + _0x145682.name + "\n┃▸ *Reaction:* " + _0x36e2d9 + "\n╰────────────────┈⊷\n> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛");
  } catch (_0x19d434) {
    console.error(_0x19d434);
    _0x5e2556("❎ Error: " + (_0x19d434.message || "Failed to send reaction"));
  }
});
