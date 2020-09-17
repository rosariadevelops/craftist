// DATABASE
const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/ibd');
// localhost:5423 is a standard port for database
// localhost:5432/nameofdatabase
// spicedpg is written by David but based on pg npm module as a way to talk to database

module.exports.selectImages = () => {
    return db.query(
        `
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 3;`
    );
};

module.exports.addImage = (url, username, title, description) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`,
        [url, username, title, description]
    );
};

module.exports.renderModal = (id) => {
    return db.query(
        `
        SELECT * FROM images
        WHERE id = ($1);`,
        [id]
    );
};

module.exports.addComment = (username, comment, image_id) => {
    return db.query(
        `
        INSERT INTO comments (username, comment, image_id)
        VALUES ($1, $2, $3)
        RETURNING *;`,
        [username, comment, image_id]
    );
};

module.exports.getComments = (id) => {
    return db.query(
        `
        SELECT * FROM comments
        WHERE image_id = ($1)
        ORDER BY id DESC;`,
        [id]
    );
};

/* module.exports.getMoreImages = (lastId) => {
    return db.query(
        `
        SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 10
        ;`,
        [lastId]
    );
}; */

module.exports.getMoreImages = (lastId) => {
    return db.query(
        `
        SELECT url, title, id, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS "lowestId" FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 3;`,
        [lastId]
    );
};
