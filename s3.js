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
        Bucket: 'hey-berlin-get-bigger-bins',
        ACL: 'public-read', // access control list, tells amazon to make file publically available
        Key: filename,
        Body: fs.createReadStream(path), // amazon will pipe the stream for us
        ContentType: mimetype,
        ContentLength: size,
    })
        .promise()
        .then(() => {
            console.log('It worked in S3!');
            next();
        })
        .catch((err) => {
            console.log('Uh oh! Error in putObject: ', err);
            res.sendStatus(500); // it's ajax so send a status code
        });
};

exports.delete = (req, res, next) => {
    const { filename } = req.body;

    if (req.body.filename === '') {
        console.log("req.body.filename is empty and we can't continue!");
        return res.sendStatus(500);
    }
    s3.deleteObject({
        Bucket: 'spicedling',
        Key: filename,
    })
        .promise()
        .then(() => {
            console.log('File was deleted from AWS!!');
            next();
        })
        .catch((err) => {
            console.log('Uh oh! Error in deleteObject: ', err);
            res.sendStatus(500); // it's ajax so send a status code
        });
};

// bonus to delete images
// would use s3 delete Object
