const shortcodes = require('../assets/emoji-shortcodes.json');

const emoji = {
    autocomplete: [],
    lookup: {
        shortcodes: {},
        unicode: {},
    }
}

/*
    Usage borrowed from: https://github.com/twitter/twemoji
*/
function toTwemojiUrl(unicode) {

    if(unicode.indexOf('\u200D') < 0) {
        unicode = unicode.replace(/\uFE0F/, '');
    }

    var r = [];
    var c = 0;
    var p = 0;
    var i = 0;

    while (i < unicode.length) {
      c = unicode.charCodeAt(i++);
      if (p) {
        r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
        p = 0;
      } else if (0xD800 <= c && c <= 0xDBFF) {
        p = c;
      } else {
        r.push(c.toString(16));
      }
    }
    return r.join('-');
}

Object.keys(shortcodes).forEach(k => {
    const e = {
        type: 'emoji',
        colons: `:${k}:`,
        emoji: shortcodes[k],
        src: `./assets/emoji/${toTwemojiUrl(shortcodes[k])}.png`,
    }
    emoji.autocomplete.push([`:${k}:`, `:${k}:`]);
    emoji.lookup.shortcodes[`:${k}:`] = e;
    emoji.lookup.unicode[shortcodes[k]] = e;
});

export class EmojiService {
    public static lookup = emoji.lookup;
    public static autocomplete = emoji.autocomplete;
}
