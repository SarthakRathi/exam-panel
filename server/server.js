const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let db;

(async () => {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'exampanel'
        });
        console.log('Connected to the MySQL database');

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Database connection error:', err);
    }
})();

app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.send(`The solution is: ${rows[0].solution}`);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).send('Error executing query');
    }
});

//Register
app.post('/register', async (req, res) => {
    const { name, roll, email, password } = req.body;

    const checkExistenceQuery = `SELECT * FROM users WHERE roll_number = ? OR email = ?`;

    try {
        const [results] = await db.query(checkExistenceQuery, [roll, email]);

        if (results.length > 0) {
            const isRollExists = results.some(result => result.roll_number === roll);
            const isEmailExists = results.some(result => result.email === email);

            if (isRollExists && isEmailExists) {
                return res.status(409).send('Roll number and email already exist');
            } else if (isRollExists) {
                return res.status(409).send('Roll number already exists');
            } else {
                return res.status(409).send('Email already exists');
            }
        }

        const insertQuery = `INSERT INTO users (name, roll_number, email, password) VALUES (?, ?, ?, ?)`;
        await db.query(insertQuery, [name, roll, email, password]);
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).send('Error in registration');
    }
});

//Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT roll_number, email, password FROM users WHERE email = ? AND password = ?';

    try {
        const [results] = await db.query(query, [email, password]);

        if (results.length > 0) {
            const user = results[0];
            res.json({ message: 'Login successful', rollNumber: user.roll_number });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

//Manage Exams
app.get('/courses', async (req, res) => {
    const query = 'SELECT * FROM Courses';
    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Error fetching courses');
    }
});

app.post('/courses', async (req, res) => {
    const { course_code, course_name, timer_minutes, total_questions } = req.body;
    const query = 'INSERT INTO Courses (course_code, course_name, timer_minutes, total_questions) VALUES (?, ?, ?, ?)';

    try {
        const [results] = await db.query(query, [course_code, course_name, timer_minutes, total_questions]);
        res.status(201).send('Course added successfully');
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).send('Error adding course');
    }
});


//Manage Course
app.get('/courses/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const query = 'SELECT course_name, timer_minutes, total_questions FROM courses WHERE course_code = ?';

    try {
        const [results] = await db.query(query, [courseCode]);
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).send('Course not found');
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).send('Error fetching course');
    }
});


app.delete('/courses/:courseCode', async (req, res) => {
    const { courseCode } = req.params;

    try {
        const deleteQuestionsQuery = 'DELETE FROM questions WHERE course_code = ?';
        await db.query(deleteQuestionsQuery, [courseCode]);

        const deleteCourseQuery = 'DELETE FROM courses WHERE course_code = ?';
        await db.query(deleteCourseQuery, [courseCode]);

        res.status(200).send('Course and related questions deleted successfully');
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send('Error deleting course');
    }
});

//Questions
app.post('/questions', async (req, res) => {
    const { course_code, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;
    const query = `
        INSERT INTO questions (course_code, question_text, option_1, option_2, option_3, option_4, correct_option)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        await db.query(query, [course_code, question_text, option_1, option_2, option_3, option_4, correct_option]);
        res.status(201).send('Question added successfully');
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).send('Error adding question');
    }
});

app.get('/questions/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const query = 'SELECT * FROM questions WHERE course_code = ?';

    try {
        const [results] = await db.query(query, [courseCode]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).send('Error fetching questions');
    }
});

app.delete('/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const query = 'DELETE FROM questions WHERE question_id = ?';

    try {
        await db.query(query, [questionId]);
        res.status(200).send('Question deleted successfully');
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).send('Error deleting question');
    }
});

//Marks and Students
app.get('/marks/students/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const query = `
        SELECT u.roll_number, u.name, m.marks
        FROM marks m
        JOIN users u ON m.roll_number = u.roll_number
        WHERE m.course_code = ?
        ORDER BY m.marks DESC
    `;

    try {
        const [results] = await db.query(query, [courseCode]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).json({ error: 'Error fetching student marks' });
    }
});

//Manage Students
app.get('/students', async (req, res) => {
    try {
        const [results] = await db.query('SELECT roll_number, name FROM users');
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Error fetching students');
    }
});

app.post('/students/bulk', async (req, res) => {
    const students = req.body;
    try {
        for (const student of students) {
            await db.query('INSERT INTO users (roll_number, name, email, password) VALUES (?, ?, ?, ?)', 
                [student.rollNumber, student.name, student.email, student.password]);
        }
        res.status(200).send('Students added successfully');
    } catch (error) {
        console.error('Failed to add students:', error);
        res.status(500).send('Failed to add students');
    }
});

app.get('/students/:rollNumber', async (req, res) => {
    const { rollNumber } = req.params;
    const query = 'SELECT * FROM users WHERE roll_number = ?';

    try {
        const [results] = await db.query(query, [rollNumber]);
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).send('Student not found');
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).send('Error fetching student details');
    }
});

app.delete('/students/:rollNumber', async (req, res) => {
    const { rollNumber } = req.params;

    try {
        const deleteMarksQuery = 'DELETE FROM marks WHERE roll_number = ?';
        await db.query(deleteMarksQuery, [rollNumber]);

        const deleteUserQuery = 'DELETE FROM users WHERE roll_number = ?';
        const [results] = await db.query(deleteUserQuery, [rollNumber]);

        if (results.affectedRows > 0) {
            res.status(200).send('Student deleted successfully');
        } else {
            res.status(404).send('Student not found');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send('Error deleting student');
    }
});

//Marks
app.get('/marks/:rollNumber', async (req, res) => {
    const { rollNumber } = req.params;
    const query = `
        SELECT m.roll_number, m.course_code, c.course_name, m.marks
        FROM marks m
        JOIN courses c ON m.course_code = c.course_code
        WHERE m.roll_number = ?
    `;

    try {
        const [results] = await db.query(query, [rollNumber]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching marks:', error);
        res.status(500).send('Error fetching marks');
    }
});

app.delete('/marks/:rollNumber/:courseCode', async (req, res) => {
    const { rollNumber, courseCode } = req.params;
    const deleteQuery = 'DELETE FROM marks WHERE roll_number = ? AND course_code = ?';

    try {
        await db.query(deleteQuery, [rollNumber, courseCode]);
        res.status(200).send('Marks deleted successfully');
    } catch (error) {
        console.error('Error deleting marks:', error);
        res.status(500).send('Error deleting marks');
    }
});

// Show Exams
app.get('/courses', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM courses');
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Error fetching courses');
    }
});

// Give Exam
app.post('/marks/:rollNumber/:courseCode', async (req, res) => {
    const { rollNumber, courseCode } = req.params;
    const { marks } = req.body;

    const query = 'INSERT INTO marks (roll_number, course_code, marks) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE marks = ?';

    try {
        await db.query(query, [rollNumber, courseCode, marks, marks]);
        res.status(200).send('Marks saved successfully');
    } catch (error) {
        console.error('Error saving marks:', error);
        res.status(500).send('Error saving marks');
    }
});
