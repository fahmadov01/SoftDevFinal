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
// app.get('/welcome', (req, res) => {
//   res.json({status: 'success', message: 'Welcome!'});
// });
// app.post('/register', (req, res) => {
//   const { username, password } = req.body;
//   if (username && password && (username != '')) {
//     res.status(200).json({ message: 'Valid input' });
//   } else {
//     res.status(200).json({ message: 'Invalid input' });
//   }
// });
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   if (username === 'John Doe' && password === 'John') {
//     res.status(200).json({ message: 'Valid input' });
//   } else {
//     res.status(200).json({ message: 'Invalid input'});
//   }
// });
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

//login

// app.post('/login', async (req, res) => {
//     try{
//         //do something
//         // check if password from request matches with password in DB
//         const user = `select password from users where username = $1;`;
//         const password = await db.any(user, [req.body.username])


//         if(password.length === 0)
//         {
//             throw new Error('User not found')
//         }
//         const match = await bcrypt.compare(req.body.password, password[0].password);
//         if(match.err) 
//         {
//             console.log('Incorrect username or password');
//             res.redirect("/login");
//         }
//         else 
//         { 
//             req.session.user = user;
//             req.session.save();

//             res.redirect("/home");
//         }
//     }
//     catch(err){
//         console.log(err);
//         res.render("pages/register", {message: err});
//     }
// });
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


// const auth = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect("/login");
//   }
//   next();
// };

// app.use(auth);


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
  res.render("pages/home");
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render("pages/login");
});



// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');