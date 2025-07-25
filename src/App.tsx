import React from 'react';
import AddStudent from './components/AddStudent';
import './App.css';

function App() {
  const handleStudentAdded = (studentId: number) => {
    console.log('Student added with ID:', studentId);
    // Could redirect to student detail page or show success message
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Student Management System</h1>
      </header>
      <main>
        <AddStudent onStudentAdded={handleStudentAdded} />
      </main>
    </div>
  );
}

export default App;