import axios from 'axios';
import { Student, ExtractedGoal } from '../types/Student';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const studentApi = {
  async addStudent(name: string, grade: string): Promise<{ success: boolean; student_id: number }> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('grade', grade);
    
    const response = await api.post('/students', formData);
    return response.data;
  },

  async extractGoals(file: File): Promise<{ success: boolean; goals: ExtractedGoal[] }> {
    const formData = new FormData();
    formData.append('iep_file', file);
    
    const response = await api.post('/extract-goals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async addStudentGoals(studentId: number, goals: ExtractedGoal[]): Promise<{ success: boolean }> {
    const response = await api.post(`/students/${studentId}/goals`, {
      goals: goals
    });
    return response.data;
  },

  async getStudent(studentId: number): Promise<Student> {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  }
};