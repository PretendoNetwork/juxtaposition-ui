const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const fs = require('fs-extra');
const database = require('./database');
const logger = require('./logger');
const config = require('./config.json');
const { USER } = require('./models/user');
const translations = require('./translations')
var HashMap = require('hashmap');
let TGA = require('tga');
let pako = require('pako');
let PNG = require('pngjs').PNG;
var bmp = require("bmp-js");
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
    create_user: async function(pid, experience, notifications, region) {
        const pnid = await database.getPNID(pid);
        if(!pnid)
            return;
        const newUsr = {
            pid: pid,
            created_at: new Date(),
            user_id: pnid.mii.name,
            pnid: pnid.username,
            birthday: new Date(pnid.birthdate),
            account_status: 0,
            mii: pnid.mii.data,
            game_skill: experience,
            notifications: notifications,
            official: pnid.access_level === 3,
            country: region,
        };
        const newUsrObj = new USER(newUsr);
        await newUsrObj.save();
        console.log(newUsrObj);
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
            //console.log(e)
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

        const cryptoConfig = token.subarray(0, 0x82);
        const signature = token.subarray(0x82, 0x96);
        const encryptedBody = token.subarray(0x96);

        const encryptedAESKey = cryptoConfig.subarray(0, 128);
        const point1 = cryptoConfig.readInt8(0x80);
        const point2 = cryptoConfig.readInt8(0x81);

        const iv = Buffer.concat([
            Buffer.from(encryptedAESKey.subarray(point1, point1 + 8)),
            Buffer.from(encryptedAESKey.subarray(point2, point2 + 8))
        ]);

        const decryptedAESKey = privateKey.decrypt(encryptedAESKey);

        const decipher = crypto.createDecipheriv('aes-128-cbc', decryptedAESKey, iv);

        let decryptedBody = decipher.update(encryptedBody);
        decryptedBody = Buffer.concat([decryptedBody, decipher.final()]);

        const hmac = crypto.createHmac('sha1', cryptoOptions.hmac_secret).update(decryptedBody);
        const calculatedSignature = hmac.digest();

        if (Buffer.compare(calculatedSignature, signature) !== 0) {
            console.log('Token signature did not match');
            return null;
        }

        return decryptedBody;
    },
    processPainting: async function (painting, isTGA) {
        if (isTGA) {
            let paintingBuffer = Buffer.from(painting, 'base64');
            let output = '';
            try {
                output = pako.inflate(paintingBuffer);
            } catch (err) {
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
        }
        else {
            let paintingBuffer = Buffer.from(painting, 'base64');
            let bitmap = bmp.decode(paintingBuffer)
            const tga = this.createBMPTgaBuffer(bitmap.width, bitmap.height, bitmap.data, false);

            let output;
            try
            {
                output = pako.deflate(tga, {level: 6});
            }
            catch (err)
            {
                console.error(err);
            }

            return new Buffer(output).toString('base64')
        }
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
    createBMPTgaBuffer: function(width, height, pixels, dontFlipY) {
    var buffer = Buffer.alloc(18 + pixels.length);
        // write header
        buffer.writeInt8(0, 0);
        buffer.writeInt8(0, 1);
        buffer.writeInt8(2, 2);
        buffer.writeInt16LE(0, 3);
        buffer.writeInt16LE(0, 5);
        buffer.writeInt8(0, 7);
        buffer.writeInt16LE(0, 8);
        buffer.writeInt16LE(0, 10);
        buffer.writeInt16LE(width, 12);
        buffer.writeInt16LE(height, 14);
        buffer.writeInt8(32, 16);
        buffer.writeInt8(8, 17);

        var offset = 18;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var idx = ((dontFlipY ? i : height - i - 1) * width + j) * 4;
                buffer.writeUInt8(pixels[idx + 1], offset++);    // b
                buffer.writeUInt8(pixels[idx + 2], offset++);    // g
                buffer.writeUInt8(pixels[idx + 3], offset++);    // r
                buffer.writeUInt8(255, offset++);          // a
            }
        }

        return buffer;
    },
    processLanguage: function (header) {
        if(!header)
            return translations.EN;
        let paramPackData = this.decodeParamPack(header);
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
