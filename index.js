// SERVER
const express = require('express');
const app = express();

app.use(express.static('./public'));
app.use(express.static('./sql'));

// BORROWED FROM PETITION
const bodyParser = require('body-parser');
const db = require('./sql/db');
//const bc = require('./bc');
//const cookieSession = require('cookie-session');
//const csurf = require('csurf');

/* app.use(
    cookieSession({
        secret: `something secret`,
        maxAge: 1000 * 60 * 60 * 24, // after this amount of time the cookie will expire
    })
); */

app.use(bodyParser.urlencoded({ extended: false }));
//app.use(csurf()); // the placement of this matters. Must come after express encoded and after cookie expression

/* app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader('x-frame-options', 'deny');
    next();
}); */
// ---------------------------------------------------- //

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

app.listen(8080, () => console.log('Server listening...'));
