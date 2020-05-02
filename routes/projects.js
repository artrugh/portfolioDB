// create the router handler
const express = require('express');
const router = express.Router();

// handle body and errors
const bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// mongo
const mongoClient = require('mongodb').MongoClient

// middleware security
const { auth } = require('../lib/security');

// models
const Project = require('./../models/Project');

// sensible data
require('dotenv').config();

// create the router handler

// @route POST /
// @desc add project
router.post('/addproject',
    auth,
    urlencodedParser,
    async (req, res, next) => {

        try {

            let newProject = new Project();

            const project = typeof req.body.project === 'string'
                ? JSON.parse(req.body.project)
                : req.body.project;

            // destruturing the body
            Object.entries(project).map(entry => {
                const key = entry[0];
                const value = entry[1];
                newProject[key] = value;
            });


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
                        try {
                            await collection.insertOne(newProject)
                            console.log('Project Inserted')
                        }
                        catch (err) {
                            console.log('Error while inserting:', err)
                        }

                        // convert the id into a string, otherwise it is an object
                        const id = newProject._id.toString()

                        await client.close()
                        return res.redirect(`/dashboard/images/${id}`)

                    }
                }
            )

        } catch (err) {

            next(err)
        }
    }
);

// @route PUT /
// @desc update project
// on progress
router.put('/updateproject',
    auth,
    async (req, res, next) => {

        // try {

        //     const project = await Project
        //         .findById(req.body._id)

        //     //check user
        //     if (!project) throw new createError(404);

        //     res
        //         .status(200)
        //         .send(project)
        //         .redirect('/dashboard')

        // } catch (e) {
        //     next(e);
        // }
        return res.status(404).json({
            err: 'On progress, please be patient'
        });
    }
)

// @route GET /
// @desc get all projects
router.get('/projects',
    async (req, res, next) => {
        try {
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
                            .status(200)
                            .send(projects)
                    }
                }
            )
        } catch (e) {
            next(e);
        }
    }
)

module.exports = router;

