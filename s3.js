const aws = require('aws-sdk');
const fs = require('fs');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log("req.file is not there for some reason and we can't continue!");
        return res.sendStatus(500);
    }
    const { filename, mimetype, size, path } = req.file;
    // need to use s3 object in here
    // aws calls files objects and file names are keys
    s3.putObject({
        Bucket: 'spicedling',
        ACL: 'public-read', // access control list, tells amazon to make file publically available
        Key: filename,
        Body: fs.createReadStream(path), // amazon will pipe the stream for us
        ContentType: mimetype,
        ContentLength: size,
    })
        .promise()
        .then(() => {
            // what we get is a promise, not an object
            // assuming it works, we get here
            console.log('It worked!');
            next(); //because this is a middleware function
        })
        .catch((err) => {
            console.log('Uh oh! Error: ', err);
            res.sendStatus(500); // it's ajax so send a status code
        });
};

// bonus to delete images
// would use s3 delete Object
