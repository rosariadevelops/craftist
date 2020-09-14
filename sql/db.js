// DATABASE
const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/ibd');
// localhost:5423 is a standard port for database
// localhost:5432/nameofdatabase
// spicedpg is written by David but based on pg npm module as a way to talk to database

module.exports.selectImages = () => {
    return db.query(`SELECT * FROM images;`);
};
