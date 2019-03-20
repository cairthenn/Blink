const shortcodes = require('../assets/emoji-data.json');

const emoji = {
    autocomplete: [],
    lookup: {
        shortcodes: {},
        unicode: {},
    },
    menu: {
      categoryNames: [
        'Smileys & People', 
        'Animals & Nature',
        'Food & Drink',
        'Travel & Places', 
        'Activities', 
        'Objects', 
        'Symbols', 
        'Flags'
      ],
      'Smileys & People': [],
      'Animals & Nature': [],
      'Food & Drink': [],
      'Travel & Places': [],
      'Activities': [],
      'Objects': [],
      'Symbols':[],
      'Flags': [],
    },
};

/*
    Usage borrowed from: https://github.com/twitter/twemoji
*/
function toTwemojiUrl(unicode) {

    if (unicode.indexOf('\u200D') < 0) {
        unicode = unicode.replace(/\uFE0F/, '');
    }

    const r = [];
    let c = 0;
    let p = 0;
    let i = 0;

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
        colons: shortcodes[k].colons,
        code: shortcodes[k].code,
        src: `./assets/emoji/${toTwemojiUrl(shortcodes[k].code)}.png`,
    };
    emoji.autocomplete.push([shortcodes[k].colons, shortcodes[k].colons]);
    emoji.lookup.shortcodes[shortcodes[k].colons] = e;
    emoji.lookup.unicode[shortcodes[k].code] = e;
    
    const category = emoji.menu[shortcodes[k].category];
    if(category) {
      category.push(e);
    }
});

export class EmojiService {
    public static lookup = emoji.lookup;
    public static autocomplete = emoji.autocomplete;
    public static menu = emoji.menu;
}
