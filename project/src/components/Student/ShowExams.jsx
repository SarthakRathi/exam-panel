import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ShowExams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const studentRollNumber = localStorage.getItem('studentRollNumber');
    const [studentDetails, setStudentDetails] = useState({
        name: '',
        email: '',
        rollNumber: ''
    });

    useEffect(() => {
        const fetchExams = async () => {
            const examsResponse = await fetch('http://localhost:3001/courses');
            const examsData = await examsResponse.json();

            const marksResponse = await fetch(`http://localhost:3001/marks/${studentRollNumber}`);
            const marksData = await marksResponse.json();

            const studentResponse = await fetch(`http://localhost:3001/students/${studentRollNumber}`);
            const studentData = await studentResponse.json();

            setStudentDetails({
                name: studentData.name,
                email: studentData.email,
                rollNumber: studentData.roll_number
            });

            const combinedData = examsData.map(exam => {
                const mark = marksData.find(mark => mark.course_code === exam.course_code);
                return {
                    courseCode: exam.course_code,
                    title: exam.course_name,
                    status: mark ? `Marks: ${mark.marks}` : 'Not Attempted',
                    disabled: !!mark
                };
            });

            setExams(combinedData);
        };

        fetchExams();
    }, [studentRollNumber]);

    const logout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const giveExam = (courseCode) => {
        navigate(`/giveExam/${courseCode}`);
    };

    return (
        <div>
            <nav className="navbar navbar-light px-3" style={{backgroundColor: "#0e1c36", color: "whitesmoke", fontSize: "22px"}}>
                <span className="mb-0 h4">Student Dashboard</span>
                <button className="btn btn-outline-danger my-2 my-sm-0" type="button" onClick={logout}>Logout</button>
            </nav>
            <div className="studD mt-5 mx-5">
            <div className="my-3"   >
                    <h6>Name: {studentDetails.name}</h6>
                </div>
                <div className="my-3">
                    <h6>Email: {studentDetails.email}</h6>
                </div>
                <div className="my-3">
                    <h6>Roll number: {studentDetails.rollNumber}</h6>
                </div>
                <h6 style={{ color: 'red', fontStyle: 'italic' }}>
                    If above details are wrong contact staff to update.
                </h6>
            </div>
            
            <div className="container mt-5">
                <div className="row">
                    {exams.map((exam, index) => (
                        <div key={index} className="col-md-4 mt-3 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{exam.title}</h5>
                                    <p className="card-text">{exam.status}</p>
                                    <button onClick={() => giveExam(exam.courseCode)} className="btn btn-primary" disabled={exam.disabled}>Start Exam</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShowExams;
