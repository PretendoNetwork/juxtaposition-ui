const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const fs = require('fs-extra');
const database = require('./database');
const logger = require('./logger');
const config = require('./config.json');
const xmlParser = require('xml2json');
const request = require("request");
const moment = require('moment');
const { USER } = require('./models/user');
const translations = require('./translations')
var HashMap = require('hashmap');
let TGA = require('tga');
let pako = require('pako');
let PNG = require('pngjs').PNG;

let communityMap = new HashMap();
let userMap = new HashMap();

nameCache();

function nameCache() {
    database.connect().then(async e => {
        let communities = await database.getCommunities();
        if(communities !== null) {
            for(let i = 0; i < communities.length; i++ ) {
                if(communities[i].title_id !== null) {
                    for(let j = 0; j < communities[i].title_id.length; j++) {
                        communityMap.set(communities[i].title_id[j], communities[i].name);
                        communityMap.set(communities[i].title_id[j] + '-id', communities[i].community_id);
                    }
                    communityMap.set(communities[i].community_id, communities[i].name);
                }
            }
        }
        logger.success('Created community index')
        let users = await database.getUsers(1000);
        if(users !== null) {
            for(let i = 0; i < users.length; i++ ) {
                if(users[i].pid !== null) {
                    userMap.set(users[i].pid.toString(), users[i].user_id);
                }
            }
        }
        logger.success('Created user index of ' + users.length + ' user(s)')

    }).catch(error => {
        logger.error(error);
    });
}

let methods = {
    create_user: function(pid, experience, notifications, region) {
        return new Promise(function(resolve, reject) {
            database.connect().then(async fun => {
                    await request({
                        url: "http://" + config.account_server_domain + "/v1/api/miis?pids=" + pid,
                        headers: {
                            'X-Nintendo-Client-ID': config["X-Nintendo-Client-ID"],
                            'X-Nintendo-Client-Secret': config["X-Nintendo-Client-Secret"]
                        }
                    }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            let xml = xmlParser.toJson(body, {object: true});
                            const newUsr = {
                                pid: pid,
                                created_at: moment().format('YYYY-MM-DD HH:mm:SS'),
                                user_id: xml.miis.mii.user_id,
                                account_status: 0,
                                mii: xml.miis.mii.data,
                                game_skill: experience,
                                notifications: notifications,
                                official: false,
                                country: region,
                            };
                            const newUsrObj = new USER(newUsr);
                            newUsrObj.save();
                            resolve(newUsr);
                        }
                        else
                        {
                            console.log('fail');
                            reject();
                        }

                    });

            });
        });
    },
    decodeParamPack: function (paramPack) {
        /*  Decode base64 */
        let dec = Buffer.from(paramPack, "base64").toString("ascii");
        /*  Remove starting and ending '/', split into array */
        dec = dec.slice(1, -1).split("\\");
        /*  Parameters are in the format [name, val, name, val]. Copy into out{}. */
        const out = {};
        for (let i = 0; i < dec.length; i += 2) {
            out[dec[i].trim()] = dec[i + 1].trim();
        }
        return out;
    },
    processServiceToken: function(token) {
        try
        {
            let B64token = Buffer.from(token, 'base64');
            let decryptedToken = this.decryptToken(B64token);
            return decryptedToken.readUInt32LE(0x2);
        }
        catch(e)
        {
            return null;
        }

    },
    decryptToken: function(token) {

        // Access and refresh tokens use a different format since they must be much smaller
        // Assume a small length means access or refresh token
        if (token.length <= 32) {
            const cryptoPath = `${__dirname}/../certs/access`;
            const aesKey = Buffer.from(fs.readFileSync(`${cryptoPath}/aes.key`, { encoding: 'utf8' }), 'hex');

            const iv = Buffer.alloc(16);

            const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);

            let decryptedBody = decipher.update(token);
            decryptedBody = Buffer.concat([decryptedBody, decipher.final()]);

            return decryptedBody;
        }
        const cryptoPath = `${__dirname}/certs/access`;

        const cryptoOptions = {
            private_key: fs.readFileSync(`${cryptoPath}/private.pem`),
            hmac_secret: config.account_server_secret
        };

        const privateKey = new NodeRSA(cryptoOptions.private_key, 'pkcs1-private-pem', {
            environment: 'browser',
            encryptionScheme: {
                'hash': 'sha256',
            }
        });

        const cryptoConfig = token.subarray(0, 0x90);
        const signature = token.subarray(0x90, 0xA4);
        const encryptedBody = token.subarray(0xA4);

        const encryptedAESKey = cryptoConfig.subarray(0, 128);
        const iv = cryptoConfig.subarray(128);

        const decryptedAESKey = privateKey.decrypt(encryptedAESKey);

        const decipher = crypto.createDecipheriv('aes-128-cbc', decryptedAESKey, iv);

        let decryptedBody = decipher.update(encryptedBody);
        decryptedBody = Buffer.concat([decryptedBody, decipher.final()]);
        const hmac = crypto.createHmac('sha1', cryptoOptions.hmac_secret).update(decryptedBody);
        const calculatedSignature = hmac.digest();
        if (!calculatedSignature.equals(signature)) {
            console.log('Token signature did not match');
            return null;
        }
        return decryptedBody;
    },
    processPainting: function (painting) {
        let paintingBuffer = Buffer.from(painting, 'base64');
        let output = '';
        try
        {
            output = pako.inflate(paintingBuffer);
        }
        catch (err)
        {
            console.error(err);
        }
        let tga = new TGA(Buffer.from(output));
        let png = new PNG({
            width: tga.width,
            height: tga.height
        });
        png.data = tga.pixels;
        let pngBuffer = PNG.sync.write(png);
        return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    },
    nintendoPasswordHash: function(password, pid) {
        const pidBuffer = Buffer.alloc(4);
        pidBuffer.writeUInt32LE(pid);

        const unpacked = Buffer.concat([
            pidBuffer,
            Buffer.from('\x02\x65\x43\x46'),
            Buffer.from(password)
        ]);
        return crypto.createHash('sha256').update(unpacked).digest().toString('hex');
    },
    getCommunityHash: function() {
        return communityMap;
    },
    getUserHash: function() {
        return userMap;
    },
    refreshCache: function () {
      nameCache();
    },
    resizeImage: function (file, width, height) {
        sharp(file)
            .resize({ height: height, width: width })
            .toBuffer()
            .then(data => {
                return data;
            });
    },
    processLanguage: function (header) {
        if(!header)
            return translations.EN;
        let paramPackData = this.decodeParamPack(header);
        console.log(paramPackData.language_id)
        switch (paramPackData.language_id) {
            case '0':
                return translations.JA
            case '1':
                return translations.EN
            case '2':
                return translations.FR
            case '3':
                return translations.DE
            case '4':
                return translations.IT
            case '5':
                return translations.ES
            case '6':
                return translations.ZH
            case '7':
                return translations.KO
            case '8':
                return translations.NL
            case '9':
                return translations.PT
            case '10':
                return translations.RU
            case '11':
                return translations.ZH
            default:
                return translations.EN
        }
    }
};
exports.data = methods;