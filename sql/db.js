// DATABASE
const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/ibd');
// localhost:5423 is a standard port for database
// localhost:5432/nameofdatabase
// spicedpg is written by David but based on pg npm module as a way to talk to database

module.exports.selectImages = () => {
    return db.query(`SELECT * FROM images;`);
};

module.exports.addImage = (url, username, title, description) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id;`,
        [url, username, title, description]
    );
};
