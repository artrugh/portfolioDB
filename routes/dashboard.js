// create the router handler
const express = require('express');
const router = express.Router();
// const url = require('url');

// handle body and errors
const bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser which is used when the body is needed
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const createError = require('http-errors');

// mongo
const mongoClient = require('mongodb').MongoClient

// middleware security
const { generateAuthToken, auth } = require('../lib/security');

// connection to the DB
const connectDB = require('../config/db');
// mongoose
const mongoose = require('mongoose');
// sensible data
require('dotenv').config();
// gridFS
const Grid = require('gridfs-stream');

// // // ====== // // // 

// connect to the DB
const conn = connectDB();
let gfs;
// connect GridFS to the DB
conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('portfolioDB');
});

// create the router handler

// @route POST /
// @desc login
router.post('/login',
    urlencodedParser,
    (req, res, next) => {

        try {
            // destruturing the body
            const {
                username,
                password
            } = req.body

            // check password and username
            if (password !== process.env.password) throw new createError(404);
            if (username !== process.env.username) throw new createError(404);

            // generate token
            const token = generateAuthToken(next, username);

            return res
                .status(200)
                .cookie('token', token, {
                    expires: new Date(Date.now() + 604800000),
                    secure: false, // if we are not using https
                    httpOnly: true
                })
                .redirect('/dashboard')
        } catch (e) {
            return res.redirect('/')
        }
    }
)

// @route POST/
// @desc logout
router.post('/logout',
    auth,
    (req, res, next) => {

        try {
            return res
                .clearCookie('token')
                .status(200)
                .render('login');
        } catch (e) {
            next(e)
        }
    }
)

// @route GET /
// @desc get dashboard
router.get('/dashboard',
    auth,
    async (req, res) => {
        // open the connection to the DB
        // to save the project
        mongoClient.connect(process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            async (err, client) => {
                if (err) {
                    return err
                }
                else {

                    let collection = client.db().collection('projects')
                    let projects;
                    try {
                        projects = await collection.find({}).toArray()

                    }
                    catch (err) {
                        console.log('Error while inserting:', err)
                    }
                    await client.close()
                    return res
                        .render('dashboard', { projects: projects })

                }
            }
        )
    }
)

router.get('/dashboard/images',
    auth,
    (req, res, next) => {

        const host = req.headers.host

        try {
            gfs.files.find().toArray((err, files) => {
                // Check if files
                // id is always false because there is any params
                if (!files || files.length === 0) {
                    res.render('dashboard_images', { files: false, id: false, host: host });
                } else {
                    files.map(file => {

                        if (
                            file.contentType === 'image/jpeg' ||
                            file.contentType === 'image/png'
                        ) {
                            file.isImage = true;
                        } else {
                            file.isImage = false;
                        }
                    });
                    return res.render(`dashboard_images`, { files: files, id: false, host: host });
                }
            });
        } catch (err) {
            return res.render('login');
        }
    }
);

router.get('/dashboard/images/:id',
    auth,
    (req, res, next) => {

        const id = req.params.id;
        const host = req.headers.host

        mongoClient.connect(process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            async (err, client) => {
                if (err) {
                    return err
                }
                else {
                    let collection = client.db().collection('projects')
                    const projects = await collection.find({}).toArray()

                    // check if the id match with a stored project
                    const project = await projects.filter(project => project._id.toString() === id)

                    if (project.length === 0) {
                        // client.close()
                        return res.redirect('/dashboard/declassified');
                    } else {

                        gfs.files.find().toArray((err, files) => {
                            // Check if files

                            if (!files || files.length === 0) {
                                res.render('dashboard_images', { files: undefined, id: id, host: host });
                            } else {

                                const filteredFiles = files.filter(file => {
                                    if (
                                        file.contentType === 'image/jpeg' ||
                                        file.contentType === 'image/png'
                                    ) {
                                        file.isImage = true;
                                    } else {
                                        file.isImage = false;
                                    }
                                    return file.metadata.project_id === id
                                })

                                if (!filteredFiles || filteredFiles.length === 0) {
                                    return res.render('dashboard_images', { files: false, id: id, host: host });
                                } else {
                                    return res.render(`dashboard_images`, { files: filteredFiles, id: id, host: host });
                                }
                            }
                        });
                    }
                }
            }
        )
    }
);


router.get('/dashboard/declassified',
    auth,
    (req, res, next) => {
        const host = req.headers.host
        try {
            // wait 100 milesecond - the file should be removed
            setTimeout(() => {
                gfs.files.find().toArray((err, files) => {
                    // Check if files
                    // id is always false because there is any params
                    if (!files || files.length === 0) {
                        res.render('dashboard_declassified', { files: undefined, host: host });
                    } else {

                        const filteredFiles = files.filter(file => {

                            if (
                                file.contentType === 'image/jpeg' ||
                                file.contentType === 'image/png'
                            ) {
                                file.isImage = true;
                            } else {
                                file.isImage = false;
                            }

                            return file.metadata.project_id === "declassified"
                        })


                        if (!filteredFiles || filteredFiles.length === 0) {

                            return res.render('dashboard_declassified', { files: false, host: host });
                        } else {
                            console.log();

                            return res.render('dashboard_declassified', { files: filteredFiles, host: host });
                        }
                    }
                });
            }, 100)

        } catch (err) {
            console.log(err);

        }

    }
);

module.exports = router;

