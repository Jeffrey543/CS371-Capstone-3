"use strict";
const express = require('express');
const { Client } = require('pg');
const app = express();
app.use(express.static("public"));
const PORT = 8000;
app.use(express.json());
app.listen(PORT);

const clientConfig = {
user: "postgres",
password: "mypacepostgresql",
host: "my-pace-postgresql.ct86yqyu81y4.us-east-2.rds.amazonaws.com",
port: 5432,
ssl: {
rejectUnauthorized: false,
}
};
app.get('/movie', async function (req, res) {
const id = req.query['id'];
const client = new Client(clientConfig);
await client.connect();
const result = await client.query("SELECT TITLE FROM movies where id=$1::text", [id]);
if (result.rowCount < 1) {
res.status(500).send("Internal Error - No Show Found");
} else {
res.set("Content-Type", "application/json");
res.send(result.rows[0]);
}
await client.end();
});

app.post('/movie', async function(req, res) {
const {id, title, genres, averageRating, numVotes, releaseYear} = req.body;
const client = new Client(clientConfig);
await client.connect();
try {
const result = await client.query("INSERT INTO movies (id, title, genres, averageRating, numVotes, releaseYear) VALUES ($1, $2, $3, $4, $5, $6)  RETURNING *", [id, title, genres, averageRating, numVotes, releaseYear]);
res.set("Content-Type", "application/json");
res.send(result.rows[0]);
} catch (error) {
res.status(500).send("Internal Error");
} finally {
await client.end();
}
});

app.delete('/movie', async function(req, res) {
const id = req.query['id'];
const client = new Client(clientConfig);
await client.connect();
try {
const result = await client.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
if (result.rowCount < 1) {
return res.status(404).send("Movie not found");
}
res.status(200).send("Movie deleted successfully");
} catch (error) {
res.status(500).send("Internal Error");
} finally {
await client.end();
}
});
