import { SettingsService } from './settings.service';
import dateformat from 'dateformat';
import { EmojiService } from './emoji.service';

function urlFragment(url) {
    return {
        type: 'url',
        text: url,
    };
}

function twitchEmoteFragment(id, name) {
    return {
        type: 'twitch',
        src: `https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0`,
        code: name,
    };
}

function usernameFragment(name: string) {
    return {
        type: 'username',
        name: name,
    };
}

function cheerFragment(name, spent, info) {
    
    const tier = Math.min(spent >= 10000 ? 4 :
        spent >= 5000 ? 3 :
        spent >= 1000 ? 2 :
        spent >= 100 ? 1 : 0, info.tiers.length - 1);
    const scale = info.scales.sort()[0];

    return {
        type: 'bits',
        name: name,
        amount: spent,
        lightColor: info.tiers[tier].color,
        darkColor: info.tiers[tier].color,
        dark: info.tiers[tier].images.dark.animated[scale],
        light: info.tiers[tier].images.light.animated[scale],
    };
}

function parseTwitchEmotes(str: string) {

    if (!str || !str.length) {
        return {};
    }

    return str.split('/').reduce((obj, item) => {

        const pair = item.split(':');
        pair[1].split(',').forEach(indicies => {
            const i = indicies.split('-').map(x => Number(x));
            obj[i[0]] = [ pair[0], i[1] ];
        });

        return obj;
    }, {});
}

function checkUrl(word) {
    const regex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9]{2,256}\.[A-Za-z]{2,6}/;
    return regex.test(word);
}

function checkBits(word: string) {
    return /([a-z]+)(\d+)/.exec(word);
}

function checkUsername(word: string) {
    return /@([a-zA-Z0-9_]+)/.exec(word);
}

export class Message {

    public id: string;
    public userId: string;
    public action: boolean;
    public highlight: boolean;
    public odd: boolean;
    public timestamp: string;
    public username: string;
    public lightColor: string;
    public darkColor: string;
    public badges: string[][];
    public level: number;
    public friend: boolean;
    public ignore: boolean;
    public chat: boolean;
    public fragments: any[];
    public text: string;
    public deleted: boolean;
    public status: boolean;


    constructor(name: string, text: string, action: boolean) {
        this.timestamp = dateformat(new Date(), 'hh:MM');
        this.username = name;
        this.text = text;
        this.action = action;
        this.fragments = [];
    }

    public static rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        const d = max - min;

