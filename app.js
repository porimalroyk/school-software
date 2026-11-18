// Initialize Lucide Icons
lucide.createIcons();

// Mobile Menu Toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
});

// Database Key (LocalStorage - Ready to sync with Firebase later)
const DB_KEY = 'edumanage_students_v1';

// Load Students from Storage
function getStudents() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
}

// Save Students to Storage
function saveStudents(students) {
    localStorage.setItem(DB_KEY, JSON.stringify(students));
    updateDashboardStats();
    renderStudentTable();
}

// Tab Switching Logic
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

    // Auto close mobile sidebar on selection
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('hidden');
    }
}

// Add Single Student Form Submission
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const students = getStudents();
    const newId = document.getElementById('studentId').value.trim();

    // Prevent Duplicate ID
    if (students.some(s => s.id === newId)) {
        alert('এই আইডি নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে! অনুগ্রহ করে নতুন আইডি দিন।');
        return;
    }

    const studentObj = {
        id: newId,
        name: document.getElementById('studentName').value.trim(),
        class: document.getElementById('studentClass').value,
        roll: document.getElementById('studentRoll').value,
        gender: document.getElementById('studentGender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        fatherName: document.getElementById('fatherName').value.trim(),
        motherName: document.getElementById('motherName').value.trim(),
        phone: document.getElementById('guardianPhone').value.trim(),
        address: document.getElementById('address').value.trim(),
        createdAt: new Date().toISOString()
    };

    students.push(studentObj);
    saveStudents(students);
    this.reset();
    alert('শিক্ষার্থীর প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!');
    switchTab('student-list');
});

// Render Student Table with Search & Class Filter
function renderStudentTable() {
    const students = getStudents();
    const search = document.getElementById('searchInput').value.toLowerCase();
    const classFilter = document.getElementById('filterClass').value;
    const tbody = document.getElementById('studentTableBody');

    const filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search) || 
                              s.id.toLowerCase().includes(search) || 
                              s.phone.includes(search);
        const matchesClass = classFilter === '' || s.class === classFilter;
        return matchesSearch && matchesClass;
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
                <button onclick="deleteStudent('${s.id}')" class="text-red-600 hover:bg-red-50 p-1.5 rounded" title="ডিলিট করুন">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

// Delete Student
function deleteStudent(id) {
    if (confirm('আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীর তথ্য মুছে ফেলতে চান?')) {
        const students = getStudents().filter(s => s.id !== id);
        saveStudents(students);
    }
}

// Update Dashboard Statistics
function updateDashboardStats() {
    const students = getStudents();
    document.getElementById('stat-total').innerText = students.length;
    document.getElementById('stat-male').innerText = students.filter(s => s.gender === 'ছাত্র').length;
    document.getElementById('stat-female').innerText = students.filter(s => s.gender === 'ছাত্রী').length;
    
    const uniqueClasses = new Set(students.map(s => s.class));
    document.getElementById('stat-classes').innerText = uniqueClasses.size;
}

// Download Sample Excel Template
function downloadSampleExcel() {
    const sampleData = [
        {
            ID: "2026001",
            Name: "তানভীর আহমেদ",
            Class: "ষষ্ঠ",
            Roll: 1,
            Gender: "ছাত্র",
            BloodGroup: "O+",
            FatherName: "মোঃ আব্দুল করিম",
            MotherName: "রহিমা বেগম",
            Phone: "01711000000",
            Address: "দেবীগঞ্জ, পঞ্চগড়"
        },
        {
            ID: "2026002",
            Name: "সুমাইয়া আক্তার",
            Class: "ষষ্ঠ",
            Roll: 2,
            Gender: "ছাত্রী",
            BloodGroup: "A+",
            FatherName: "মোঃ রফিকুল ইসলাম",
            MotherName: "সালমা খাতুন",
            Phone: "01811000000",
            Address: "কালীগঞ্জ বাজার"
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Student_Import_Sample.xlsx");
}

// Handle Bulk Excel Upload
function handleExcelUpload() {
    const fileInput = document.getElementById('excelFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('অনুগ্রহ করে প্রথমে একটি Excel (.xlsx বা .csv) ফাইল নির্বাচন করুন।');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        if (rows.length === 0) {
            alert('এক্সেল ফাইলটি খালি!');
            return;
        }

        const existingStudents = getStudents();
        let addedCount = 0;

        rows.forEach(row => {
            const id = String(row.ID || '').trim();
            if (id && !existingStudents.some(s => s.id === id)) {
                existingStudents.push({
                    id: id,
                    name: String(row.Name || ''),
                    class: String(row.Class || ''),
                    roll: row.Roll || '',
                    gender: String(row.Gender || 'ছাত্র'),
                    bloodGroup: String(row.BloodGroup || ''),
                    fatherName: String(row.FatherName || ''),
                    motherName: String(row.MotherName || ''),
                    phone: String(row.Phone || ''),
                    address: String(row.Address || ''),
                    createdAt: new Date().toISOString()
                });
                addedCount++;
            }
        });

        saveStudents(existingStudents);
        fileInput.value = '';
        alert(`সফলভাবে ${addedCount} জন নতুন শিক্ষার্থীর তথ্য ইম্পোর্ট করা হয়েছে!`);
        switchTab('student-list');
    };
    reader.readAsArrayBuffer(file);
}

// Export All Data to Excel
function exportToExcel() {
    const students = getStudents();
    if (students.length === 0) {
        alert('ডাউনলোড করার মতো কোনো ডাটা নেই।');
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_Students");
    XLSX.writeFile(workbook, "School_Students_Backup.xlsx");
}

// Initial Load
updateDashboardStats();
renderStudentTable();
