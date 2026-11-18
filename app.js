// Initialize Lucide Icons
lucide.createIcons();

// Mobile Menu Toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
});

const DB_KEY = 'edumanage_students_v1';
const MARKS_KEY = 'edumanage_marks_v1';

function getStudents() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
}

function saveStudents(students) {
    localStorage.setItem(DB_KEY, JSON.stringify(students));
    updateDashboardStats();
    renderStudentTable();
}

function getMarks() {
    const data = localStorage.getItem(MARKS_KEY);
    return data ? JSON.parse(data) : {};
}

function saveMarks(marks) {
    localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-slate-700');
    });
    const activeBtn = document.getElementById('btn-' + tabId);
    if (activeBtn) {
        activeBtn.classList.add('tab-active');
        activeBtn.classList.remove('text-slate-700');
    }
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('hidden');
    }
}

// Add Single Student
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const students = getStudents();
    const newId = document.getElementById('studentId').value.trim();

    if (students.some(s => s.id === newId)) {
        alert('এই আইডি নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে!');
        return;
    }

    students.push({
        id: newId,
        name: document.getElementById('studentName').value.trim(),
        class: document.getElementById('studentClass').value,
        roll: document.getElementById('studentRoll').value,
        gender: document.getElementById('studentGender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        fatherName: document.getElementById('fatherName').value.trim(),
        motherName: document.getElementById('motherName').value.trim(),
        phone: document.getElementById('guardianPhone').value.trim(),
        address: document.getElementById('address').value.trim()
    });

    saveStudents(students);
    this.reset();
    alert('শিক্ষার্থীর প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!');
    switchTab('student-list');
});

