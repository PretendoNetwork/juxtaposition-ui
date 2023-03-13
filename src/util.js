const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const fs = require('fs-extra');
const { isAfter, subHours } = require("date-fns");
const database = require('./database');
const logger = require('./logger');
const config = require('../config.json');
const { SETTINGS } = require('./models/settings');
const { CONTENT } = require('./models/content');
const { NOTIFICATION } = require('./models/notifications');
const translations = require('./translations')
const HashMap = require('hashmap');
const TGA = require('tga');
const pako = require('pako');
const PNG = require('pngjs').PNG;
const bmp = require("bmp-js");
const aws = require('aws-sdk');
let communityMap = new HashMap();
let userMap = new HashMap();

const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: config.aws.spaces.key,
    secretAccessKey: config.aws.spaces.secret
});

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
        logger.success('Created community index of ' + communities.length + ' communities')
        let users = await database.getUsersSettings(-1);
        if(users !== null) {
            for(let i = 0; i < users.length; i++ ) {
                if(users[i].pid !== null) {
                    userMap.set(users[i].pid.toString(), users[i].screen_name);
                }
            }
        }
        logger.success('Created user index of ' + users.length + ' users')

    }).catch(error => {
        logger.error(error);
    });
}

let methods = {
    create_user: async function(pid, experience, notifications, region) {
        const pnid = await database.getPNID(pid);
        if(!pnid)
            return;
        let newSettings = {
            pid: pid,
            screen_name: pnid.mii.name,
            game_skill: experience,
            receive_notifications: notifications,
        }
        let newContent = {
            pid: pid
        }
        const newSettingsObj = new SETTINGS(newSettings);
        await newSettingsObj.save();

        const newContentObj = new CONTENT(newContent);
        await newContentObj.save();

        this.setName(pid, pnid.mii.name);
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
    unpackToken: function(token) {
        return {
            system_type: token.readUInt8(0x0),
            token_type: token.readUInt8(0x1),
            pid: token.readUInt32LE(0x2),
            access_level: token.readUInt8(0x6),
            title_id: token.readBigUInt64LE(0x7), // always 0 here
            expire_time: token.readBigUInt64LE(0xF)
        }
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
            let tga;
            try {
                tga = new TGA(Buffer.from(output));
            }
            catch (e) {
                console.log(e)
                return null;
            }
            let png = new PNG({
                width: tga.width,
                height: tga.height
            });
            png.data = tga.pixels;
            return PNG.sync.write(png);
            //return `data:image/png;base64,${pngBuffer.toString('base64')}`;
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
    setName: function (pid, name) {
        if(!pid || !name)
            return;
        userMap.delete(pid);
        userMap.set(pid, name);
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
    },
    uploadCDNAsset: async function(bucket, key, data, acl) {
        const awsPutParams = {
            Body: data,
            Key: key,
            Bucket: bucket,
            ACL: acl
        };

        await s3.putObject(awsPutParams).promise();
    },
    newNotification: async function(notification) {
        if(notification.type === 'follow') {
            // { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
            let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID })
            if(existingNotification) {
                existingNotification.lastUpdated = new Date();
                return await existingNotification.save();
            }
            existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'follow' });
            if(existingNotification) {
                existingNotification.users.push({
                    user: notification.objectID,
                    timeStamp: new Date()
                });
                existingNotification.lastUpdated = new Date();
                existingNotification.link = notification.link;
                existingNotification.objectID = notification.objectID;
                return await existingNotification.save();
            }
            else {
                let newNotification = new NOTIFICATION({
                    pid: notification.pid,
                    type: notification.type,
                    users: [{
                        user: notification.objectID,
                        timestamp: new Date()
                    }],
                    link: notification.link,
                    objectID: notification.objectID,
                    read: false,
                    lastUpdated: new Date()
                });
                await newNotification.save();
            }
        }
        /*else if(notification.type === 'yeah') {
            // { pid: userToFollowContent.pid, type: "follow", objectID: req.pid, link: `/users/${req.pid}` }
            let existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, objectID: notification.objectID })
            if(existingNotification) {
                existingNotification.lastUpdated = new Date();
                return await existingNotification.save();
            }
            existingNotification = await NOTIFICATION.findOne({ pid: notification.pid, type: 'yeah' });
            if(existingNotification) {
                existingNotification.users.push({
                    user: notification.objectID,
                    timeStamp: new Date()
                });
                existingNotification.lastUpdated = new Date();
                existingNotification.link = notification.link;
                existingNotification.objectID = notification.objectID;
                return await existingNotification.save();
            }
            else {
                let newNotification = new NOTIFICATION({
                    pid: notification.pid,
                    type: notification.type,
                    users: [{
                        user: notification.objectID,
                        timestamp: new Date()
                    }],
                    link: notification.link,
                    objectID: notification.objectID,
                    read: false,
                    lastUpdated: new Date()
                });
                await newNotification.save();
            }
        }*/
    }
};
exports.data = methods;
