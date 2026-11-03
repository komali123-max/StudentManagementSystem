
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((error) => console.log('MongoDB Error:', error));

// Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    branch: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
});

const Student = mongoose.model('Student', studentSchema);

// Home route
app.get('/', (req, res) => {
    res.send('Student Management System Backend is Running!');
});

// CREATE - Add student
app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({
            message: 'Student Added Successfully!',
            student
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ - Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE - Update student
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student Not Found' });
        }

        res.json({
            message: 'Student Updated Successfully!',
            student
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Delete student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student Not Found' });
        }

        res.json({ message: 'Student Deleted Successfully!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
