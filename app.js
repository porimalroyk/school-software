// Initialize Lucide Icons
lucide.createIcons();

// Mobile Menu Toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
});

const DB_KEY = 'edumanage_students_v1';
const MARKS_KEY = 'edumanage_marks_v1';
const ATTENDANCE_KEY = 'edumanage_attendance_v1';

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

function getAttendance() {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveAttendanceData(att) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(att));
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
        alert('এই আইডি নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে!');
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
    alert('শিক্ষার্থীর প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!');
    switchTab('student-list');
});

// Render Student Table
function renderStudentTable() {
    const students = getStudents();
    const searchInput = document.getElementById('searchInput');
    const classFilter = document.getElementById('filterClass');
    const tbody = document.getElementById('studentTableBody');

    if (!tbody) return;

    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const classVal = classFilter ? classFilter.value : '';

    const filtered = students.filter(s => {
        return (s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search) || s.phone.includes(search)) && 
               (classVal === '' || s.class === classVal);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(s => `
        <tr class="hover:bg-slate-50">
            <td class="p-3 font-semibold text-blue-700">${s.id}</td>
            <td class="p-3 font-medium">${s.name} <span class="text-xs text-slate-400 block">${s.gender}</span></td>
            <td class="p-3">${s.class} (রোল: ${s.roll})</td>
            <td class="p-3">${s.fatherName}</td>
            <td class="p-3">${s.phone}</td>
            <td class="p-3 text-center">
                <button onclick="deleteStudent('${s.id}')" class="text-red-600 hover:bg-red-50 p-1.5 rounded"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
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
    const statTotal = document.getElementById('stat-total');
    const statFemale = document.getElementById('stat-female');
    const statClasses = document.getElementById('stat-classes');

    if (statTotal) statTotal.innerText = students.length;
    if (statFemale) statFemale.innerText = students.filter(s => s.gender === 'ছাত্রী').length;
    if (statClasses) statClasses.innerText = new Set(students.map(s => s.class)).size;

    const today = new Date().toISOString().split('T')[0];
    const att = getAttendance();
    let presentCount = 0;
    if (att[today]) {
        presentCount = Object.values(att[today]).filter(status => status === 'Present').length;
    }
    const statPresent = document.getElementById('stat-present');
    if (statPresent) statPresent.innerText = presentCount;
}

// ================= EXCEL DOWNLOAD & ROBUST IMPORT =================

function downloadSampleExcel() {
    const sampleData = [
        { ID: "2026001", Name: "তানভীর আহমেদ", Class: "প্রথম", Roll: 1, Gender: "ছাত্র", BloodGroup: "O+", FatherName: "মোঃ আব্দুল করিম", MotherName: "রহিমা বেগম", Phone: "01711000000", Address: "দেবীগঞ্জ, পঞ্চগড়" },
        { ID: "2026002", Name: "সুমাইয়া আক্তার", Class: "প্রথম", Roll: 2, Gender: "ছাত্রী", BloodGroup: "A+", FatherName: "মোঃ রফিকুল ইসলাম", MotherName: "সালমা খাতুন", Phone: "01811000000", Address: "কালীগঞ্জ বাজার" }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Student_Import_Sample.xlsx");
}

function handleExcelUpload() {
    const fileInput = document.getElementById('excelFileInput');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('অনুগ্রহ করে প্রথমে একটি Excel ফাইল সিলেক্ট করুন।');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);

            if (!rows || rows.length === 0) {
                alert('এক্সেল ফাইলটি খালি বা সঠিক ফরম্যাটে নেই!');
                return;
            }

            const existingStudents = getStudents();
            let addedCount = 0;

            rows.forEach(row => {
                // নমনীয় ফিল্ড ম্যাপিং যাতে বড়/ছোট হাতের বা ভিন্ন নামের কলাম হলেও ডাটা ধরে নেয়
                const id = String(row.ID || row.id || row.Id || row.student_id || '').trim();
                const name = String(row.Name || row.name || row.StudentName || '').trim();
                const className = String(row.Class || row.class || '').trim();
                const roll = row.Roll || row.roll || '';

                if (id && name && className && !existingStudents.some(s => s.id === id)) {
                    existingStudents.push({
                        id: id,
                        name: name,
                        class: className,
                        roll: roll,
                        gender: String(row.Gender || row.gender || 'ছাত্র').trim(),
                        bloodGroup: String(row.BloodGroup || row.bloodGroup || '').trim(),
                        fatherName: String(row.FatherName || row.fatherName || '').trim(),
                        motherName: String(row.MotherName || row.motherName || '').trim(),
                        phone: String(row.Phone || row.phone || '').trim(),
                        address: String(row.Address || row.address || '').trim()
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                saveStudents(existingStudents);
                fileInput.value = '';
                alert(`সফলভাবে ${addedCount} জন নতুন শিক্ষার্থীর তথ্য ইম্পোর্ট করা হয়েছে!`);
                switchTab('student-list');
            } else {
                alert('নতুন কোনো ডাটা পাওয়া যায়নি অথবা এই আইডিগুলোর তথ্য ইতিমধ্যে ডেটাবেসে রয়েছে।');
            }
        } catch (error) {
            console.error(error);
            alert('ফাইল প্রসেসিং করতে সমস্যা হয়েছে। দয়া করে সঠিক এক্সেল (.xlsx) ফাইল আপলোড করুন।');
        }
    };

    reader.onerror = function() {
        alert('ফাইল পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    };

    reader.readAsArrayBuffer(file);
}

// ================= EXAM & MARKS =================

function loadStudentsForMarks() {
    const className = document.getElementById('marksClass').value;
    const exam = document.getElementById('examName').value;
    const container = document.getElementById('marksEntryContainer');
    const tbody = document.getElementById('marksTableBody');

    if (!className) { alert('শ্রেণি নির্বাচন করুন।'); container.classList.add('hidden'); return; }

    const students = getStudents().filter(s => s.class === className).sort((a, b) => Number(a.roll) - Number(b.roll));
    const allMarks = getMarks();

    if (students.length === 0) { alert('এই শ্রেণিতে শিক্ষার্থী নেই।'); container.classList.add('hidden'); return; }

    document.getElementById('marksTableTitle').innerText = `${exam} - শ্রেণি: ${className}`;
    container.classList.remove('hidden');

    tbody.innerHTML = students.map(s => {
        const m = allMarks[s.id]?.[exam] || { bangla: '', english: '', math: '', science: '', social: '' };
        return `
            <tr>
                <td class="p-3 font-bold">${s.roll}</td>
                <td class="p-3">${s.name} <span class="text-xs text-slate-400 block">ID: ${s.id}</span></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="bangla" value="${m.bangla}" class="mark-input w-20 border rounded p-1 text-center"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="english" value="${m.english}" class="mark-input w-20 border rounded p-1 text-center"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="math" value="${m.math}" class="mark-input w-20 border rounded p-1 text-center"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="science" value="${m.science}" class="mark-input w-20 border rounded p-1 text-center"></td>
                <td class="p-3"><input type="number" data-id="${s.id}" data-sub="social" value="${m.social}" class="mark-input w-20 border rounded p-1 text-center"></td>
            </tr>
        `;
    }).join('');
}

function saveAllMarks() {
    const exam = document.getElementById('examName').value;
    const allMarks = getMarks();
    document.querySelectorAll('.mark-input').forEach(input => {
        const id = input.getAttribute('data-id');
        const sub = input.getAttribute('data-sub');
        const val = input.value === '' ? '' : Number(input.value);
        if (!allMarks[id]) allMarks[id] = {};
        if (!allMarks[id][exam]) allMarks[id][exam] = {};
        allMarks[id][exam][sub] = val;
    });
    saveMarks(allMarks);
    alert('নম্বর সফলভাবে সংরক্ষিত হয়েছে!');
}

function calculateGPA(totalMarks) {
    const avg = totalMarks / 5;
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
    const exam = document.getElementById('examName').value;
    const students = getStudents().filter(s => s.class === className);
    const allMarks = getMarks();
    const area = document.getElementById('meritResultArea');
    const tbody = document.getElementById('meritTableBody');

    if (!className) { alert('শ্রেণি নির্বাচন করুন।'); return; }

    let reportList = students.map(s => {
        const m = allMarks[s.id]?.[exam] || { bangla: 0, english: 0, math: 0, science: 0, social: 0 };
        const total = (Number(m.bangla)||0) + (Number(m.english)||0) + (Number(m.math)||0) + (Number(m.science)||0) + (Number(m.social)||0);
        const { gpa, grade } = calculateGPA(total);
        const isFailed = (Number(m.bangla)<33 || Number(m.english)<33 || Number(m.math)<33 || Number(m.science)<33 || Number(m.social)<33);
        return { ...s, totalMarks: total, gpa: isFailed ? '0.00' : gpa, grade: isFailed ? 'F' : grade, status: isFailed ? 'Fail' : 'Pass' };
    });

    reportList.sort((a, b) => b.totalMarks - a.totalMarks);
    area.classList.remove('hidden');
    document.getElementById('meritTitle').innerText = `${exam} - ${className}`;

    tbody.innerHTML = reportList.map((s, idx) => `
        <tr class="border-b">
            <td class="p-2.5 border font-bold text-center">#${idx + 1}</td>
            <td class="p-2.5 border text-center">${s.roll}</td>
            <td class="p-2.5 border">${s.name} <span class="text-xs text-slate-400">ID: ${s.id}</span></td>
            <td class="p-2.5 border text-center font-bold">${s.totalMarks}</td>
            <td class="p-2.5 border text-center">${s.gpa} (${s.grade})</td>
            <td class="p-2.5 border text-center ${s.grade === 'F' ? 'text-red-600' : 'text-emerald-600'}">${s.status}</td>
            <td class="p-2.5 border text-center"><button onclick="viewMarksheet('${s.id}')" class="bg-blue-600 text-white text-xs px-2 py-1 rounded">মার্কশীট</button></td>
        </tr>
    `).join('');
}

function viewMarksheet(id) {
    const student = getStudents().find(s => s.id === id);
    const exam = document.getElementById('examName').value;
    const m = getMarks()[id]?.[exam] || { bangla: 0, english: 0, math: 0, science: 0, social: 0 };
    const total = (Number(m.bangla)||0) + (Number(m.english)||0) + (Number(m.math)||0) + (Number(m.science)||0) + (Number(m.social)||0);
    const { gpa, grade } = calculateGPA(total);

    document.getElementById('markSheetModal').classList.remove('hidden');
    document.getElementById('marksheetContent').innerHTML = `
        <div class="text-center border-b pb-3"><h2 class="text-xl font-bold">আদর্শ বিদ্যাপীঠ ও কলেজ</h2><p class="text-xs">${exam}</p></div>
        <div class="grid grid-cols-2 text-sm bg-slate-50 p-3 rounded"><div><strong>নাম:</strong> ${student.name}</div><div><strong>আইডি:</strong> ${student.id}</div><div><strong>শ্রেণি:</strong> ${student.class}</div><div><strong>রোল:</strong> ${student.roll}</div></div>
        <table class="w-full text-left border border-slate-300 text-sm mt-2">
            <tr class="bg-slate-800 text-white"><th class="p-2">বিষয়</th><th class="p-2 text-center">নম্বর</th></tr>
            <tr><td class="p-2 border">বাংলা</td><td class="p-2 border text-center">${m.bangla}</td></tr>
            <tr><td class="p-2 border">ইংরেজি</td><td class="p-2 border text-center">${m.english}</td></tr>
            <tr><td class="p-2 border">গণিত</td><td class="p-2 border text-center">${m.math}</td></tr>
            <tr><td class="p-2 border">বিজ্ঞান</td><td class="p-2 border text-center">${m.science}</td></tr>
            <tr><td class="p-2 border">সমাজ</td><td class="p-2 border text-center">${m.social}</td></tr>
        </table>
        <div class="flex justify-between font-bold bg-blue-50 p-3 rounded"><div>মোট: ${total}</div><div>GPA: ${gpa} (${grade})</div></div>
    `;
}

function closeMarksheet() { document.getElementById('markSheetModal').classList.add('hidden'); }

// ================= ROBUST CARD GENERATOR =================

function generateCards() {
    const type = document.getElementById('cardType').value;
    const className = document.getElementById('cardClass').value.trim();
    
    // নিখুঁত ম্যাচিং এর জন্য ট্রিম ও কন্ডিশন
    const students = getStudents().filter(s => {
        if (!className) return true; // যদি সকল শ্রেণি সিলেক্ট থাকে
        return s.class && s.class.trim() === className;
    });

    const area = document.getElementById('cardsDisplayArea');
    const container = document.getElementById('printArea');

    if (students.length === 0) {
        alert('নির্বাচিত শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি! দয়া করে নিশ্চিত করুন ওই শ্রেণিতে শিক্ষার্থী এন্ট্রি করা আছে কি না।');
        area.classList.add('hidden');
        return;
    }

    area.classList.remove('hidden');

    container.innerHTML = students.map(s => {
        if (type === 'idcard') {
            return `
                <div class="bg-white border-2 border-blue-900 rounded-xl p-4 shadow-sm max-w-xs mx-auto text-center space-y-2">
                    <div class="bg-blue-900 text-white -mx-4 -mt-4 p-2.5"><h4 class="font-bold text-sm">আদর্শ বিদ্যাপীঠ ও কলেজ</h4><p class="text-[10px]">স্টুডেন্ট আইডি কার্ড (২০২৬)</p></div>
                    <div class="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center font-bold text-xl text-slate-500 mt-2">${s.name.charAt(0)}</div>
                    <div><h3 class="font-bold text-slate-800">${s.name}</h3><p class="text-xs text-slate-500">ID: ${s.id}</p></div>
                    <div class="text-xs grid grid-cols-2 text-left bg-slate-50 p-2 rounded"><div>শ্রেণি: ${s.class}</div><div>রোল: ${s.roll}</div><div>রক্ত: ${s.bloodGroup||'N/A'}</div><div>মোবাইল: ${s.phone}</div></div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white border-2 border-indigo-800 rounded-xl p-4 shadow-sm max-w-sm mx-auto space-y-2">
                    <div class="text-center border-b pb-2"><h4 class="font-bold text-indigo-900">আদর্শ বিদ্যাপীঠ ও কলেজ</h4><p class="text-xs">বার্ষিক পরীক্ষা - এডমিট কার্ড</p></div>
                    <div class="text-xs space-y-1 bg-indigo-50 p-2 rounded"><p><strong>নাম:</strong> ${s.name}</p><p><strong>আইডি:</strong> ${s.id}</p><p><strong>শ্রেণি:</strong> ${s.class} | <strong>রোল:</strong> ${s.roll}</p><p><strong>পিতা:</strong> ${s.fatherName}</p></div>
                </div>
            `;
        }
    }).join('');
}

// ================= ATTENDANCE MANAGEMENT =================

document.getElementById('attendanceDate').valueAsDate = new Date();

function loadAttendanceSheet() {
    const className = document.getElementById('attendanceClass').value;
    const date = document.getElementById('attendanceDate').value;
    const container = document.getElementById('attendanceContainer');
    const tbody = document.getElementById('attendanceTableBody');

    if (!className || !date) { alert('তারিখ এবং শ্রেণি নির্বাচন করুন।'); container.classList.add('hidden'); return; }

    const students = getStudents().filter(s => s.class === className).sort((a,b) => Number(a.roll)-Number(b.roll));
    const att = getAttendance();
    const dayAtt = att[date] || {};

    if (students.length === 0) { alert('এই শ্রেণিতে কোনো শিক্ষার্থী নেই।'); container.classList.add('hidden'); return; }

    document.getElementById('attendanceTitle').innerText = `হাজিরা শিট - শ্রেণি: ${className} (${date})`;
    container.classList.remove('hidden');

    tbody.innerHTML = students.map(s => {
        const status = dayAtt[s.id] || 'Present';
        return `
            <tr>
                <td class="p-3 font-bold">${s.roll}</td>
                <td class="p-3">${s.name} <span class="text-xs text-slate-400">ID: ${s.id}</span></td>
                <td class="p-3 text-center">
                    <select data-id="${s.id}" class="att-status border rounded px-3 py-1 text-sm font-semibold ${status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}">
                        <option value="Present" ${status === 'Present' ? 'selected' : ''}>উপস্থিত</option>
                        <option value="Absent" ${status === 'Absent' ? 'selected' : ''}>অনুপস্থিত</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function markAllAttendance(isPresent) {
    document.querySelectorAll('.att-status').forEach(select => {
        select.value = isPresent ? 'Present' : 'Absent';
        select.className = `att-status border rounded px-3 py-1 text-sm font-semibold ${isPresent ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`;
    });
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const att = getAttendance();
    if (!att[date]) att[date] = {};

    document.querySelectorAll('.att-status').forEach(select => {
        const id = select.getAttribute('data-id');
        att[date][id] = select.value;
    });

    saveAttendanceData(att);
    updateDashboardStats();
    alert('আজকের উপস্থিতি সফলভাবে সংরক্ষিত হয়েছে!');
}

// ================= GUARDIAN PORTAL =================

function guardianLogin() {
    const id = document.getElementById('gLoginId').value.trim();
    const phone = document.getElementById('gLoginPhone').value.trim();
    const students = getStudents();

    const student = students.find(s => s.id === id && s.phone === phone);
    if (!student) {
        alert('সঠিক শিক্ষার্থী আইডি অথবা অভিভাবকের মোবাইল নম্বর দিন!');
        return;
    }

    document.getElementById('gLoginId').value = '';
    document.getElementById('gLoginPhone').value = '';
    document.querySelector('#tab-guardian-login .max-w-md').classList.add('hidden');
    const dashboard = document.getElementById('guardianDashboard');
    dashboard.classList.remove('hidden');

    document.getElementById('gStudentName').innerText = `${student.name} (${student.class})`;
    document.getElementById('gStudentDetails').innerText = `আইডি: ${student.id} | রোল: ${student.roll} | পিতা: ${student.fatherName}`;

    const att = getAttendance();
    let presentDays = 0;
    Object.values(att).forEach(dayObj => {
        if (dayObj[id] === 'Present') presentDays++;
    });
    document.getElementById('gTotalPresent').innerText = `${presentDays} দিন`;

    const allMarks = getMarks()[id];
    if (allMarks) {
        const exams = Object.keys(allMarks);
        if (exams.length > 0) {
            const latestExam = exams[exams.length - 1];
            const m = allMarks[latestExam];
            const total = (Number(m.bangla)||0) + (Number(m.english)||0) + (Number(m.math)||0) + (Number(m.science)||0) + (Number(m.social)||0);
            document.getElementById('gLatestGPA').innerText = calculateGPA(total).gpa;
        }
    }
}

function logoutGuardian() {
    document.getElementById('guardianDashboard').classList.add('hidden');
    document.querySelector('#tab-guardian-login .max-w-md').classList.remove('hidden');
}

// Initial Load
updateDashboardStats();
renderStudentTable();
