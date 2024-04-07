import React, { useState, useEffect } from 'react';
import { IHeader } from './IHeader';
import { useNavigate } from 'react-router-dom';
import "./ManageStudents.css";
import Papa from 'papaparse';

export const ManageStudents = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:3001/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                console.error('Failed to fetch students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const manageStudents = (studentId) => {
        navigate(`/manageMarks/${studentId}`);
    };

    const downloadSampleFile = () => {
        const sampleText = "Roll Number,Name,Email\n" +
                           "12345,John Doe,johndoe@example.com\n" +
                           "54321,Jane Doe,janedoe@example.com";
        const blob = new Blob([sampleText], { type: 'text/csv' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = "sample_students.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateRandomPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < 6; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const downloadCSV = (csv, filename) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (result) => {
                    const uploadedStudents = result.data.map(student => ({
                        rollNumber: student['Roll Number'],
                        name: student['Name'],
                        email: student['Email'],
                        password: generateRandomPassword()
                    }));
    
                    try {
                        const responseExisting = await fetch('http://localhost:3001/students');
                        if (!responseExisting.ok) {
                            throw new Error('Failed to fetch existing students');
                        }
    
                        const existingStudents = await responseExisting.json();
                        const existingRollNumbers = existingStudents.map(student => student.roll_number);
                        const duplicateRollNumbers = uploadedStudents.filter(student => existingRollNumbers.includes(student.rollNumber)).map(student => student.rollNumber);
    
                        if (duplicateRollNumbers.length > 0) {
                            alert(`Duplicate roll numbers found: ${duplicateRollNumbers.join(', ')}`);
                            return;
                        }
                        const responseAdd = await fetch('http://localhost:3001/students/bulk', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(uploadedStudents)
                        });
                        
                        if (responseAdd.ok) {
                            alert('Students added successfully');
                            await fetchStudents();
                            const downloadData = uploadedStudents.map(({ rollNumber, password }) => ({
                                "Roll Number": rollNumber,
                                "Password": password
                            }));
                            const csv = Papa.unparse(downloadData, { header: true });
                            downloadCSV(csv, 'student_passwords.csv');
                        } else {
                            const errorData = await responseAdd.json();
                            alert('Failed to add students: ' + errorData.message);
                        }
                    } catch (error) {
                        
                    }
                }
            });
        }
    };
    

    return (
        <div>
            <IHeader />
            <div className="container mt-5">
                <h1>Manage Students</h1>

                <button type="button" className="btn btn-warning mb-2" onClick={downloadSampleFile}>
                    Download Sample File
                </button>
                <input className="form-control mb-5" type="file" id="formFile" onChange={handleFileUpload}/>

                <div className="input-group my-5">
                    <input
                        type="text"
                        className="form-control"
                        id="myInput"
                        placeholder="Search.."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <ul className="list-group" id="myList">
                    {filteredStudents.map(student => (
                        <li key={student.roll_number} className="list-group-item">
                            <span>{student.roll_number}</span>
                            <span>{student.name}</span>
                            <button onClick={() => manageStudents(student.roll_number)} className="btn btn-primary">
                                Manage
                            </button>
                        </li>
                    ))}
                </ul>  
            </div>
        </div>
    );
};
