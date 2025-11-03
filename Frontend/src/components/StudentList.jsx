import React from 'react';
import StudentCard from './StudentCard';

export default function StudentList({ students = [] }) {
  if (!students || students.length === 0) {
    return <div className="muted">No students loaded yet.</div>;
  }
  return (
    <div className="student-list">
      {students.map(s => <StudentCard key={s.student_id} student={s} />)}
    </div>
  );
}
