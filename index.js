// SERVER
const express = require('express');
const app = express();
const multer = require('multer'); //npm package
const uidSafe = require('uid-safe'); //npm package
const path = require('path'); // core node module
const { s3Url } = require('./config');

app.use(express.static('./public'));
app.use(express.static('./sql'));

// BORROWED FROM PETITION
const bodyParser = require('body-parser');
const db = require('./sql/db');
const s3 = require('./s3');
app.use(bodyParser.urlencoded({ extended: false }));
// ---------------------------------------------------- //

// multer is in charge of saving files
// here we are telling it to upload to your files folder
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

// an object that has access to multer
const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get('/images', (req, res) => {
    console.log('get req for /images is working');
    // we send the data back as json and then vue figures out what to do with it
    db.selectImages()
        .then((result) => {
            console.log('res.rows: ', result.rows);
            let images = result.rows;
            res.json({
                images,
            });
        })
        .catch((err) => {
            console.log('err in selectImages: ', err);
        });
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    console.log('checking the post and uploader is working');
    console.log('file: ', req.file);
    console.log('input: ', req.body);

    const filename = req.file.filename;
    const url = `${s3Url}${filename}`;
    // now we want to insert into database
    // figure out the url
    // we need to put in the full url of the aws file and the req.body details
    // if something goes wrong in s3 then we DO NOT WANT a row in the body

    // what should be in the sent response?
    // should ordered in id chronological descendant
    // use unshift() - put in beginning of array
    // in axios when get result promise, wanna take the object we get back and unshift it

    if (req.file) {
        // you'll want to make a db insert for all the information
        db.addImage(url, req.body.title, req.body.desc, req.body.username).then(({ rows }) => {
            console.log('rows: ', rows);
            console.log('rows[0]: ', rows[0]);
            //res.json(rows[0]);
            res.json({
                image: rows[0],
            });
        });
        /* res.json({
            success: true,
        }); */
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log('Server listening...'));
