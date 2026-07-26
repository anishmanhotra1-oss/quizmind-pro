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
  if (!name || !name.trim()) return null;
  const cleanName = name.trim();
  const cleanEmail = (email && email.trim()) ? email.trim() : `${cleanName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
  
  // Local registration
  const students = getRegisteredStudents();
  const existingIndex = students.findIndex(s => s.name.toLowerCase() === cleanName.toLowerCase());
  
  let newStudent;
  if (existingIndex !== -1) {
    students[existingIndex] = {
      ...students[existingIndex],
      name: cleanName,
      lastLogin: new Date().toISOString()
    };
    newStudent = students[existingIndex];
    localStorage.setItem('QUIZMIND_STUDENTS', JSON.stringify(students));
  } else {
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

  // Always save exact name to active student session storage
  localStorage.setItem('QUIZMIND_STUDENT_NAME', cleanName);
  localStorage.setItem('QUIZMIND_STUDENT_EMAIL', cleanEmail);

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

export async function fetchStudentProfile(identifier) {
  if (!identifier) return null;
  try {
    const res = await fetch(`/api/students/profile/${encodeURIComponent(identifier)}`);
    if (res.ok) {
      const profile = await res.json();
      return profile;
    }
  } catch (e) {}

  const students = getRegisteredStudents();
  const found = students.find(s => 
    s.name.toLowerCase() === identifier.toLowerCase() || 
    s.email.toLowerCase() === identifier.toLowerCase() ||
    s.id.toLowerCase() === identifier.toLowerCase()
  );

  return found || {
    id: 'std-' + (Date.now().toString().slice(-4)),
    name: identifier,
    email: `${identifier.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
    joinedDate: new Date().toISOString().split('T')[0],
    device: 'Web Client',
    attemptsCount: 0,
    avgScore: 0,
    doubtsCount: 0,
    doubtsHistory: []
  };
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
