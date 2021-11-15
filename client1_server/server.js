const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http')
const fs = require('fs');
const helmet = require('helmet')
const cookieParser = require('cookie-parser');
const path = require('path');
const axios = require("axios");
const argon2 = require("argon2");
const {initializeApp} = require("firebase/app");
const { getDatabase, ref, set, get, child } = require( "firebase/database");


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgttBWsbtrCx9flnI0sxupTVXV-rdAQ3U",
  authDomain: "two-way-auth-db.firebaseapp.com",
  databaseURL: "https://two-way-auth-db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "two-way-auth-db",
  storageBucket: "two-way-auth-db.appspot.com",
  messagingSenderId: "879674970480",
  appId: "1:879674970480:web:bd18c9b990195c344b7fb5"
};

// Initialize Firebase
const firbebaseApp = initializeApp(firebaseConfig);
const firebaseDatabase = getDatabase(firbebaseApp)

const app = express();
app.use(helmet());
const whitelist = ["http://localhost:3000","http://localhost:3001", "http://localhost:8081, 'http://localhost:8080'"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("Origin rejected");
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});


const certFile = path.resolve(__dirname, `client1_cert.pem`);
const keyFile = path.resolve(__dirname, `client1_key.pem`);
const agent = new https.Agent({
		cert: fs.readFileSync(certFile),
		key: fs.readFileSync(keyFile),
		rejectUnauthorized: false
	});


// app.get('/api/authenticate', (req, res) => {
    
//     axios.get('https://localhost:4433/authenticate', {httpsAgent: agent})
// 	.then((res) => {
// 		console.log(res.data);
// 	})
// 	.catch((err) => {
// 		console.error(err.response.data);
// 	});

//   res.send('Hello dev.to!');
// });

app.post('/api/add-user',async (req,res) => {

    try {
    const passwordHash = await argon2.hash(req.body.password, {
        timeCost: 12,
        memoryCost: 8192,
      });

    const resp = await set(ref(firebaseDatabase, 'users/' + req.body.username), {
        username: req.body.username,
        password: passwordHash,
      });
    //   console.log(resp.val())
  res.json({msg: resp})
} catch (err) {
    res.status(500).json({
      error: 'internal server error'
    });
  }
});

app.post('/api/signin-user', async (req,res)=> {

    try {
    const user = await get(child(ref(firebaseDatabase), `users/${req.body.username}`));

      console.log(user.val())

    argon2
      .verify(user.val().password, req.body.password, {
        timeCost: 12,
        memoryCost: 8192,
      })
      .then((match) => {
        if (!match) {
          res.status(400).json({
            error: "Wrong Username and Password Combination!",
          });
        } else {
          res.status(200).json({username: user.val().username});
        }
      });
} catch (err) {
    res.status(500).json({
      error: 'internal server error'
    });
  }
})

app.post('/api/start-room',async (req,res) => {
    try{
      const response = await axios.post(
        `https://localhost:4433/api/start-room`,{user: req.body.user},{httpsAgent: agent}
      );
    
      res.status(response.status).json(response.data)
    } catch (err) {
        console.log(err)
        res.status(500).json({
          error: 'internal server error'
        });
      }
})

app.get('/api/room/:id',async (req, res) => {
    try{
      const response = await axios.get(
        `https://localhost:4433/api/room/${req.params.id}`,{httpsAgent: agent}
      )
      res.status(response.status).json(response.data)
    } catch (err) {

    res.status(500).json({
      error: 'internal server error'
    });
  }
})

app.get('/api/join-room/:id/:user',async (req, res) => {
  try{
    const response = await axios.get(
      `https://localhost:4433/api/join-room/${req.params.id}/${req.params.user}`,{httpsAgent: agent}
    )
      res.status(response.status).json(response.data)
  } catch (err) {
    console.log(err)
  res.status(500).json({
    error: 'internal server error'
  });
}
})

app.put('/api/approve-second-user-id',async (req, res) => {
    try{
      const response = await axios.put(
        `https://localhost:4433/api/approve-second-user-id`,req.body,{httpsAgent: agent}
      )
        res.status(response.status).json(response.data)
    } catch (err) {
    console.log(err)
    res.status(500).json({
      error: 'internal server error'
    });
  }
})

app.put('/api/approve-first-user-id',async (req, res) => {
    try{
      const response = await axios.put(
        `https://localhost:4433/api/approve-first-user-id`,req.body,{httpsAgent: agent}
      )
        res.status(response.status).json(response.data)
    } catch (err) {
    console.log(err)
    res.status(500).json({
      error: 'internal server error'
    });
  }
})




const httpServer = http.createServer(app);


httpServer.listen(8081, () => {
    console.log('HTTP Server running on port 8081');
});

