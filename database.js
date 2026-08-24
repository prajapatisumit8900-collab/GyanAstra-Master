const Database = require("better-sqlite3");
const path = require("path");

// ==========================================
// DATABASE FILE
// ==========================================

const dbPath = path.join(__dirname, "gyanastra.db");

const db = new Database(dbPath);


// ==========================================
// DATABASE SETTINGS
// ==========================================

db.pragma("journal_mode = WAL");

db.pragma("foreign_keys = ON");


// ==========================================
// COURSES TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS courses (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        title TEXT NOT NULL,

        description TEXT,

        level TEXT DEFAULT 'beginner',

        type TEXT DEFAULT 'free',

        thumbnail TEXT,

        status TEXT DEFAULT 'published',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

    );
`);


// ==========================================
// SUBJECTS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        course_id INTEGER NOT NULL,

        title TEXT NOT NULL,

        description TEXT,

        status TEXT DEFAULT 'published',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (course_id)
            REFERENCES courses(id)
            ON DELETE CASCADE

    );
`);


// ==========================================
// CHAPTERS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        subject_id INTEGER NOT NULL,

        title TEXT NOT NULL,

        description TEXT,

        chapter_order INTEGER DEFAULT 0,

        status TEXT DEFAULT 'published',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (subject_id)
            REFERENCES subjects(id)
            ON DELETE CASCADE

    );
`);


// ==========================================
// CONTENT TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS content (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        course_id INTEGER NOT NULL,

        subject_id INTEGER NOT NULL,

        chapter_id INTEGER NOT NULL,

        content_type TEXT NOT NULL,

        title TEXT NOT NULL,

        description TEXT,

        file_url TEXT,

        external_url TEXT,

        thumbnail TEXT,

        status TEXT DEFAULT 'published',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (course_id)
            REFERENCES courses(id)
            ON DELETE CASCADE,

        FOREIGN KEY (subject_id)
            REFERENCES subjects(id)
            ON DELETE CASCADE,

        FOREIGN KEY (chapter_id)
            REFERENCES chapters(id)
            ON DELETE CASCADE

    );
`);


// ==========================================
// STUDENTS TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS students (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        email TEXT UNIQUE NOT NULL,

        password TEXT,

        avatar TEXT,

        status TEXT DEFAULT 'active',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

    );
`);


// ==========================================
// ADMIN TABLE
// ==========================================

db.exec(`
    CREATE TABLE IF NOT EXISTS admins (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        email TEXT UNIQUE NOT NULL,

        password TEXT NOT NULL,

        status TEXT DEFAULT 'active',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    );
`);


// ==========================================
// DEFAULT ADMIN
// ==========================================

const adminExists = db
    .prepare(`
        SELECT id
        FROM admins
        WHERE email = ?
    `)
    .get("admin@gyanastra.com");


if (!adminExists) {

    db.prepare(`
        INSERT INTO admins
        (
            name,
            email,
            password
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    `).run(
        "GyanAstra Admin",
        "admin@gyanastra.com",
        "admin123"
    );

}


// ==========================================
// DATABASE READY
// ==========================================

console.log("--------------------------------");
console.log("GyanAstra Database Ready 🗄️");
console.log("--------------------------------");


// ==========================================
// EXPORT DATABASE
// ==========================================

module.exports = db;