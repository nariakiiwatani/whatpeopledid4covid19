// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Archives (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date DATE, content TEXT)"
    );
    console.log("New table Archives created!");
  } else {
    console.log('Database "Archives" ready to go!');
    db.each("SELECT * from Archives", (err, row) => {
      if (row) {
        console.log(`record: {name: ${row.name}, date: ${row.date}, content: ${row.content}}`);
      }
    });
  }
});

function addDateColumn() {
  db.run(
  "ALTER TABLE Archives add column date DATE", err => {
    if(err) {
      console.info("add error");
    }
    else {
      console.info("add success");
    }
  });
}

function addDefaultDate() {
  db.run(
    "UPDATE Archives set date = '2020-04-07' WHERE date IS NULL", err => {
    if(err) {
      console.info("add error");
    }
    else {
      console.info("add success");
    }
  });
}

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// endpoint to get all the dreams in the database
app.get("/getRecords", (request, response) => {
  db.all("SELECT * from Archives ORDER BY date ASC", (err, rows) => {
    response.send(JSON.stringify(rows));
  });
});

// endpoint to add a dream to the database
app.post("/addRecord", (request, response) => {
  console.log(`add to archives ${request.body.name}, ${request.body.date}, ${request.body.content}`);

  // DISALLOW_WRITE is an ENV variable that gets reset for new projects
  // so they can write to the database
  if (!process.env.DISALLOW_WRITE) {
    const cleansedName = cleanseString(request.body.name);
    const cleansedDate = cleanseString(request.body.date);
    const cleansedContent = cleanseString(request.body.content);
    db.run(`INSERT INTO Archives (name, date, content) VALUES (?, ?, ?)`, cleansedName, cleansedDate, cleansedContent, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});
/*
// endpoint to clear dreams from the database
app.get("/clearAll", (request, response) => {
  // DISALLOW_WRITE is an ENV variable that gets reset for new projects so you can write to the database
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Archives",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Archives WHERE ID=?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});
*/
// helper function that prevents html/css/script malice
const cleanseString = function(string) {
  return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});