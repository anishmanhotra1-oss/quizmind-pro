// QuizMind Pro - Student Account Management & Registration Service (Server Sync + Local Storage)

const INITIAL_STUDENTS = [
  {
    id: 'std-101',
    name: 'Alex Morgan',
    email: 'alex.morgan@student.edu',
    joinedDate: '2026-07-20',
    device: 'Desktop / Chrome',
    attemptsCount: 3,
    avgScore: 88
  },
  {
    id: 'std-102',
    name: 'Jordan Miller',
    email: 'jordan.m@student.edu',
    joinedDate: '2026-07-22',
    device: 'Mobile / Safari',
    attemptsCount: 2,
    avgScore: 75
  },
  {
    id: 'std-103',
    name: 'Priya Sharma',
    email: 'priya.sharma@upsc.org',
    joinedDate: '2026-07-24',
    device: 'Tablet / Chrome',
    attemptsCount: 5,
    avgScore: 94
  }
];

export async function fetchLiveRegisteredStudents() {
  try {
    const res = await fetch('/api/students');
    if (res.ok) {
      const serverStudents = await res.json();
      localStorage.setItem('QUIZMIND_STUDENTS', JSON.stringify(serverStudents));
      return serverStudents;
    }
  } catch (e) {}

  return getRegisteredStudents();
}

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

export async function registerStudentAccount({ name, email, device }) {
  const cleanName = name.trim();
  const cleanEmail = (email && email.trim()) ? email.trim() : `${cleanName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
  
  // Local registration
  const students = getRegisteredStudents();
  const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase() || s.email.toLowerCase() === cleanEmail.toLowerCase());
  
  let newStudent = existing;
  if (!existing) {
    newStudent = {
      id: 'std-' + (Date.now().toString().slice(-4)),
      name: cleanName,
      email: cleanEmail,
      joinedDate: new Date().toISOString().split('T')[0],
      device: device || (window.innerWidth <= 768 ? 'Mobile Phone' : 'Desktop PC'),
      attemptsCount: 0,
      avgScore: 0
    };
    const updated = [newStudent, ...students];
    localStorage.setItem('QUIZMIND_STUDENTS', JSON.stringify(updated));
  }

  // Server sync for global Admin Dashboard auto-update from any device
  try {
    const res = await fetch('/api/students/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        device: device || (window.innerWidth <= 768 ? 'Mobile Phone' : 'Desktop PC')
      })
    });
    if (res.ok) {
      const serverRegistered = await res.json();
      return serverRegistered;
    }
  } catch (e) {
    console.warn('Backend server unavailable, registered locally.');
  }

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
