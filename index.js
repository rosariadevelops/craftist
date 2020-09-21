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
                success: true,
            });
        })
        .catch((err) => {
            console.log('err in selectImages: ', err);
        });
});

app.get('/images/:lastId', (req, res) => {
    var lastImageId = req.params.lastId;
    console.log('lastId: ', lastImageId);

    db.getMoreImages(lastImageId)
        .then(({ rows }) => {
            var newImages = rows;
            console.log('newImages: ', newImages);
            res.json({
                newImages,
                success: true,
            });
        })
        .catch((err) => {
            console.log('err in getMoreImages: ', err);
        });
});

app.post('/upload/tags', (req, res) => {
    console.log('tag post req: ', req.body);
    var tagsArr = req.body.allTags;
    var image_id = req.body.imageId;

    for (var i = 0; i < tagsArr.length; ++i) {
        console.log('tagsArr index.js i: ', tagsArr[i]);
        db.addTags(tagsArr[i], image_id)
            .then(({ rows }) => {
                console.log('tags added result: ', rows);
                res.json({
                    tags: rows[0],
                    success: true,
                });
            })
            .catch((err) => {
                console.log('err in addComment: ', err);
            });
    }
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    var filename = req.file.filename;
    var url = `${s3Url}${filename}`;

    if (req.file) {
        db.addImage(url, req.body.username, req.body.title, req.body.desc)
            .then(({ rows }) => {
                res.json({
                    image: rows[0],
                    success: true,
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
    var cardId = req.params.cardId;

    db.renderModal(cardId)
        .then((result) => {
            db.getTags(cardId).then((rst) => {
                console.log('getTags result: ', rst);
                console.log('getTags result: ', result);

                var { url, username, title, description, created_at, next, prev } = result.rows[0];

                res.json({
                    url,
                    username,
                    title,
                    description,
                    created_at,
                    next,
                    prev,
                    tags: rst.rows,
                });
            });
        })
        .catch((err) => {
            console.log('err in renderModal: ', err);
        });
});

app.get('/comments/:cardId', (req, res) => {
    var cardId = req.params.cardId;

    db.getComments(cardId)
        .then((result) => {
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
    var username = req.body.uname;
    var comment = req.body.comment;
    var cardId = req.body.id;

    db.addComment(username, comment, cardId)
        .then(({ rows }) => {
            res.json({
                comments: rows[0],
            });
        })
        .catch((err) => {
            console.log('err in addComment: ', err);
        });
});

app.post('/delete', s3.delete, (req, res) => {
    var deleteId = req.body.id;
    //var filename = req.body.filename;
    console.log('deleteId: ', deleteId);

    db.deleteImage(deleteId)
        .then(({ rows }) => {
            console.log('result: ', rows);
            res.json({
                deleteConfirm: rows[0],
            });
        })
        .catch((err) => {
            console.log('err in deleteImage: ', err);
        });
});

app.get('/images/filter/:tag', (req, res) => {
    console.log('filter req params: ', req.params);
    var tag = req.params.tag;

    db.filterTags(tag)
        .then(({ rows }) => {
            console.log('filter result: ', rows);
            var tagResults = rows;
            res.json({
                tagResults,
            });
        })
        .catch((err) => {
            console.log('err in getComments: ', err);
        });
});

app.listen(8080, () => console.log('Server listening...'));
