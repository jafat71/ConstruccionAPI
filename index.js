import { initializeApp } from 'firebase/app';

import { getFirestore, collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore/lite';

import express from 'express';

import cors from 'cors';
const firebaseConfig = {
    apiKey: "AIzaSyCvi-uF1tbyDIjKIZic7jwISlnmzQJ4pzY",
    authDomain: "youflix-6f8e4.firebaseapp.com",
    projectId: "youflix-6f8e4",
    storageBucket: "youflix-6f8e4.appspot.com",
    messagingSenderId: "285493117970",
    appId: "1:285493117970:web:3373d5841922f3b75744cb"
  };

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
//const express = require('express')
const expressApp = express()
const port = 3007

//var cors = require('cors')
expressApp.use(cors())
expressApp.use(express.json());

expressApp.get('/', (req, res) => {
    res.send('Hello World!')
})

expressApp.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

async function getMovies(db) {
    const movies = collection(db, 'movies');
    const moviesSnapshot = await getDocs(movies);
    const moviesList = moviesSnapshot.docs.map(doc => doc.data());
    return moviesList;
}

//READ ALL MOVIES
expressApp.get('/movies', async (req, res) => {
    try {
        const movies = await getMovies(db);
        res.send(movies);
    } catch (error) {
        console.error('Error retrieving movies:', error);
        res.status(500).send('Error retrieving movies');
    }
});

//READ ONE MOVIE
expressApp.get("/movies/:item_id", (req, res) => {
    (async () => {
        try {
            let response = [];

            const q = query(
                collection(db, "movies"),
                where("id", "==", req.params.item_id)
            );

            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                const selectedItem = {
                    movie: doc.data(),
                };
                response.push(selectedItem);
            });

            if (response.length > 0) {
                return res.status(200).send(response);
            } else {
                console.log("Document not found");
                return res.status(404).send("Document not found");
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

//CREATE ONE MOVIE
expressApp.post("/movies/create", (req, res) => {
    (async () => {
        try {
            const docRef = await addDoc(collection(db, "movies"), req.body.movie);
            return res.status(200).send(`Document written with ID:  ${docRef.id}`);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

//UPDATE MOVIE
expressApp.put('/movies/update/:item_id', (req, res) => {
    (async () => {
        try {
            let response = [];
            const q = query(
                collection(db, "movies"),
                where("id", "==", req.params.item_id)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const selectedItem = {
                    id: doc.id,
                    movie: doc.data(),
                };
                response.push(selectedItem);
            });
            if (response.length > 0) {
                const movieDocument = doc(db, "movies", response[0].id);
                await updateDoc(movieDocument, req.body);
                return res.status(200).send({});
            } else {
                console.log("Document not found");
                return res.status(404).send({message: "Document not found"});
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({error: error});
        }
    })();
});

//DELETE
expressApp.delete("/movies/delete/:item_id", (req, res) => {
    (async () => {
        try {

            const q = query(
                collection(db, "movies"),
                where("id", "==", req.params.item_id)
            );
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return res.status(404).send("Document not found");
            }

            const docId = querySnapshot.docs[0].id;
            const movieDocument = doc(db, "movies", docId);
            await deleteDoc(movieDocument);
            return res.status(200).send();

        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});
