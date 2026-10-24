
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML and CSS files
app.use(express.static(path.join(__dirname, "public")));

// Allowed course names
const allowedCourses = [
    "Computer Engineering",
    "Information Technology",
    "Mechanical Engineering",
    "Electronics Engineering"
];

// Array to store registered students (temporary storage)
const students = [];

// Server-side validation function
function validateStudent(data) {
    const errors = {};

    const name = typeof data.name === "string"
        ? data.name.trim().replace(/\s+/g, " ")
        : "";

    const roll = typeof data.roll === "string"
        ? data.roll.trim()
        : "";

    const email = typeof data.email === "string"
        ? data.email.trim()
        : "";

    const course = typeof data.course === "string"
        ? data.course.trim()
        : "";

    // Validate name
    if (name.length < 3 || name.length > 50) {
        errors.name = "Name must be between 3 and 50 characters.";
    } else if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) {
        errors.name = "Name must contain valid letters.";
    }

    // Validate roll number
    if (!/^[A-Za-z0-9-]{1,20}$/.test(roll)) {
        errors.roll = "Roll number must contain letters, numbers or hyphens.";
    } else if (students.some(s =>
        s.roll.toLowerCase() === roll.toLowerCase()
    )) {
        errors.roll = "This roll number is already registered.";
    }

    // Validate email
    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.email = "Please enter a valid email address.";
    } else if (students.some(s =>
        s.email.toLowerCase() === email.toLowerCase()
    )) {
        errors.email = "This email is already registered.";
    }

    // Validate course
    if (!allowedCourses.includes(course)) {
        errors.course = "Please select a valid course.";
    }

    return {
        errors,
        student: { name, roll, email, course }
    };
}

// POST route to register a student
app.post("/register", (req, res) => {
    const { errors, student } = validateStudent(req.body || {});

    // Reject invalid data on the server
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed. Please correct the errors.",
            errors
        });
    }

    // Save only after validation succeeds
    students.push(student);

    return res.status(201).json({
        success: true,
        message: "Student registered successfully!",
        student
    });
});

// Route to view registered students
app.get("/students", (req, res) => {
    res.json({
        success: true,
        count: students.length,
        students
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
