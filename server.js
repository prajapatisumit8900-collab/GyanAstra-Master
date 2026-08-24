const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const db = require("./database");

const app = express();

const PORT = 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==========================================
// UPLOAD FOLDERS
// ==========================================

const uploadsPath = path.join(__dirname, "uploads");

const videosPath = path.join(uploadsPath, "videos");
const pdfsPath = path.join(uploadsPath, "pdfs");
const notesPath = path.join(uploadsPath, "notes");
const thumbnailsPath = path.join(uploadsPath, "thumbnails");

[
    uploadsPath,
    videosPath,
    pdfsPath,
    notesPath,
    thumbnailsPath
].forEach((folder) => {

    if (!fs.existsSync(folder)) {

        fs.mkdirSync(folder, {
            recursive: true
        });

    }

});


// ==========================================
// STATIC UPLOAD FILES
// ==========================================

app.use(
    "/uploads",
    express.static(uploadsPath)
);


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "GyanAstra Backend is running 🚀"
    });

});


// ==========================================
// API STATUS
// ==========================================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        server: "GyanAstra Backend",
        status: "online",
        port: PORT
    });

});


// ==================================================
// COURSES API
// ==================================================


// ==========================================
// GET ALL COURSES
// ==========================================

app.get("/api/courses", (req, res) => {

    try {

        const courses = db.prepare(`
            SELECT *
            FROM courses
            ORDER BY id DESC
        `).all();

        res.json({
            success: true,
            count: courses.length,
            courses: courses
        });

    } catch (error) {

        console.error("GET COURSES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Courses fetch karne mein error hua"
        });

    }

});


// ==========================================
// GET SINGLE COURSE
// ==========================================

app.get("/api/courses/:id", (req, res) => {

    try {

        const id = Number(req.params.id);

        const course = db.prepare(`
            SELECT *
            FROM courses
            WHERE id = ?
        `).get(id);

        if (!course) {

            return res.status(404).json({
                success: false,
                message: "Course nahi mila"
            });

        }

        res.json({
            success: true,
            course: course
        });

    } catch (error) {

        console.error("GET SINGLE COURSE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Course fetch karne mein error hua"
        });

    }

});


// ==========================================
// CREATE COURSE
// ==========================================

app.post("/api/courses", (req, res) => {

    try {

        // Support both 'title' and 'name' from frontend/postman
        const courseTitle = req.body.title || req.body.name;

        const {
            description,
            level,
            type,
            thumbnail,
            image,
            status
        } = req.body;


        if (!courseTitle || courseTitle.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Course title required hai"
            });

        }

        const finalThumbnail = thumbnail || image || null;


        const result = db.prepare(`
            INSERT INTO courses
            (
                title,
                description,
                level,
                type,
                thumbnail,
                status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
        `).run(

            courseTitle.trim(),

            description || "",

            level || "beginner",

            type || "free",

            finalThumbnail,

            status || "published"

        );


        const newCourse = db.prepare(`
            SELECT *
            FROM courses
            WHERE id = ?
        `).get(result.lastInsertRowid);


        res.status(201).json({
            success: true,
            message: "Course successfully create ho gaya",
            course: newCourse
        });

    } catch (error) {

        console.error("CREATE COURSE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Course create karne mein error hua"
        });

    }

});


// ==========================================
// UPDATE COURSE
// ==========================================

app.put("/api/courses/:id", (req, res) => {

    try {

        const id = Number(req.params.id);

        const {
            title,
            name,
            description,
            level,
            type,
            thumbnail,
            image,
            status
        } = req.body;


        const existingCourse = db.prepare(`
            SELECT *
            FROM courses
            WHERE id = ?
        `).get(id);


        if (!existingCourse) {

            return res.status(404).json({
                success: false,
                message: "Course nahi mila"
            });

        }


        const inputTitle = title !== undefined ? title : name;

        const updatedTitle =
            inputTitle !== undefined
                ? inputTitle.trim()
                : existingCourse.title;


        if (!updatedTitle) {

            return res.status(400).json({
                success: false,
                message: "Course title required hai"
            });

        }

        const inputThumbnail = thumbnail !== undefined ? thumbnail : image;


        db.prepare(`
            UPDATE courses
            SET
                title = ?,
                description = ?,
                level = ?,
                type = ?,
                thumbnail = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(

            updatedTitle,

            description !== undefined
                ? description
                : existingCourse.description,

            level !== undefined
                ? level
                : existingCourse.level,

            type !== undefined
                ? type
                : existingCourse.type,

            inputThumbnail !== undefined
                ? inputThumbnail
                : existingCourse.thumbnail,

            status !== undefined
                ? status
                : existingCourse.status,

            id

        );


        const updatedCourse = db.prepare(`
            SELECT *
            FROM courses
            WHERE id = ?
        `).get(id);


        res.json({
            success: true,
            message: "Course successfully update ho gaya",
            course: updatedCourse
        });

    } catch (error) {

        console.error("UPDATE COURSE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Course update karne mein error hua"
        });

    }

});


// ==========================================
// DELETE COURSE
// ==========================================

app.delete("/api/courses/:id", (req, res) => {

    try {

        const id = Number(req.params.id);


        const existingCourse = db.prepare(`
            SELECT *
            FROM courses
            WHERE id = ?
        `).get(id);


        if (!existingCourse) {

            return res.status(404).json({
                success: false,
                message: "Course nahi mila"
            });

        }


        db.prepare(`
            DELETE FROM courses
            WHERE id = ?
        `).run(id);


        res.json({
            success: true,
            message: "Course successfully delete ho gaya"
        });

    } catch (error) {

        console.error("DELETE COURSE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Course delete karne mein error hua"
        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("--------------------------------");
    console.log("GyanAstra Backend Started 🚀");
    console.log("--------------------------------");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("--------------------------------");
    console.log("Courses API Ready 📚");
    console.log("--------------------------------");

});