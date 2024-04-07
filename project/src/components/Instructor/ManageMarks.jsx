import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IHeader } from './IHeader';
import { useNavigate } from 'react-router-dom';

export const ManageMarks = () => {
    const { rollNumber } = useParams();
    const [marksDetails, setMarksDetails] = useState([]);
    const navigate = useNavigate();

    const fetchMarks = async () => {
        const response = await fetch(`http://localhost:3001/marks/${rollNumber}`);
        if (response.ok) {
            const data = await response.json();
            setMarksDetails(data);
        }
    };

    const [student, setStudent] = useState({ name: '', rollNumber: '', email: '', password: '' });

    useEffect(() => {
    const fetchStudentDetails = async () => {
        const response = await fetch(`http://localhost:3001/students/${rollNumber}`);
        if (response.ok) {
            const data = await response.json();
            setStudent({
                name: data.name,
                rollNumber: data.roll_number,
                email: data.email,
                password: data.password
            });
        }
    };

    fetchMarks();
    fetchStudentDetails();
}, [rollNumber]);

const deleteStudent = async () => {
    try {
        const response = await fetch(`http://localhost:3001/students/${rollNumber}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            navigate('/manageStudents');
        }
    } catch (error) {
    }
};


    const handleRetest = async (rollNumber, courseCode) => {
        try {
            const response = await fetch(`http://localhost:3001/marks/${rollNumber}/${courseCode}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchMarks();
            }
        } catch (error) {
            console.error('Error deleting marks:', error);
        }
    };

    return (
        <div>
            <IHeader />
            <div className="container mt-5">
                <h2>Student Marks Details</h2>
                <div className="my-5">
                    <h6>Roll number: {student.rollNumber}</h6>
                    <h6>Name: {student.name}</h6>
                    <h6>Mail: {student.email}</h6>
                    <h6>Password: {student.password}</h6>
                    <button type="button" className="btn btn-danger mt-2" onClick={deleteStudent}>Delete Student</button>
                </div>
                <h3 className="my-4">Marks Details</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Subject</th>
                            <th scope="col">Marks Obtained</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marksDetails.map((detail, index) => (
                            <tr key={index}>
                                <td>{detail.course_name}</td>
                                <td>{detail.marks}</td>
                                <td>
                                    <button className="btn btn-warning" onClick={() => handleRetest(detail.roll_number, detail.course_code)}>
                                        RETEST
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageMarks;
