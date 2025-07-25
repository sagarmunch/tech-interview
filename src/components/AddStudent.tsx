import React, { useState } from 'react';
import { studentApi } from '../services/api';
import { ExtractedGoal } from '../types/Student';
import GoalSelector from './GoalSelector';

interface AddStudentProps {
  onStudentAdded?: (studentId: number) => void;
}

const AddStudent: React.FC<AddStudentProps> = ({ onStudentAdded }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [iepFile, setIepFile] = useState<File | null>(null);
  const [extractedGoals, setExtractedGoals] = useState<ExtractedGoal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<ExtractedGoal[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'form' | 'goals' | 'complete'>('form');

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await studentApi.addStudent(name, grade);

      setCurrentStudentId(result.student_id);
      
      if (iepFile) {
        await handleExtractGoals();
      } else {
        setStep('complete');
      }
    } catch (err) {
      setError('Failed to add student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractGoals = async () => {
    if (!iepFile) return;
    
    setIsLoading(true);
    try {
      const result = await studentApi.extractGoals(iepFile);
      
      setExtractedGoals(result.goals);
      setStep('goals');
    } catch (err) {
      setError('Error processing IEP file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalsSubmit = async () => {
    
    setIsLoading(true);
    try {
      const result = await studentApi.addStudentGoals(currentStudentId, selectedGoals);

      setStep('complete');
      onStudentAdded?.(currentStudentId);
    } catch (err) {
      setError('Failed to save learning goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIepFile(file || null);
  };

  const renderForm = () => (
    <div className="add-student-form">
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmitStudent}>
        <div className="form-group">
          <label htmlFor="name">Student Name:</label>
          <input
            type="email"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="grade">Grade:</label>
          <select
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          >
            <option value="">Select Grade</option>
            <option value="K">Kindergarten</option>
            <option value="1">1st Grade</option>
            <option value="2">2nd Grade</option>
            <option value="3">3rd Grade</option>
            <option value="4">4th Grade</option>
            <option value="5">5th Grade</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="iep">IEP Document (PDF):</label>
          <input
            type="file"
            id="iep"
            onChange={handleFileChange}
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Add Student & Extract Goals'}
        </button>
      </form>
    </div>
  );

  const renderGoalSelection = () => (
    <div className="goal-selection">
      <h2>Select Learning Goals for {name}</h2>
      <GoalSelector
        goals={extractedGoals}
        selectedGoals={selectedGoals}
        onGoalsChange={setSelectedGoals}
      />
      <div className="goal-actions">
        <button onClick={() => setStep('form')}>Back</button>
        <button 
          onClick={handleGoalsSubmit}
          disabled={isLoading || selectedGoals.length === 0}
        >
          {isLoading ? 'Saving...' : 'Save Selected Goals'}
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="completion-message">
      <h2>Student Added Successfully!</h2>
      <p>Student {name} has been added with {selectedGoals.length} learning goals.</p>
      <button onClick={() => {
        setStep('form');
        setName('');
        setGrade('');
        setIepFile(null);
        setExtractedGoals([]);
        setSelectedGoals([]);
        setCurrentStudentId(null);
        setError('');
      }}>
        Add Another Student
      </button>
    </div>
  );

  return (
    <div className="add-student-container">
      {error && <div className="error-message">{error}</div>}
      
      {step === 'form' && renderForm()}
      {step === 'goals' && renderGoalSelection()}
      {step === 'complete' && renderComplete()}
    </div>
  );
};

export default AddStudent;