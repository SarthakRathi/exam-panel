import React, { useState, useEffect } from 'react';
import { IHeader } from "./IHeader";
import "./ManageExams.css";
import { Link } from 'react-router-dom';

export const ManageExams = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState([]);
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamTimer, setNewExamTimer] = useState('');
  const [newExamTotalQuestions, setNewExamTotalQuestions] = useState('');


  useEffect(() => {
    const fetchExams = async () => {
      const response = await fetch('http://localhost:3001/courses');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      } else {
        alert('Failed to fetch courses');
      }
    };
    fetchExams();
  }, []);

  const handleAddExam = async (e) => {
    e.preventDefault();
    const newExam = { 
        course_code: newExamCode, 
        course_name: newExamName, 
        timer_minutes: newExamTimer, 
        total_questions: newExamTotalQuestions 
    };

    try {
        const response = await fetch('http://localhost:3001/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newExam)
        });

        if (response.ok) {
            setExams([...exams, newExam]);
            setNewExamCode('');
            setNewExamName('');
            setNewExamTimer('');
            setNewExamTotalQuestions('');
        } else {
            alert('Failed to add course');
        }
    } catch (error) {
        console.error('Error adding course:', error);
    }
};

  const filteredExams = exams.filter(exam =>
    exam.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <IHeader />

      <div className="container mt-5">
        <h1>Manage Exams</h1>

        <form onSubmit={handleAddExam} className="my-3">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Exam Code"
              value={newExamCode}
              onChange={(e) => setNewExamCode(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Exam Name"
              value={newExamName}
              onChange={(e) => setNewExamName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
              <input
                  type="number"
                  placeholder="Timer in minutes"
                  value={newExamTimer}
                  onChange={(e) => setNewExamTimer(e.target.value)}
                  className="form-control"
                  required
              />
          </div>
          <div className="mb-3">
              <input
                  type="number"
                  placeholder="Total Questions"
                  value={newExamTotalQuestions}
                  onChange={(e) => setNewExamTotalQuestions(e.target.value)}
                  className="form-control"
                  required
              />
          </div>  
          <button type="submit" className="btn btn-success">Add Exam</button>
        </form>

        <div className="input-group my-3">
          <input
            className="form-control"
            type="text"
            placeholder="Search by Code"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ul className="list-group mb-5">
          {filteredExams.map((exam, index) => (
            <li key={index} className="list-group-item">
              <span>{exam.course_code}</span>
              <span>{exam.course_name}</span>
              <Link to={`/manageCourse/${exam.course_code}`} className="btn btn-primary">Edit</Link>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