        if (max === min) {
            return [d, d, l];
        }
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        let h;

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        return [h * 60, s * 100, l * 100];
    }

    public static colorCorrect(color: string) {

        if (!color) {
            return [undefined, undefined];
        }

        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);

        const hsl = Message.rgbToHsl(r, g, b);

        const hue = hsl[0];
        const lightSat = Math.min(40, hsl[1]);
        const lightLum = Math.min(50, hsl[2]);

        let darkLum = Math.max(hsl[2], 50);

        if (darkLum < 60 && hsl[0] > 196 && hsl[0] < 300) {
            darkLum += Math.sin((hue  - 196) / (300 - 196) * Math.PI) * hsl[1] * .4;
        }

        return [`hsl(${hue},${lightSat}%,${lightLum}%)`, `hsl(${hue},${hsl[1]}%,${darkLum}%)`];
    }

    public static parseBadges(str: string) {

        if (!str || !str.length) {
            return [];
        }

        return str.split(',').map(x => x.split('/'));

    }

    public static fromIncoming(text: string, params: any, emotes: any, cheers: any, settings: SettingsService) {

        
        const isAction = /\u0001ACTION (.*)\u0001$/.exec(text);
        if(isAction) {
            text = isAction[1];
        }

        const msg = new Message(params['display-name'], text, isAction && true);

        const lowerUsername = params['display-name'].toLowerCase();
        msg.friend = settings.friendList.find(x => x === lowerUsername) && true;
        msg.ignore = settings.ignoredUsers.find(x => x === lowerUsername) && true;

        if(!text || !text.length) {
            return msg;
        }

        msg.chat = true;
        msg.badges = this.parseBadges(params.badges);
        const colors = this.colorCorrect(params.color);
        msg.lightColor = colors[0];
        msg.darkColor = colors[1];

        const processWord = (arr: string[]) => {

            const word = arr.join('');

            const emoji = EmojiService.lookup.shortcodes[word];
            if(emoji) {
                return emoji;
            }

            const emote = emotes.lookup[word];
            if(emote && !emote.userOnly) {
                return emote;
            }

            const username = checkUsername(word);
            if(username) {
                return usernameFragment(username[1]);
            }

            if(checkUrl(word)) {
                return urlFragment(word);
            }

            const boundary = /.*\b/.exec(word);
            const lower = boundary ? boundary[0].toLowerCase() : word.toLowerCase();
            if(settings.blacklistWords.find(x => x === lower)) {
                msg.ignore = true;
            }

            if(settings.highlightWords.find(x => x === lower)) {
                msg.highlight = true;
            }

            if(params.bits) {
                const bits = checkBits(lower);
                if(bits && bits[1] in cheers) {
                    const spent = Number(bits[2]);
                    const info = cheers[bits[1]];
                    return cheerFragment(word, spent, info);
                }
            }

            return {
                type: 'text',
                text: word,
                lightColor: isAction ? colors[0] : undefined,
                darkColor: isAction ? colors[1] : undefined,
             };
        };
        
        
        let wordArr = [];
        const flush = () => {
            if(!wordArr.length) {
                return;
            }
            const fragment = processWord(wordArr);
            if (fragment) {
                msg.fragments.push(fragment);
            }
            wordArr = [];
        }

        const emoteLocations = parseTwitchEmotes(params.emotes);
        let cursor = 0;
        let twitchEmoteEnd = 0;
        let twitchEmote;

        Array.from(`${text} `).forEach(char => {
            if(twitchEmote) {
                wordArr.push(char);
                if(cursor === twitchEmoteEnd) {
                    const word = wordArr.join('');
                    msg.fragments.push(twitchEmoteFragment(twitchEmote[0], word));
                    wordArr = [];
                    twitchEmote = undefined;
                }
                cursor++;
                return;
            }
            const check = cursor++;
            if(check in emoteLocations) {
                wordArr.push(char);
                twitchEmote = emoteLocations[check];
                twitchEmoteEnd = twitchEmote[1];
                return;
            }

            const emoji = EmojiService.lookup.unicode[char];
            if(emoji) {
                flush();
                msg.fragments.push(emoji);
                return;
            } else if(char == ' ') {
                flush();
                return;
            }
            wordArr.push(char);
        });

        return msg;
    }

    public static fromOutgoing(name: string, text: string, colors: string[], badges, emotes: any, isAction: boolean) {
        
        const ircText = [];
        const fragments = [];
        let wordArr = [];

        const processWord = (arr: string[]) => {

            const word = arr.join('');

            const emoji = EmojiService.lookup.shortcodes[word];
            if(emoji) {
                ircText.push(`${emoji.emoji} `);
                return emoji;
            }

            const emote = emotes.lookup[word];
            if(emote) {
                ircText.push(`${word} `);
                return emote;
            }

            const username = checkUsername(word);
            if(username) {
                ircText.push(`${word} `);
                return usernameFragment(username[1]);
            }

            if(checkUrl(word)) {
                ircText.push(`${word} `);
                return urlFragment(word);
            }

            ircText.push(`${word} `);

            return {
                type: 'text',
                text: word,
                lightColor: isAction ? colors[0] : undefined,
                darkColor: isAction ? colors[1] : undefined,
             };
        };

        const flush = () => {
            if(!wordArr.length) {
                return;
            }
            const fragment = processWord(wordArr);
            if (fragment) {
                fragments.push(fragment);
            }
            wordArr = [];
        }

        Array.from(`${text} `).forEach(char => { 
            const emoji = EmojiService.lookup.unicode[char];
            if(emoji) {
                flush();
                ircText.push(`${char} `);
                fragments.push(emoji);
                return;
            } else if(char == ' ') {
                flush();
                return;
            }
            wordArr.push(char);
        });

        const message = new Message(name, ircText.join(''), isAction);
        message.chat = true;
        message.badges = badges;
        message.lightColor = colors[0];
        message.darkColor = colors[1];
        message.fragments = fragments;

        return message;
    }

    public static processNotice(params: any) {

        if (/^(?:sub|resub)$/.test(params['msg-id'])) {
            const months = params['msg-param-cumulative-months'];
            const shareStreak = params['msg-param-should-share-streak'] !== '0';
            const streakLength = params['msg-param-streak-months'];
            const plan = params['msg-param-sub-plan'];
            const isPrime = plan === 'Prime';
            const tier = isPrime ? 0 : plan / 1000;

            const tierMessage = isPrime ? 'with Twitch Prime' : `at Tier ${tier}`;
            const streakMessage = shareStreak ? `, currenlty on a ${streakLength} month streak` : '';
            const monthMessage = months > 1 ? ` They've subscribed for ${months} months${streakMessage}!` : '';
            const message = `subscribed ${tierMessage}.${monthMessage}`;

            return {
                subscription: true,
                subType: 0,
                prime: isPrime,
                subMessage: message,
            };

        } else if (/^(?:subgift|anonsubgift)$/.test(params['msg-id'])) {
            const tier = params['msg-param-sub-plan'] / 1000;
            const displayName = params['msg-param-recipient-display-name'];
            const totalSubs = Number(params['msg-param-sender-count']);
            const message = `gifted a Tier ${tier} subscription to`;
            const countMessage = totalSubs ? ((totalSubs === 1) ? ' This is their first gift subscription in the channel!'
                : ` They've gifted ${totalSubs} subscriptions in the channel!`) : '';

            return {
                subscription: true,
                subType: 1,
                recipient: displayName,
                subMessage: message,
                count: countMessage,
            };
        } else if (params['msg-id'] === 'submysterygift') {

            const tier = params['msg-param-sub-plan'] / 1000;
            const count = params['msg-param-mass-gift-count'];
            const totalSubs = Number(params['msg-param-sender-count']);
            const amountMessage = count > 1 ? `${count} Tier ${tier} subscriptions` : `a Tier ${tier} subscription`;
            const message = `is gifting ${amountMessage} to `;
            const countMessage = totalSubs ? ((totalSubs === 1) ? ' This is their first gift subscription in the channel!'
                : ` They've gifted ${totalSubs} subscriptions in the channel!`) : '';

            return {
                subscription: true,
                subType: 2,
                communityGift: true,
                subMessage: message,
                count: countMessage,
            };
        } else if (params['msg-id'] === 'raid') {
            return {
                raid: true,
                raider: params['msg-param-displayName'],
                viewers: params['msg-param-viewerCount'],
            };
        }

        return {
            notice: params['system-msg']
        };
    }
}