// Render Student Table
function renderStudentTable() {
    const students = getStudents();
    const search = document.getElementById('searchInput').value.toLowerCase();
    const classFilter = document.getElementById('filterClass').value;
    const tbody = document.getElementById('studentTableBody');

    const filtered = students.filter(s => {
        return (s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search) || s.phone.includes(search)) && 
               (classFilter === '' || s.class === classFilter);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => `
        <tr class="hover:bg-slate-50">
            <td class="p-3 font-semibold text-blue-700">${s.id}</td>
            <td class="p-3 font-medium">${s.name} <span class="text-xs text-slate-400 block">${s.gender}</span></td>
            <td class="p-3">${s.class} (রোল: ${s.roll})</td>
            <td class="p-3">${s.fatherName}</td>
            <td class="p-3">${s.phone}</td>
            <td class="p-3"><span class="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-bold">${s.bloodGroup || '-'}</span></td>
            <td class="p-3 text-center">
                <button onclick="deleteStudent('${s.id}')" class="text-red-600 hover:bg-red-50 p-1.5 rounded" title="ডিলিট">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function deleteStudent(id) {
    if (confirm('নিশ্চিতভাবে এই শিক্ষার্থীর তথ্য মুছতে চান?')) {
        saveStudents(getStudents().filter(s => s.id !== id));
    }
}

function updateDashboardStats() {
    const students = getStudents();
    document.getElementById('stat-total').innerText = students.length;
    document.getElementById('stat-male').innerText = students.filter(s => s.gender === 'ছাত্র').length;
    document.getElementById('stat-female').innerText = students.filter(s => s.gender === 'ছাত্রী').length;
    document.getElementById('stat-classes').innerText = new Set(students.map(s => s.class)).size;
}

// ================= EXAM & MARKS SYSTEM =================

function loadStudentsForMarks() {
    const className = document.getElementById('marksClass').value;
    const exam = document.getElementById('examName').value;
    const container = document.getElementById('marksEntryContainer');
    const tbody = document.getElementById('marksTableBody');

    if (!className) {
        alert('অনুগ্রহ করে প্রথমে শ্রেণি নির্বাচন করুন।');
        container.classList.add('hidden');
        return;
    }

    const students = getStudents().filter(s => s.class === className).sort((a, b) => Number(a.roll) - Number(b.roll));
    const allMarks = getMarks();

    if (students.length === 0) {
        alert('এই শ্রেণিতে কোনো শিক্ষার্থী নেই।');
        container.classList.add('hidden');
        return;
    }

    document.getElementById('marksTableTitle').innerText = `${exam} - শ্রেণি: ${className}`;
    container.classList.remove('hidden');

    tbody.innerHTML = students.map(s => {
        const studentMarks = allMarks[s.id]?.[exam] || { bangla: '', english: '', math: '', science: '', social: '' };
        return `
            <tr>
                <td class="p-3 font-bold">${s.roll}</td>
                <td class="p-3">${s.name} <span class="text-xs text-slate-400 block">ID: ${s.id}</span></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="bangla" value="${studentMarks.bangla}" class="mark-input w-20 border rounded p-1 text-center" placeholder="0-100"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="english" value="${studentMarks.english}" class="mark-input w-20 border rounded p-1 text-center" placeholder="0-100"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="math" value="${studentMarks.math}" class="mark-input w-20 border rounded p-1 text-center" placeholder="0-100"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="science" value="${studentMarks.science}" class="mark-input w-20 border rounded p-1 text-center" placeholder="0-100"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="social" value="${studentMarks.social}" class="mark-input w-20 border rounded p-1 text-center" placeholder="0-100"></td>
            </tr>
        `;
    }).join('');
}

function saveAllMarks() {
    const exam = document.getElementById('examName').value;
    const allMarks = getMarks();
    const inputs = document.querySelectorAll('.mark-input');

    inputs.forEach(input => {
        const id = input.getAttribute('data-id');
        const sub = input.getAttribute('data-sub');
        const val = input.value === '' ? '' : Number(input.value);

        if (!allMarks[id]) allMarks[id] = {};
        if (!allMarks[id][exam]) allMarks[id][exam] = { bangla: '', english: '', math: '', science: '', social: '' };

        allMarks[id][exam][sub] = val;
    });

    saveMarks(allMarks);
    alert('সকল শিক্ষার্থীর পরীক্ষার নম্বর সফলভাবে সংরক্ষিত হয়েছে!');
}

// ================= MERIT LIST & GPA CALCULATION =================

function calculateGPA(totalMarks, subjectsCount = 5) {
    const avg = totalMarks / subjectsCount;
    if (avg >= 80) return { gpa: '5.00', grade: 'A+' };
    if (avg >= 70) return { gpa: '4.00', grade: 'A' };
    if (avg >= 60) return { gpa: '3.50', grade: 'A-' };
    if (avg >= 50) return { gpa: '3.00', grade: 'B' };
    if (avg >= 40) return { gpa: '2.00', grade: 'C' };
    if (avg >= 33) return { gpa: '1.00', grade: 'D' };
    return { gpa: '0.00', grade: 'F' };
}

function generateMeritList() {
    const className = document.getElementById('meritClass').value;
    const exam = document.getElementById('examName').value || 'অর্ধবার্ষিক পরীক্ষা ২০২৬';
    const students = getStudents().filter(s => s.class === className);
    const allMarks = getMarks();
    const area = document.getElementById('meritResultArea');
    const tbody = document.getElementById('meritTableBody');

    if (!className) {
        alert('শ্রেণি নির্বাচন করুন।');
        return;
    }

    let reportList = students.map(s => {
        const m = allMarks[s.id]?.[exam] || { bangla: 0, english: 0, math: 0, science: 0, social: 0 };
        const total = (Number(m.bangla) || 0) + (Number(m.english) || 0) + (Number(m.math) || 0) + (Number(m.science) || 0) + (Number(m.social) || 0);
        const { gpa, grade } = calculateGPA(total);
        const isFailed = (Number(m.bangla) < 33 || Number(m.english) < 33 || Number(m.math) < 33 || Number(m.science) < 33 || Number(m.social) < 33);

        return {
            ...s,
            totalMarks: total,
            gpa: isFailed ? '0.00' : gpa,
            grade: isFailed ? 'F' : grade,
            status: isFailed ? 'অকৃতকার্য (Fail)' : 'কৃতকার্য (Pass)'
        };
    });

    // Sort by Total Marks Descending
    reportList.sort((a, b) => b.totalMarks - a.totalMarks);

    if (reportList.length === 0) {
        alert('এই শ্রেণিতে কোনো শিক্ষার্থী নেই।');
        area.classList.add('hidden');
        return;
    }

    document.getElementById('meritTitle').innerText = `${exam} - শ্রেণি: ${className} (মেরিটলিস্ট)`;
    area.classList.remove('hidden');

    tbody.innerHTML = reportList.map((s, index) => `
        <tr class="border-b hover:bg-slate-50">
            <td class="p-2.5 border font-bold text-center text-blue-700">#${index + 1}</td>
            <td class="p-2.5 border text-center">${s.roll}</td>
            <td class="p-2.5 border font-medium">${s.name} <span class="text-xs text-slate-400 block">ID: ${s.id}</span></td>
            <td class="p-2.5 border text-center font-bold">${s.totalMarks}</td>
            <td class="p-2.5 border text-center">${s.gpa} (${s.grade})</td>
            <td class="p-2.5 border text-center font-semibold ${s.grade === 'F' ? 'text-red-600' : 'text-emerald-600'}">${s.status}</td>
            <td class="p-2.5 border text-center">
                <button onclick="viewMarksheet('${s.id}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded">মার্কশীট</button>
            </td>
        </tr>
    `).join('');
}

function viewMarksheet(studentId) {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    const exam = document.getElementById('examName').value || 'অর্ধবার্ষিক পরীক্ষা ২০২৬';
    const allMarks = getMarks();
    const m = allMarks[studentId]?.[exam] || { bangla: 0, english: 0, math: 0, science: 0, social: 0 };
    
    const total = (Number(m.bangla) || 0) + (Number(m.english) || 0) + (Number(m.math) || 0) + (Number(m.science) || 0) + (Number(m.social) || 0);
    const { gpa, grade } = calculateGPA(total);

    const modal = document.getElementById('markSheetModal');
    const content = document.getElementById('marksheetContent');

    content.innerHTML = `
        <div class="text-center border-b pb-3 space-y-1">
            <h2 class="text-xl font-bold text-blue-900">আদর্শ বিদ্যাপীঠ ও কলেজ</h2>
            <p class="text-xs text-slate-500">দেবীগঞ্জ, পঞ্চগড়</p>
            <h3 class="font-bold text-md text-slate-800 pt-2">${exam} - একাডেমিক ট্রান্সক্রিপ্ট</h3>
        </div>
        <div class="grid grid-cols-2 text-sm bg-slate-50 p-3 rounded-lg gap-2">
            <div><strong>নাম:</strong> ${student.name}</div>
            <div><strong>আইডি:</strong> ${student.id}</div>
            <div><strong>শ্রেণি:</strong> ${student.class}</div>
            <div><strong>রোল:</strong> ${student.roll}</div>
            <div><strong>পিতা:</strong> ${student.fatherName}</div>
            <div><strong>মোবাইল:</strong> ${student.phone}</div>
        </div>
        <table class="w-full text-left border-collapse border border-slate-300 text-sm">
            <thead>
                <tr class="bg-slate-800 text-white">
                    <th class="p-2 border">বিষয়</th>
                    <th class="p-2 border text-center">পূর্ণমান</th>
                    <th class="p-2 border text-center">প্রাপ্ত নম্বর</th>
                    <th class="p-2 border text-center">গ্রেড</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="p-2 border">বাংলা</td><td class="p-2 border text-center">১০০</td><td class="p-2 border text-center">${m.bangla}</td><td class="p-2 border text-center">${calculateGPA(m.bangla, 1).grade}</td></tr>
                <tr><td class="p-2 border">ইংরেজি</td><td class="p-2 border text-center">১০০</td><td class="p-2 border text-center">${m.english}</td><td class="p-2 border text-center">${calculateGPA(m.english, 1).grade}</td></tr>
                <tr><td class="p-2 border">গণিত</td><td class="p-2 border text-center">১০০</td><td class="p-2 border text-center">${m.math}</td><td class="p-2 border text-center">${calculateGPA(m.math, 1).grade}</td></tr>
                <tr><td class="p-2 border">বিজ্ঞান</td><td class="p-2 border text-center">১০০</td><td class="p-2 border text-center">${m.science}</td><td class="p-2 border text-center">${calculateGPA(m.science, 1).grade}</td></tr>
                <tr><td class="p-2 border">সমাজ ও বিশ্বপরিচয়</td><td class="p-2 border text-center">১০০</td><td class="p-2 border text-center">${m.social}</td><td class="p-2 border text-center">${calculateGPA(m.social, 1).grade}</td></tr>
            </tbody>
        </table>
        <div class="flex justify-between items-center bg-blue-50 p-3 rounded-lg font-bold">
            <div>মোট নম্বর: ${total}</div>
            <div>GPA: ${gpa} (${grade})</div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeMarksheet() {
    document.getElementById('markSheetModal').classList.add('hidden');
}

// ================= ID & ADMIT CARD GENERATOR =================

function generateCards() {
    const type = document.getElementById('cardType').value;
    const className = document.getElementById('cardClass').value;
    const students = getStudents().filter(s => className === '' || s.class === className);
    const area = document.getElementById('cardsDisplayArea');
    const container = document.getElementById('printArea');

    if (students.length === 0) {
        alert('কোনো শিক্ষার্থী পাওয়া যায়নি।');
        area.classList.add('hidden');
        return;
    }

    area.classList.remove('hidden');

    container.innerHTML = students.map(s => {
        if (type === 'idcard') {
            return `
                <div class="bg-white border-2 border-blue-900 rounded-xl p-4 shadow-sm w-full max-w-xs mx-auto text-center space-y-2 relative overflow-hidden">
                    <div class="bg-blue-900 text-white -mx-4 -mt-4 p-2.5">
                        <h4 class="font-bold text-sm">আদর্শ বিদ্যাপীঠ ও কলেজ</h4>
                        <p class="text-[10px] text-blue-200">স্টুডেন্ট আইডি কার্ড (২০২৬)</p>
                    </div>
                    <div class="w-20 h-20 bg-slate-200 rounded-full mx-auto flex items-center justify-center font-bold text-slate-500 text-xl border-2 border-blue-900 mt-2">
                        ${s.name.charAt(0)}
                    </div>
                    <div>
                        <h3 class="font-bold text-md text-slate-800">${s.name}</h3>
                        <p class="text-xs text-slate-500">আইডি: ${s.id}</p>
                    </div>
                    <div class="text-xs grid grid-cols-2 text-left bg-slate-50 p-2 rounded">
                        <div><strong>শ্রেণি:</strong> ${s.class}</div>
                        <div><strong>রোল:</strong> ${s.roll}</div>
                        <div><strong>রক্ত:</strong> ${s.bloodGroup || 'N/A'}</div>
                        <div><strong>মোবাইল:</strong> ${s.phone}</div>
                    </div>
                    <div class="pt-2 border-t text-[10px] text-slate-400 flex justify-between">
                        <span>প্রধান শিক্ষক</span>
                        <span>কর্তৃপক্ষ</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white border-2 border-indigo-800 rounded-xl p-4 shadow-sm w-full max-w-sm mx-auto space-y-3">
                    <div class="text-center border-b pb-2">
                        <h4 class="font-bold text-md text-indigo-900">আদর্শ বিদ্যাপীঠ ও কলেজ</h4>
                        <p class="text-xs font-semibold text-slate-600">বার্ষিক পরীক্ষা - ২০২৬ (এডমিট কার্ড)</p>
                    </div>
                    <div class="text-xs space-y-1 bg-indigo-50 p-2.5 rounded">
                        <p><strong>শিক্ষার্থীর নাম:</strong> ${s.name}</p>
                        <p><strong>আইডি নম্বর:</strong> ${s.id}</p>
                        <p><strong>শ্রেণি:</strong> ${s.class} | <strong>রোল:</strong> ${s.roll}</p>
                        <p><strong>পিতার নাম:</strong> ${s.fatherName}</p>
                    </div>
                    <div class="text-[11px] text-slate-600">
                        <p class="font-bold mb-1">পরীক্ষার্থীদের নির্দেশাবলী:</p>
                        <p>১. পরীক্ষাকেন্দ্রে অবশ্যই আইডি কার্ড সাথে আনতে হবে।</p>
                        <p>২. পরীক্ষা শুরুর ৩০ মিনিট পূর্বে আসনে বসতে হবে।</p>
                    </div>
                    <div class="pt-4 border-t flex justify-between text-[10px] text-slate-500">
                        <span>পরীক্ষ নিয়ন্ত্রক</span>
                        <span>প্রধান শিক্ষক</span>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Initial Call
updateDashboardStats();
renderStudentTable();
