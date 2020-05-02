const path = require('path');
const crypto = require('crypto')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

require('dotenv').config();

// // create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {

        console.log("size", req.body.image_size);

        const size = req.body.image_size ? "big" : "small"

        console.log("id", req.params.id);


        return new Promise((resolve, reject) => {

            // is used to generate names
            crypto.randomBytes(16, (err, buf) => {

                if (err) {
                    return reject(err);
                }

                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'portfolioDB',
                    metadata: {
                        project_id: req.params.id,
                        size: size,
                        original_name: file.originalname.split(".")[0]
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

exports.uploader = multer({ storage })
