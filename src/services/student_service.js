// QuizMind Pro - Student Account Management & Registration Service

const INITIAL_STUDENTS = [
  {
    id: 'std-101',
    name: 'Alex Morgan',
    email: 'alex.morgan@student.edu',
    joinedDate: '2026-07-20',
    attemptsCount: 3,
    avgScore: 88
  },
  {
    id: 'std-102',
    name: 'Jordan Miller',
    email: 'jordan.m@student.edu',
    joinedDate: '2026-07-22',
    attemptsCount: 2,
    avgScore: 75
  },
  {
    id: 'std-103',
    name: 'Priya Sharma',
    email: 'priya.sharma@upsc.org',
    joinedDate: '2026-07-24',
    attemptsCount: 5,
    avgScore: 94
  }
];

export function getRegisteredStudents() {
  const saved = localStorage.getItem('QUIZMIND_STUDENTS');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading stored students:', e);
    }
  }
  return INITIAL_STUDENTS;
}

export function registerStudentAccount({ name, email }) {
  const students = getRegisteredStudents();
  const cleanName = name.trim();
  const cleanEmail = (email && email.trim()) ? email.trim() : `${cleanName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
  
  // Check if student already exists
  const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase() || s.email.toLowerCase() === cleanEmail.toLowerCase());
  
  if (existing) {
    return existing;
  }

  const newStudent = {
    id: 'std-' + (Date.now().toString().slice(-4)),
    name: cleanName,
    email: cleanEmail,
    joinedDate: new Date().toISOString().split('T')[0],
    attemptsCount: 0,
    avgScore: 0
  };

  const updated = [newStudent, ...students];
  localStorage.setItem('QUIZMIND_STUDENTS', JSON.stringify(updated));
  return newStudent;
}

export function updateStudentStats(studentName, newScorePercentage) {
  const students = getRegisteredStudents();
  const updated = students.map(std => {
    if (std.name.toLowerCase() === studentName.toLowerCase()) {
      const newAttemptsCount = (std.attemptsCount || 0) + 1;
      const currentAvg = std.avgScore || 0;
      const newAvg = Math.round(((currentAvg * (newAttemptsCount - 1)) + newScorePercentage) / newAttemptsCount);
      return {
        ...std,
        attemptsCount: newAttemptsCount,
        avgScore: newAvg
      };
    }
    return std;
  });

  localStorage.setItem('QUIZMIND_STUDENTS', JSON.stringify(updated));
}
