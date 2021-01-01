const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const fs = require('fs-extra');
const database = require('./database');
const config = require('./config.json');
const xmlParser = require('xml2json');
const request = require("request");
const moment = require('moment');
const { USER } = require('./models/user');
let TGA = require('tga');
let pako = require('pako');
let PNG = require('pngjs').PNG;

let methods = {
    create_user: function(pid, experience, notifications) {
        return new Promise(function(resolve, reject) {
            console.log('running me');
            database.connect().then(async yeet => {
                    await request({
                        url: "http://" + config.account_server_domain + "/v1/api/miis?pids=" + pid,
                        headers: {
                            'X-Nintendo-Client-ID': config["X-Nintendo-Client-ID"],
                            'X-Nintendo-Client-Secret': config["X-Nintendo-Client-Secret"]
                        }
                    }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            let xml = xmlParser.toJson(body, {object: true});
                            //console.log(xml);
                            //console.log(xml.miis.mii.images.image[0].cached_url);
                            const newUsr = {
                                pid: pid,
                                created_at: moment().format('YYYY-MM-DD HH:mm:SS'),
                                user_id: xml.miis.mii.user_id,
                                account_status: 0,
                                mii: xml.miis.mii.data,
                                mii_face_url: xml.miis.mii.images.image[0].cached_url,
                                pfp_uri: "data:image/png;base64,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",
                                game_skill: experience,
                                notifications: notifications,
                                official: false
                            };
                            const newUsrObj = new USER(newUsr);
                            //console.log(newUsrObj);
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
    processUser: function(pid) {
        return new Promise(function(resolve, reject) {
            console.log('running me');
            database.connect().then(async yeet => {
                let userObject = await database.getUserByPID(pid);
                console.log(userObject);
                if(userObject != null)
                    resolve(userObject);
                else
                {
                    console.log('else');
                    await request({
                        url: "http://account.jemverse.xyz/v1/api/miis?pids=" + pid,
                        headers: {
                            'X-Nintendo-Client-ID': 'a2efa818a34fa16b8afbc8a74eba3eda',
                            'X-Nintendo-Client-Secret': 'c91cdb5658bd4954ade78533a339cf9a'
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
                                official: false
                            };
                            const newUsrObj = new USER(newUsr);
                            console.log(newUsrObj);
                            newUsrObj.save();
                            resolve(newUsr);
                        }
                        else
                        {
                            console.log('fail');
                            reject();
                        }

                    });

                }

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
        const hashed = crypto.createHash('sha256').update(unpacked).digest().toString('hex');

        return hashed;
    },
};
exports.data = methods;