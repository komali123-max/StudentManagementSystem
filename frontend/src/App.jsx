
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    branch: '',
    email: '',
    year: ''
  });

  const [editingId, setEditingId] = useState(null);

  const API = 'http://localhost:5000/api/students';

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await fetch(API);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.log('Error fetching students:', error);
    }
  };

  // Load students when page opens
  useEffect(() => {
    fetchStudents();
  }, []);

  // Dashboard calculations
  const totalStudents = students.length;

  const totalBranches = new Set(
    students.map((student) => student.branch.toUpperCase())
  ).size;

  // Search students
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Add or update student
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (
      !form.name.trim() ||
      !form.rollNumber.trim() ||
      !form.branch.trim() ||
      !form.email.trim() ||
      !form.year
    ) {
      alert('Please fill all the fields!');
      return;
    }

    // Validate email
    const emailPattern =
      /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailPattern.test(form.email.trim())) {
      alert(
        'Email must start with a small letter and must contain a valid email address!'
      );
      return;
    }

    // Validate year
    if (
      !Number.isInteger(Number(form.year)) ||
      Number(form.year) < 1 ||
      Number(form.year) > 4
    ) {
      alert('Year must be between 1 and 4!');
      return;
    }

    try {
      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          rollNumber: form.rollNumber.trim(),
          branch: form.branch.trim(),
          email: form.email.trim(),
          year: Number(form.year)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message && result.message.includes('duplicate')) {
          alert('This roll number already exists!');
        } else {
          alert(result.message || 'Something went wrong!');
        }
        return;
      }

      alert(result.message);

      setForm({
        name: '',
        rollNumber: '',
        branch: '',
        email: '',
        year: ''
      });

      setEditingId(null);
      fetchStudents();

    } catch (error) {
      alert('Unable to connect to backend!');
    }
  };

  // Edit student
  const handleEdit = (student) => {
    setForm({
      name: student.name,
      rollNumber: student.rollNumber,
      branch: student.branch,
      email: student.email,
      year: student.year.toString()
    });

    setEditingId(student._id);

    document.getElementById('add-student')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Delete student
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this student?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'Delete failed!');
        return;
      }

      alert(result.message);
      fetchStudents();

    } catch (error) {
      alert('Unable to connect to backend!');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);

    setForm({
      name: '',
      rollNumber: '',
      branch: '',
      email: '',
      year: ''
    });
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header id="home">
        <h1>Student Management System</h1>
        <p>Manage Student Records Easily</p>
      </header>

      {/* NAVIGATION BAR */}
      <nav className="navbar">
        <a href="#home">Home</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#add-student">Add Student</a>
        <a href="#records">Student Records</a>
        <a href="#about">About</a>
      </nav>

      <main>

        {/* DASHBOARD */}
        <section className="dashboard" id="dashboard">

          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{totalStudents}</p>
          </div>

          <div className="stat-card">
            <h3>Total Branches</h3>
            <p>{totalBranches}</p>
          </div>

        </section>

        {/* STUDENT FORM */}
        <section className="form-section" id="add-student">

          <h2>
            {editingId ? 'Update Student' : 'Add New Student'}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number"
              value={form.rollNumber}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="branch"
              placeholder="Branch (e.g. CSE)"
              value={form.branch}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="year"
              placeholder="Year of Study (1-4)"
              min="1"
              max="4"
              value={form.year}
              onChange={handleChange}
              required
            />

            <button type="submit">
              {editingId ? 'Update Student' : 'Add Student'}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

          </form>

        </section>

        {/* STUDENT RECORDS */}
        <section className="table-section" id="records">

          <h2>Student Records</h2>

          {/* SEARCH BAR */}
          <input
            className="search-box"
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>Email</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6">No students found</td>
                  </tr>
                ) : (

                  filteredStudents.map((student) => (

                    <tr key={student._id}>

                      <td>{student.name}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.branch}</td>
                      <td>{student.email}</td>
                      <td>{student.year}</td>

                      <td>
                        <button
                          className="edit"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ABOUT SECTION */}
        <section className="about-section" id="about">

          <h2>About Our Project</h2>

          <p>
            Student Management System is a web-based application
            developed to manage student information efficiently.
            It allows users to add, view, update, delete and search
            student records.
          </p>

          <p>
            <strong>Frontend:</strong> React.js
            <br />
            <strong>Backend:</strong> Node.js and Express.js
            <br />
            <strong>Database:</strong> MongoDB
          </p>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          © 2026 Student Management System | All Rights Reserved
        </p>
      </footer>

    </div>
  );
}

export default App;
