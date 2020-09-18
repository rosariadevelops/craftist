// SERVER
const express = require('express');
const app = express();
const multer = require('multer'); //npm package
const uidSafe = require('uid-safe'); //npm package
const path = require('path'); // core node module
const { s3Url } = require('./config');

app.use(express.static('./public'));
app.use(express.static('./sql'));
app.use(express.json());

// BORROWED FROM PETITION
const bodyParser = require('body-parser');
const db = require('./sql/db');
const s3 = require('./s3');
app.use(bodyParser.urlencoded({ extended: false }));
// ---------------------------------------------------- //

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

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get('/images', (req, res) => {
    db.selectImages()
        .then((result) => {
            var images = result.rows;
            res.json({
                images,
            });
        })
        .catch((err) => {
            console.log('err in selectImages: ', err);
        });

    /* if (!Array.prototype.last) {
        Array.prototype.last = function () {
            return this[this.length - 1];
        };
    } */

    /* db.getMoreImages(lastId)
        .then(({ rows }) => {
            console.log('getMoreImages rows: ', rows);
        })
        .catch((err) => {
            console.log('err in getMoreImages: ', err);
        }); */
});

/* app.post('/images', (req, res) => {
    console.log('/moreimages POST is working!');
    console.log('/moreimages req.body: ', req.body);
    var lastImageId = req.body.lastImageId;
    //     //console.log('/moreimages lastImageId: ', lastImageId);

    db.getMoreImages(lastImageId)
        .then(({ rows }) => {
            console.log('getMoreImages rows: ', rows);
        })
        .catch((err) => {
            console.log('err in getMoreImages: ', err);
        });
}); */

app.get('/images/:lastId', (req, res) => {
    //console.log('/moreimages GET is working!');
    //console.log('/:lastId req.params ', req.params);
    var lastImageId = req.params.lastId;

    db.getMoreImages(lastImageId)
        .then(({ rows }) => {
            //console.log('getMoreImages rows: ', rows);
            var newImages = rows;
            //console.log('/moreimages newImages: ', newImages);
            res.json({
                newImages,
            });
        })
        .catch((err) => {
            console.log('err in getMoreImages: ', err);
        });
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    var filename = req.file.filename;
    var url = `${s3Url}${filename}`;

    if (req.file) {
        // you'll want to make a db insert for all the information
        db.addImage(url, req.body.username, req.body.title, req.body.desc)
            .then(({ rows }) => {
                //console.log('rows[0]: ', rows[0]);
                res.json({
                    image: rows[0],
                });
            })
            .catch((err) => {
                console.log('err in addImage: ', err);
            });
    } else {
        res.json({
            success: false,
        });
    }
});

app.get('/image/:cardId', (req, res) => {
    //console.log('modal req params: ', req.params);
    var cardId = req.params.cardId;
    //console.log('/:cardId: ', cardId);
    db.renderModal(cardId)
        .then((result) => {
            //console.log('renderModal result: ', result);
            var modalURL = result.rows[0].url;
            var modalUsername = result.rows[0].username;
            var modalTitle = result.rows[0].title;
            var modalDesc = result.rows[0].description;
            var modalDate = result.rows[0].created_at;
            res.json({
                modalURL,
                modalUsername,
                modalTitle,
                modalDesc,
                modalDate,
            });
        })
        .catch((err) => {
            console.log('err in renderModal: ', err);
        });
});

app.get('/comments/:cardId', (req, res) => {
    //console.log('/comments req.params: ', req.params);
    //console.log('/comment cardId: ', req.params.cardId);
    var cardId = req.params.cardId;
    db.getComments(cardId)
        .then((result) => {
            //console.log('getComments result:', result);

            var comments = result.rows;
            res.json({
                comments,
            });
        })
        .catch((err) => {
            console.log('err in getComments: ', err);
        });
});

app.post('/comments', (req, res) => {
    //console.log('req.body: ', req.body);
    var username = req.body.uname;
    var comment = req.body.comment;
    var cardId = req.body.id;

    db.addComment(username, comment, cardId)
        .then(({ rows }) => {
            //console.log('result: ', rows[0]);
            res.json({
                comments: rows[0],
            });
        })
        .catch((err) => {
            console.log('err in addComment: ', err);
        });
});

app.listen(8080, () => console.log('Server listening...'));
