// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(__dirname + "/resources"));


// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************
// TODO - Include your API routes here

app.get('/', (req, res) => {
    res.redirect('/login'); //this will call the /anotherRoute route in the API
  });

// Register

app.get("/register", (req, res) => {
    res.render("pages/register");
});

app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
    // To-DO: Insert username and hashed password into 'users' table
    const add_users = `INSERT INTO users(username, password) values ($1, $2) returning *;`;
    if(hash.err) 
    {console.log('Password invalid');}
    else
    {
        db.any(add_users,[req.body.username, hash])
        .then(() => {
            res.redirect("/");
        })
        .catch((err) => {
            console.log(err);
            res.render("pages/register",{
                message: `User already exists`,
            });
          });
    }
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // To-Do: Fetch the user from the 'users' table using the username
  const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      req.session.user = user;
      req.session.save();
      res.redirect('/home'); 
    } else {
      // res.redirect('/login');
      res.render("pages/login", {
        message: `Incorrect Password or Username`
      });
    }
  } else {
    // User not found
    res.redirect('/register');
  }
});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
  };
  
  // Authentication Required
app.use(auth);

app.get("/home", (req, res) => {
  var var2 = "2023-11-30";
  axios({
    url: `http://eventregistry.org/api/v1/article/getArticles`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
        "lang": "eng",
        "action": "getArticles",
        "articlesPage": 1,
        "articlesCount": 25,

        "articlesSortBy": "socialScore",
        "articlesSortByAsc": false,
        "articlesArticleBodyLen": -1,
        "resultType": "articles",
        "dateStart":var2,
        "dataType": [
          "news",
          "pr"
        ],
        "apiKey": process.env.API_KEY,
        "forceMaxDataTimeWindow": 31,
        "includeArticleCategories" : true
    }
  })
    .then(results => {
      console.log(results.data.articles.results);
      res.render('pages/home', { results: results.data.articles.results })

    })
    .catch(error => {
      console.log(error);
      res.render('pages/home', { err_results: [] })
    });
});
app.get("/profile", (req, res) => {
  res.render("pages/profile", {
    username: req.session.user.username,
    password: req.session.user.password
  })
});


app.get('/logout', async (req, res) => {
  console.log('Button clicked!');
  req.session.destroy();
  res.render("pages/login", { message: 'Logged out Successfully' });
});
app.get('/politics', async (req, res) => {
  axios({
    url: `http://eventregistry.org/api/v1/article/getArticles`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
        "lang": "eng",
        "action": "getArticles",
        "categoryUri": "dmoz/Society/Politics",
        "articlesPage": 1,
        "articlesCount": 20,

        "articlesSortByAsc": false,
        "articlesArticleBodyLen": -1,
        "resultType": "articles",
        "dataType": [
          "news",
          "pr"
        ],
        "apiKey": process.env.API_KEY,
        "forceMaxDataTimeWindow": 31,
        "isDuplicateFilter" : "skipDuplicates",
        "keywordLoc" : "title",
        "articlesSortBy" : "sourceImportance",
        "dateStart" : "2023-12-01",
    }
  })
    .then(results => {
      console.log(results.data.articles.results);
      res.render('pages/politics', { results: results.data.articles.results })

    })
    .catch(error => {
      console.log(error);
      res.render('pages/politics', { err_results: [] })
    });
});
app.get('/science', async (req, res) => {
  axios({
    url: `http://eventregistry.org/api/v1/article/getArticles`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
        "lang": "eng",
        "action": "getArticles",
        "categoryUri": "dmoz/Science",
        "articlesPage": 1,
        "articlesCount": 20,

        "articlesSortByAsc": false,
        "articlesArticleBodyLen": -1,
        "resultType": "articles",
        "dataType": [
          "news",
          "pr"
        ],
        "apiKey": process.env.API_KEY,
        "forceMaxDataTimeWindow": 31,
        "includeArticleCategories" : true,
        "isDuplicateFilter" : "skipDuplicates",
        "keywordLoc" : "title",
        "articlesSortBy" : "sourceImportance",
        "dateStart" : "2023-12-01",
    }
  })
    .then(results => {
      console.log(results.data.articles.results);
      res.render('pages/science', { results: results.data.articles.results })

    })
    .catch(error => {
      console.log(error);
      res.render('pages/science', { err_results: [] })
    });
});

app.get('/business', async (req, res) => {
  axios({
    url: `http://eventregistry.org/api/v1/article/getArticles`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
        "lang": "eng",
        "action": "getArticles",
        "categoryUri": "dmoz/Business",
        "articlesPage": 1,
        "articlesCount": 20,

        "articlesSortByAsc": false,
        "articlesArticleBodyLen": -1,
        "resultType": "articles",
        "dataType": [
          "news",
          "pr"
        ],
        "apiKey": process.env.API_KEY,
        "forceMaxDataTimeWindow": 31,
        "includeArticleCategories" : true,
        "isDuplicateFilter" : "skipDuplicates",
        "keywordLoc" : "title",
        "articlesSortBy" : "sourceImportance",
        "dateStart" : "2023-12-01",
    }
  })
    .then(results => {
      console.log(results.data.articles.results);
      res.render('pages/business', { results: results.data.articles.results })

    })
    .catch(error => {
      console.log(error);
      res.render('pages/business', { err_results: [] })
    });
});

app.get('/sports', async (req, res) => {
  axios({
    url: `http://eventregistry.org/api/v1/article/getArticles`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
        "lang": "eng",
        "action": "getArticles",
        "categoryUri": "dmoz/Sports",
        "articlesPage": 1,
        "articlesCount": 20,

        "articlesSortByAsc": false,
        "articlesArticleBodyLen": -1,
        "resultType": "articles",
        "dataType": [
          "news",
          "pr"
        ],
        "apiKey": process.env.API_KEY,
        "forceMaxDataTimeWindow": 31,
        "includeArticleCategories" : true,
        "isDuplicateFilter" : "skipDuplicates",
        "keywordLoc" : "title",
        "articlesSortBy" : "sourceImportance",
        "dateStart" : "2023-12-01",
    }
  })
    .then(results => {
      console.log(results.data.articles.results);
      res.render('pages/sports', { results: results.data.articles.results })

    })
    .catch(error => {
      console.log(error);
      res.render('pages/sports', { err_results: [] })
    });
});

// user can search for articles based on keyword
app.get('/search', async (req, res) => {
  const search_word = req.query.q;
  axios({
    url: `http://eventregistry.org/api/v1/article/getArticles`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
        "lang": "eng",
        "action": "getArticles",
        "keyword": search_word,
        "articlesPage": 1,
        "articlesCount": 20,
        "articlesSortBy": "rel",
        "articlesSortByAsc": false,
        "articlesArticleBodyLen": -1,
        "resultType": "articles",
        "dataType": [
          "news",
          "pr"
        ],
        "apiKey": process.env.API_KEY,
        "forceMaxDataTimeWindow": 31,
        "includeArticleCategories" : true,
        "isDuplicateFilter" : "skipDuplicates",
        "keywordLoc" : "title",
        "dateStart" : "2023-12-01",
    }
  })
    .then(results => {
      console.log(search_word);
      res.render('pages/search', { results: results.data.articles.results })

    })
    .catch(error => {
      console.log(error);
      res.render('pages/search', { err_results: [] })
    });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');