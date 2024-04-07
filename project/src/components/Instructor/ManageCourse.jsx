import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IHeader } from "./IHeader";
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';


export const ManageCourse = () => {
    const navigate = useNavigate();
    const { courseCode } = useParams();
    const [course, setCourse] = useState(null);
    const [timer, setTimer] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [students, setStudents] = useState([]);
    const [showQuestions, setShowQuestions] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        answer: ''
    });

    useEffect(() => {
        const fetchCourse = async () => {
            const response = await fetch(`http://localhost:3001/courses/${courseCode}`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data.course_name); 
                setTimer(data.timer_minutes);
                setTotalQuestions(data.total_questions);
            }
        };
        fetchCourse();
    }, [courseCode]);
    
    

    const fetchQuestions = async () => {
        const response = await fetch(`http://localhost:3001/questions/${courseCode}`);
        if (response.ok) {
            const data = await response.json();
            setQuestions(data);
        }
    };

    const fetchStudents = async () => {
        const response = await fetch(`http://localhost:3001/marks/students/${courseCode}`);
        if (response.ok) {
            const data = await response.json();
            setStudents(data.sort((a, b) => b.marks - a.marks));
        }
    };

    useEffect(() => {
        if (showQuestions) {
            fetchQuestions();
        }
    }, [courseCode, showQuestions]);
    
    useEffect(() => {
        if (showStudents) {
            fetchStudents();
        }
    }, [courseCode, showStudents]);
    
    const toggleShowQuestions = () => {
        setShowStudents(false);
        setShowQuestions(prev => !prev);
    };
    
    const toggleShowStudents = () => {
        setShowQuestions(false);
        setShowStudents(prev => !prev);
    };
    

    const deleteCourse = async () => {
        if (window.confirm(`Are you sure you want to delete the course ${course?.course_name}?`)) {
            try {
                const response = await fetch(`http://localhost:3001/courses/${courseCode}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('Course deleted successfully');
                    navigate('/manageExams');
                    
                } else {
                    alert('Failed to delete the course');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('Error deleting the course');
            }
        }
    };    


    const handleQuestionChange = (e) => {
        setNewQuestion({ ...newQuestion, question: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = newQuestion.options.map((option, i) => 
            i === index ? value : option
        );
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    const handleAnswerChange = (e) => {
        setNewQuestion({ ...newQuestion, answer: e.target.value });
    };

    const addQuestion = async (e) => {
        e.preventDefault();
        
        const questionData = {
            course_code: courseCode,
            question_text: newQuestion.question,
            option_1: newQuestion.options[0],
            option_2: newQuestion.options[1],
            option_3: newQuestion.options[2],
            option_4: newQuestion.options[3],
            correct_option: newQuestion.answer
        };
    
        try {
            const response = await fetch('http://localhost:3001/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionData)
            });
    
            if (response.ok) {
                setQuestions([...questions, questionData]);
                setNewQuestion({ question: '', options: ['', '', '', ''], answer: '' });
            }
        } catch (error) {
            
        }
    };

    const deleteQuestion = async (questionId) => {
        try {
            const response = await fetch(`http://localhost:3001/questions/${questionId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setQuestions(questions.filter(question => question.question_id !== questionId));
            } else {
                alert('Failed to delete the question');
            }
        } catch (error) {
           
        }
    };

    const downloadSampleFile = () => {
        const sampleText = "Question,Option1,Option2,Option3,Option4,Answer\n" +
                           "What is 2+2?,1,2,3,4,4\n" +
                           "What is the capital of France?,Paris,London,Berlin,Madrid,Paris";
        const blob = new Blob([sampleText], { type: 'text/csv' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = "sample_questions.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const questions = data.slice(1).map((row) => ({
                    question_text: row[0],
                    option_1: row[1],
                    option_2: row[2],
                    option_3: row[3],
                    option_4: row[4],
                    correct_option: row[5],
                    course_code: courseCode
                }));

                for (let question of questions) {
                    await fetch('http://localhost:3001/questions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(question)
                    });
                }
                fetchQuestions();
            };
            reader.readAsBinaryString(file);
        }
    };
    

    return (
        <div>
            <IHeader />

            <div className="container mt-3">
                <h2>Manage Course</h2>

                <div className="mt-3">
                    <h6>Course Code: {courseCode}</h6>
                </div>
                <div className="my-3">
                    <h6>Course Name: {course}</h6>
                </div>
                <div className="my-3">
                    <h6>Timer: {timer} minutes</h6>
                </div>
                <div className="my-3">
                    <h6>Total Questions: {totalQuestions}</h6>
                </div>

                <button type="button" className="btn btn-danger mb-3" onClick={deleteCourse}>Delete Course</button>

                <hr/>

                <form id="mcqForm" onSubmit={addQuestion}>
                    <div className="form-group">
                        <label htmlFor="question">Question:</label>
                        <input type="text" className="form-control" id="question" value={newQuestion.question} onChange={handleQuestionChange} required />
                    </div>
                    {newQuestion.options.map((option, index) => (
                        <div className="form-group" key={index}>
                            <label htmlFor={`option${index + 1}`}>Option {index + 1}:</label>
                            <input type="text" className="form-control" id={`option${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} />
                        </div>
                    ))}
                    <div className="form-group">
                        <label htmlFor="answer">Answer:</label>
                        <input type="text" className="form-control mb-3" id="answer" value={newQuestion.answer} onChange={handleAnswerChange} required />
                    </div>
                    <div>
                    <button type="submit" className="btn btn-warning mb-2 me-3">Add Question</button>

                    <hr/>

                    <button type="button" className="btn btn-warning mb-2" onClick={downloadSampleFile}>
                        Download Sample File
                    </button>
                    <input className="form-control" type="file" id="formFile" onChange={handleFileUpload}/>

                    <hr/>
                    </div>

                </form>

                    <button type="button" className="btn btn-primary mb-5 me-3" onClick={toggleShowQuestions}>Show Questions</button>
                    <button type="button" className="btn btn-primary mb-5" onClick={toggleShowStudents}>Show Students</button>
                
                    {showQuestions && (
                    <div>
                        <h3>Questions</h3>
                        <ul id="questionsList" className="list-group my-5">
                            {questions.map((question, index) => (
                                <li key={index} className="list-group-item">
                                     <div className="d-flex.column">
                                    <p>Question: {question.question_text}</p>
                                    <ul>
                                        <li>Option 1: {question.option_1}</li>
                                        <li>Option 2: {question.option_2}</li>
                                        <li>Option 3: {question.option_3}</li>
                                        <li>Option 4: {question.option_4}</li>
                                    </ul>
                                    <p>Answer: {question.correct_option}</p>
                                    <button type="button" className="btn btn-danger" onClick={() => deleteQuestion(question.question_id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {showStudents && (
                    <div>
                        <h3>Students</h3>
                        <ul className="list-group my-5">
                            {students.map((student, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between">
                                    <p>{student.roll_number}</p> <p>{student.name}</p> <p>Marks: {student.marks}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
