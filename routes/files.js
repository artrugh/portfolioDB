// create the router handler
const express = require('express');
const router = express.Router();

// mongo
const mongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID;

// middleware security
const { auth } = require('../lib/security');
const { uploader } = require('./../lib/uploader');

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

// // @route POST /upload
// // @desc Uploads file to DB
router.post('/upload/:id',
    auth,
    // file name should be the same in html form, second argument: max number of files uploaded
    uploader.array('file', 6),
    (req, res) => {

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

                    // const used during the response
                    const id = req.params.id
                    const files = req.files
                    const host = req.headers.host

                    let collection = client.db().collection('projects')

                    // console.log("files", files.contentType);


                    try {
                        // use findAndUpdate and push to push string URL in the images project's array
                        // documentation README.md
                        // set all in a Promise
                        // map the files array in case more than one image have been uploaded
                        await Promise.all(
                            files.map(async file => {
                                console.log("file. content type", file.contentType);

                                // images
                                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {

                                    const img_size = `images.${file.metadata.size}`
                                    await collection.findOneAndUpdate(
                                        { _id: ObjectID(id) },
                                        { $push: { [`${img_size}`]: `http://${host}/image/${file.filename}` } }
                                    )
                                    // videos
                                } else if (file.contentType === 'video/mp4') {
                                    await collection.findOneAndUpdate(
                                        { _id: ObjectID(id) },
                                        { $push: { videos: `http://${host}/video/${file.filename}` } }
                                    )
                                    // audios
                                } else if (file.contentType === 'audio/mpeg') {
                                    await collection.findOneAndUpdate(
                                        { _id: ObjectID(id) },
                                        { $push: { audios: `http://${host}/audio/${file.filename}` } }
                                    )
                                }
                            }))

                        // Fetch the document that we modified and check if it got inserted correctly
                        await collection.findOne({ _id: ObjectID(id) }, function (err, item) {
                            try { console.log("project updated"); }
                            catch (err) {
                                console.log("err", err);
                            }
                        });
                    }
                    catch (err) {
                        console.log('Error while inserting:', err)
                    }
                }
                await client.close()
                return res.redirect(`/dashboard/images/${req.params.id}`);
            }
        )
    }
);


// @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:filename',
    auth,
    async (req, res) => {

        // const and variable used during the response
        const host = req.headers.host
        const filename = req.params.filename;

        // find in the files collection all the needed file's data 
        await gfs.files.findOne({ filename: filename }, (err, file) => {

            if (err) {
                return res.status(400).json({
                    err: errorHandler.getErrorMessage(err)
                });
            }

            // Check if file
            if (!file || file.length === 0) {
                return res.status(404).json({
                    err: 'No file exists'
                });
            }

            // then delete form gfs and finaly the strin in img
            gfs.remove({ filename: filename, root: 'portfolioDB' }, (err, gridStore) => {
                if (err) {
                    res.status(404).json({ err: err });
                }
                console.log("file deleted");
            })

            // set the project id  and type and the image's size as well
            // both are required to remove the url string from the project
            const id = file.metadata.project_id
            const size = file.metadata.size
            const type = file.contentType

            if (id === "declassified") {
                return res.redirect(`/dashboard/declassified`);
            } else {
                // set a time put, wait the file should be found
                setTimeout(() => {
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
                                // get the collection
                                let collection = client.db().collection('projects')

                                try {

                                    // key and value used to delete the string
                                    let key;
                                    let value;

                                    if (type === 'image/jpeg' || type === 'image/png') {
                                        key = `images.${size}`;
                                        value = `http://${host}/image/${filename}`;
                                    } else if (type === 'video/mp4') {
                                        key = `videos`;
                                        value = `http://${host}/video/${filename}`;
                                    } else if (type === 'audio/mpeg') {
                                        key = `audios`;
                                        value = `http://${host}/audio/${filename}`;
                                    }

                                    // use upodate and pull to remove the selected string // documentation README.md
                                    await collection.update({ _id: ObjectID(id) }, { $pull: { [`${key}`]: value } },
                                        function (err, item) {
                                            const modified = item.result.nModified;
                                            console.log("number of removed items", modified)
                                            // if the removed image is from a project redirect id
                                            if (modified > 0) {
                                                client.close()
                                                return res.redirect(`/dashboard/images/${id}`);
                                            } else {
                                                client.close()
                                                return res.redirect(`/dashboard/images`);
                                            }
                                        })
                                }
                                catch (err) {
                                    console.log('Error while inserting:', err)
                                }
                            }
                        }
                    )
                }, 100)
            }
        })

    }
);

// @route GET /files
// @desc  Display all files in JSON
router.get('/files',
    auth,
    (req, res) => {
        gfs.files.find().toArray((err, files) => {

            if (err) {
                return res.status(400).json({
                    err: errorHandler.getErrorMessage(err)
                });
            }
            // Check if files
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: 'No files exist'
                });
            }
            // Files exist
            return res.json(files);
        });
    }
);

// @route GET /files/:filename
// @desc  Display single file object
router.get('/files/:filename', (req, res) => {

    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {

        if (err) {
            return res.status(400).json({
                err: errorHandler.getErrorMessage(err)
            });
        }
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // File exists
        // return res.json(file)
        const readstream = gfs.createReadStream(file.filename);
        return readstream.pipe(res);
    });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {

    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {

        if (err) {
            return res.status(400).json({
                err: errorHandler.getErrorMessage(err)
            });
        }
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file._id);
            return readstream.pipe(res);
        } else {
            return res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route GET /video/:filename
// @desc Display Video
router.get('/video/:filename', (req, res) => {

    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {

        if (err) {
            return res.status(400).json({
                err: errorHandler.getErrorMessage(err)
            });
        }

        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'video/mp4') {

            res.writeHead(200, {
                'Accept-Ranges': 'bytes',
                'Content-Length': file.length,
                'Content-Type': file.contentType
            });

            const readStream = gfs.createReadStream(file._id);

            readStream.on('error', function (err) {
                if (err) {
                    return res.status(400).json({
                        err: errorHandler.getErrorMessage(err)
                    });
                }
            });

            return readStream.pipe(res);

        } else {
            return res.status(404).json({
                err: 'Not a video'
            });
        }
    });
});

// @route GET /audio/:filename
// @desc Display AUdio
router.get('/audio/:filename', (req, res) => {

    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {

        if (err) {
            return res.status(400).json({
                err: errorHandler.getErrorMessage(err)
            });
        }
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === "audio/mpeg") {

            res.writeHead(200, {
                'Accept-Ranges': 'bytes',
                'Content-Length': file.length,
                'Content-Type': file.contentType
            });

            const readStream = gfs.createReadStream(file._id);

            readStream.on('error', function (err) {
                if (err) {
                    return res.status(400).send({
                        err: errorHandler.getErrorMessage(err)
                    });
                }
            });

            return readStream.pipe(res);

        } else {
            return res.status(404).json({
                err: 'Not an audio'
            });
        }
    });
});

module.exports = router;