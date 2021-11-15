/* eslint-disable import/first */
require("dotenv").config();
const path = require( "path");
const express  = require("express");
const helmet  = require("helmet");
const cookieParser = require( "cookie-parser");
const cors = require("cors");
const https = require('https');
const fs = require('fs');
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

const opts = {
	key: fs.readFileSync(path.join(__dirname, 'server_key.pem')),
	cert: fs.readFileSync(path.join(__dirname, 'server_cert.pem')),
	requestCert: true,
	rejectUnauthorized: true, // so we can do own error handling
	ca: [
		fs.readFileSync(path.join(__dirname, 'server_cert.pem'))
	]
};

const app = express();
app.use(helmet());


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

// app.get('/authenticate', (req, res) => {
// 	const cert = req.socket.getPeerCertificate();

// 	if (req.client.authorized) {
// 		res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}!`);

// 	} else if (cert.subject) {
// 		res.status(403)
// 			 .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`);

// 	} else {
// 		res.status(401)
// 		   .send(`Sorry, but you need to provide a client certificate to continue.`);
// 	}
// });

// app.post('/api/add-user',async (req,res) => {

//     try {
//     const passwordHash = await argon2.hash(req.body.password, {
//         timeCost: 12,
//         memoryCost: 8192,
//       });

//     const resp = await set(ref(firebaseDatabase, 'users/' + req.body.username), {
//         username: req.body.username,
//         password: passwordHash,
//       });
//     //   console.log(resp.val())
//   res.json({msg: resp})
// } catch (err) {
//     res.status(500).json({
//       error: 'internal server error'
//     });
//   }
// });

// app.post('/api/signin-user', async (req,res)=> {

//     try {
//     const user = await get(child(ref(firebaseDatabase), `users/${req.body.username}`));

//       console.log(user.val())

//     argon2
//       .verify(user.val().password, req.body.password, {
//         timeCost: 12,
//         memoryCost: 8192,
//       })
//       .then((match) => {
//         if (!match) {
//           res.status(400).json({
//             error: "Wrong Username and Password Combination!",
//           });
//         } else {
//           res.status(200).json({username: user.val().username});
//         }
//       });
// } catch (err) {
//     res.status(500).json({
//       error: 'internal server error'
//     });
//   }
// })

app.post('/api/start-room',async (req,res) => {
    try{
    const roomId = Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
    const firstUserId = Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
    const secondUserId = Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);

    const reqBody = {
        id: roomId,
        firstUser: req.body.user,
        secondUser: null,
        firstUserAccepted: false,
        secondUserAccepted: false,
        firstUserId,
        secondUserId,
    }

      await set(ref(firebaseDatabase, `rooms/${roomId}`), reqBody);

      res.status(200).json({id: roomId})
    } catch (err) {
        res.status(500).json({
          error: 'internal server error'
        });
      }
})

app.get('/api/room/:id',async (req, res) => {
    try{
        const room = await get(child(ref(firebaseDatabase), `rooms/${req.params.id}`)).then((snapshot) => {
            if (snapshot.exists()) {
              res.status(200).json(snapshot.val())
            } else {
                res.status(500).json({error: 'Room not found'});
            }
          }).catch((error) => {
              console.log(error)
            res.status(500).json({error: 'Something wrong wih databse'})
          });

    } catch (err) {
    res.status(500).json({
      error: 'internal server error'
    });
  }
})

app.get('/api/join-room/:id/:user',async (req, res) => {

  try{

      const room = await get(child(ref(firebaseDatabase), `rooms/${req.params.id}`)).then(async (snapshot) => {
          if (snapshot.exists()) {
            await set(ref(firebaseDatabase, `rooms/${snapshot.val().id}`), {...snapshot.val(), secondUser: req.params.user });
            res.status(200).json({id: snapshot.val().id})
          } else {
              res.status(500).json({error: 'Room not found'});
          }
        }).catch((error) => {
            
          res.status(500).json({error: 'Something wrong wih databse'})
        });

  } catch (err) {
  console.log(err)
  res.status(500).json({
    error: 'internal server error'
  });
}
})

app.put('/api/approve-second-user-id',async (req, res) => {
    try{
        const room = await get(child(ref(firebaseDatabase), `rooms/${req.body.roomId}`));
        
        if(room.val().secondUserId === parseInt(req.body.secondUserId,10)){
            await set(ref(firebaseDatabase, `rooms/${room.val().id}`), {...room.val(), firstUserAccepted: true });
            res.status(200).json({})
        } else {
            console.log(room.val().secondUserId, req.body.secondUserId);
            res.status(500).json({error: 'Wrong other user id'})
        }
    } catch (err) {
    console.log(err)
    res.status(500).json({
      error: 'internal server error'
    });
  }
})

app.put('/api/approve-first-user-id',async (req, res) => {
    try{
        const room = await get(child(ref(firebaseDatabase), `rooms/${req.body.roomId}`));
        
        if(room.val().firstUserId === parseInt(req.body.firstUserId,10)){
            await set(ref(firebaseDatabase, `rooms/${room.val().id}`), {...room.val(), secondUserAccepted: true });
            res.status(200).json({})
        } else {
          console.log(room.val().firstUserId,parseInt(req.body.firstUserId,10))
            res.status(500).json({error: 'Wrong other user id'})
        }
    } catch (err) {
    console.log(err)
    res.status(500).json({
      error: 'internal server error'
    });
  }
})





https.createServer(opts, app).listen(4433, () => {

	console.log('SERVER ONLINE at https://localhost:4433')
});
