// Copied from https://github.com/nailujx86/mcmotdparser to fix these issues:
// New line issue when using \n (line break) and returned "undefined" result
// Class issue for extra formatting for underlined and obfuscated
// Misc:
// Adds hex (hexadecimal) support
// Code clean up

const classes = {
    "bold": "mc_bold",
    "italic": "mc_italic",
    "underlined": "mc_underlined",
    "strikethrough": "mc_strikethrough",
    "obfuscated": "mc_obfuscated"
};

const colors = {
    '§0': 'black',
    '§1': 'dark_blue',
    '§2': 'dark_green',
    '§3': 'dark_aqua',
    '§4': 'dark_red',
    '§5': 'dark_purple',
    '§6': 'gold',
    '§7': 'gray',
    '§8': 'dark_gray',
    '§9': 'blue',
    '§a': 'green',
    '§b': 'aqua',
    '§c': 'red',
    '§d': 'light_purple',
    '§e': 'yellow',
    '§f': 'white',
};

const extras = {
    '§k': 'obfuscated',
    '§l': 'bold',
    '§m': 'strikethrough',
    '§n': 'underlined',
    '§o': 'italic'
};

function parseJsonToHTML(jsonPart) {
    let html = "";

    (Array.isArray(jsonPart) ? jsonPart : [jsonPart]).forEach(parsePart => {
        let classlist = "";
        let styleList = "";
        let text = "";

        for (const key of Object.keys(parsePart)) {
            if (key === "text") {
                text += parsePart.text;
                continue;
            }

            if (classes.hasOwnProperty(key)) {
                classlist += " " + classes[key];
                continue;
            }

            if (key === "color") {
                if (jsonPart[key].startsWith('#')) {
                    styleList += "color: " + parsePart[key];
                } else {
                    classlist += " mc_" + parsePart[key];
                }

                continue;
            }

            if (key === "extra") {
                for (const jsonPartExtra of parsePart.extra) {
                    text += parseJsonToHTML(jsonPartExtra);
                }
            }
        }

        html += `<span class="${classlist.trim()}" style="${styleList.trim()}">${text}</span>`;
    });

    return html;
}

function jsonToHtml(json, callback) {
    const promise = new Promise((resolve, _reject) => {
        try {
            json = JSON.parse(JSON.stringify(json));
        } catch (error) {
            console.log(error);
        }

        resolve("<div class=\"mc\">" + parseJsonToHTML(json) + "</div>");
    });

    if (callback && typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback);
    }

    return promise;
}

function textToJson(text, callback) {
    const promise = new Promise((resolve, _reject) => {
        text = text.replace(/\\r?\\n|\\n|\n/g, "§r<br />");

        let jsonObj = { text: "", extra: [] };
        let curObj = jsonObj;
        const arr = text.split("");

        for (let i = 0; i < arr.length; i++) {
            const one = arr[i];

            if (one === '#') {
                const from = i + 1;

                if (from < arr.length) {
                    const end = i + 7;
                    let hex = "";

                    for (let b = from; b < arr.length && b < end; b++) {
                        hex += arr[b];
                    }

                    if (/^[0-9A-F]{6}$/i.test(hex)) {
                        let innerObj = { text: "", extra: [] };

                        innerObj.color = '#' + hex;
                        curObj.extra.push(innerObj);
                        curObj = innerObj;

                        i += 6;
                    } else {
                        curObj.text += one;
                    }
                }
            } else if (one !== '§') {
                curObj.text += one;
            } else {
                const t = i + 1;
                const se = arr[t];
                let innerObj = { text: "", extra: [] };

                if (se === 'r') {
                    jsonObj.extra.push(innerObj);
                } else {
                    const codeStr = '§' + se;

                    if (colors.hasOwnProperty(codeStr)) {
                        innerObj.color = colors[codeStr];
                    }

                    if (extras.hasOwnProperty(codeStr)) {
                        innerObj[extras[codeStr]] = true;
                    }

                    curObj.extra.push(innerObj);
                }

                curObj = innerObj;
                i = t;
            }
        }

        resolve(jsonObj);
    });

    if (callback && typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback);
    }

    return promise;
}

function toHtml(motd, callback) {
    const promise = new Promise((resolve, reject) => {
        if (typeof motd === 'string') {
            return textToJson(motd)
                .then(jsonToHtml)
                .then(resolve)
                .catch(reject);
        } else if (typeof motd === 'object') {
            return jsonToHtml(motd)
                .then(resolve)
                .catch(reject);
        }
    })

    if (callback && typeof callback === 'function') {
        promise.then(callback.bind(null, null), callback);
    }

    return promise;
}

const _jsonToHtml = jsonToHtml;
export { _jsonToHtml as jsonToHtml };
const _parseJsonToHTML = parseJsonToHTML;
export { _parseJsonToHTML as parseJsonToHTML };
const _textToJson = textToJson;
export { _textToJson as textToJson };
const _toHtml = toHtml;
export { _toHtml as toHtml };
