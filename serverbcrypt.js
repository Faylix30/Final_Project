const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node'); // TensorFlow.js for Node.js

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(cors());

// MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project',
});

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'imageupload');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep the original name
    },
});
const upload = multer({ storage: storage }).array('images[]');

// Load TensorFlow model
let model;
(async () => {
    try {
        model = await tf.loadLayersModel('./model/tfjs_model/model.json');
        console.log('Model Loaded Successfully');
    } catch (error) {
        console.error('Error loading model:', error);
    }
})();

// Get the next image ID from the database
const getNextImageId = async () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT MAX(image_id) AS maxId FROM image', (error, results) => {
            if (error) return reject(error);
            const nextId = results[0].maxId ? results[0].maxId + 1 : 1;
            resolve(nextId);
        });
    });
};

// Insert uploaded image info into the database
const createImageUpload = async (imageData) => {
    return new Promise((resolve, reject) => {
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const values = imageData.map(({ id, newFileName }) => [id, date, newFileName]);

        const query = "INSERT INTO image (image_id, date, image_name) VALUES ?";
        pool.query(query, [values], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Upload image endpoint
app.post('/api/upload', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.json({ result: false, message: err.message });

        if (!req.files || req.files.length === 0) {
            return res.json({ result: false, message: 'No files uploaded' });
        }

        try {
            const nextImageId = await getNextImageId();

            const imageData = await Promise.all(req.files.map(async (file, index) => {
                const id = nextImageId + index;
                const newFileName = `${id}_${file.originalname}`;
                const filePath = `imageupload/${newFileName}`;

                fs.renameSync(file.path, filePath);

                return { id, newFileName };
            }));

            await createImageUpload(imageData);
            res.json({ result: true, data: imageData });
        } catch (error) {
            console.error('Image upload error:', error);
            res.json({ result: false, message: error.message });
        }
    });
});

// Prediction endpoint
app.post('/api/predict', async (req, res) => {
    try {
        const { imagePath } = req.body;
        const imageBuffer = fs.readFileSync(imagePath);

        const tensor = tf.node.decodeImage(imageBuffer)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()
            .div(255.0);

        const prediction = model.predict(tensor);
        const result = prediction.arraySync();

        res.json({ result });
    } catch (error) {
        console.error('Prediction Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// User login endpoint
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    pool.query("SELECT * FROM users WHERE user_name = ?", [username], async (error, results) => {
        if (error) return res.json({ result: false, message: error.message });

        if (results.length) {
            const hashedPassword = results[0].user_pwd;
            const isMatch = await bcrypt.compare(password, hashedPassword);

            if (isMatch) {
                res.json({ result: true });
            } else {
                res.json({ result: false, message: "Invalid username or password" });
            }
        } else {
            res.json({ result: false, message: "Invalid username or password" });
        }
    });
});

// Authentication request endpoint
app.post("/api/authen_request", (req, res) => {
    const sql = "SELECT * FROM users WHERE user_name = ?";
    pool.query(sql, [req.body.username], (error, results) => {
        if (error) return res.json({ result: false, message: error.message });

        if (results.length) {
            const payload = { username: req.body.username };
            const secretKey = "MySecretKey";
            const authToken = jwt.sign(payload, secretKey);
            res.json({ result: true, data: { auth_token: authToken } });
        } else {
            res.json({ result: false, message: "Invalid username" });
        }
    });
});

// Access request endpoint
app.post("/api/access_request", async (req, res) => {
    const { password, auth_token } = req.body;

    try {
        const decoded = jwt.verify(auth_token, "MySecretKey");

        const query = "SELECT * FROM users WHERE user_name = ?";
        pool.query(query, [decoded.username], async (error, results) => {
            if (error) return res.json({ result: false, message: error.message });

            if (results.length) {
                const isMatch = await bcrypt.compare(password, results[0].user_pwd);
                if (isMatch) {
                    const payload = {
                        user_id: results[0].user_id,
                        user_name: results[0].user_name,
                        first_name: results[0].first_name,
                        last_name: results[0].last_name,
                    };
                    const accessToken = jwt.sign(payload, "MySecretKey");
                    res.json({ result: true, data: { access_token: accessToken, account_info: payload } });
                } else {
                    res.json({ result: false, message: "Invalid username or password" });
                }
            } else {
                res.json({ result: false, message: "Invalid username or password" });
            }
        });
    } catch (error) {
        res.status(401).json({ result: false, message: "Unauthorized" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

