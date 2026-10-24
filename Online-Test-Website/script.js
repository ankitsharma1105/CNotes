"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Controller
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    function toggleMobileNav() {
        if (!navLinks || !mobileToggle) return;
        const isOpen = navLinks.classList.toggle('show');
        mobileToggle.classList.toggle('active', isOpen);
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
        if (!isOpen) {
            document.querySelectorAll('.dropdown.mobile-open').forEach(d => d.classList.remove('mobile-open'));
        }
    }

    function closeMobileNav() {
        if (!navLinks || !mobileToggle) return;
        navLinks.classList.remove('show');
        mobileToggle.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.className = 'fa-solid fa-bars';
        }
        document.querySelectorAll('.dropdown.mobile-open').forEach(d => d.classList.remove('mobile-open'));
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    // Dismiss mobile nav when clicking outside
    document.addEventListener('click', (event) => {
        if (navLinks && navLinks.classList.contains('show')) {
            if (!navLinks.contains(event.target) && !mobileToggle.contains(event.target)) {
                closeMobileNav();
            }
        }
    });

    // Dismiss mobile nav on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileNav();
        }
    });

    // Reset mobile nav on screen resize if window is widened
    window.addEventListener('resize', () => {
        if (window.innerWidth > 868 && navLinks && navLinks.classList.contains('show')) {
            closeMobileNav();
        }
    });

    // Make closeMobileNav accessible to navigateTo
    window.closeMobileNav = closeMobileNav;

    // Navigation Logic (SPA Routing) using Event Delegation
    document.addEventListener('click', (event) => {
        // Find if the clicked element or any of its parents has the data-navigate attribute
        const navigateElement = event.target.closest('[data-navigate]');

        if (navigateElement) {
            // Prevent default browser behavior if it's an anchor tag to stop jumping
            if (navigateElement.tagName.toLowerCase() === 'a') {
                event.preventDefault();
            }

            // On mobile screens (<=868px), tapping dropdown toggle link opens accordion instead of jumping
            if (window.innerWidth <= 868 && navigateElement.classList.contains('dropdown-toggle-link')) {
                const parentDropdown = navigateElement.closest('.dropdown');
                if (parentDropdown) {
                    const isAlreadyOpen = parentDropdown.classList.contains('mobile-open');
                    document.querySelectorAll('.dropdown.mobile-open').forEach(d => {
                        if (d !== parentDropdown) d.classList.remove('mobile-open');
                    });
                    parentDropdown.classList.toggle('mobile-open', !isAlreadyOpen);
                    return;
                }
            }

            const sectionId = navigateElement.getAttribute('data-navigate');
            navigateTo(sectionId);
        }
    });

    // Feedback Form Submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedback);
    }

    // Initialize Star Rating Widget
    initStarRating();

    // Initialize Course Notes (Search, Filter, and Preview Modal)
    initNotesFeatures();

    // Initialize Course Channels Modal (See Notes button)
    initCourseChannelsModal();
});

function navigateTo(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active state in navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Find the relevant nav item based on data-target
    let targetNav = sectionId;
    if (sectionId.startsWith('content-')) {
        targetNav = 'content';
    } else if (sectionId.startsWith('test-') || sectionId.startsWith('exam-')) {
        targetNav = 'tests';
    }

    const activeNavItem = document.querySelector(`.nav-item[data-target="${targetNav}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Special trigger for Basic IT - 1 Examination
    if (sectionId === 'exam-bit-1') {
        initBit1Exam();
    }

    // Close mobile menu if open
    if (typeof window.closeMobileNav === 'function') {
        window.closeMobileNav();
    } else {
        const navLinks = document.getElementById('nav-links');
        if (navLinks && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    }

    // Scroll smoothly to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initStarRating() {
    const starWidget = document.getElementById('starRatingWidget');
    if (!starWidget) return;

    const stars = starWidget.querySelectorAll('i');
    const ratingInput = document.getElementById('ratingValue');
    const display = document.getElementById('ratingScoreDisplay');

    const scoreLabels = {
        1: "1.0 / 5.0 (Needs Improvement)",
        2: "2.0 / 5.0 (Fair)",
        3: "3.0 / 5.0 (Good)",
        4: "4.0 / 5.0 (Very Good)",
        5: "5.0 / 5.0 (Excellent)"
    };

    function setRating(val) {
        if (ratingInput) ratingInput.value = val;
        stars.forEach(s => {
            const r = parseInt(s.getAttribute('data-rating'), 10);
            if (r <= val) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        if (display && scoreLabels[val]) {
            display.textContent = scoreLabels[val];
        }
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-rating'), 10);
            setRating(val);
        });

        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.getAttribute('data-rating'), 10);
            stars.forEach(s => {
                const r = parseInt(s.getAttribute('data-rating'), 10);
                if (r <= val) {
                    s.classList.add('hovered');
                } else {
                    s.classList.remove('hovered');
                }
            });
        });
    });

    starWidget.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hovered'));
    });
}

function submitFeedback(event) {
    event.preventDefault();

    const form = event.target;
    const successMessage = document.getElementById('success-message');
    const nameInput = document.getElementById('name');
    const courseSelect = document.getElementById('reviewCourse');
    const messageInput = document.getElementById('message');
    const ratingInput = document.getElementById('ratingValue');
    const reviewsList = document.getElementById('reviewsList');

    const nameVal = nameInput ? nameInput.value.trim() : 'Anonymous';
    const courseVal = courseSelect ? courseSelect.value : 'General';
    const messageVal = messageInput ? messageInput.value.trim() : '';
    const ratingVal = ratingInput ? parseInt(ratingInput.value, 10) : 5;

    // Animate button to show loading state
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Review...';
    btn.disabled = true;

    // Simulate API call for form submission
    setTimeout(() => {
        // Create new review card and prepend to list
        if (reviewsList) {
            const initials = nameVal.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= ratingVal) {
                    starsHtml += '<i class="fa-solid fa-star"></i>';
                } else {
                    starsHtml += '<i class="fa-regular fa-star"></i>';
                }
            }

            const newCard = document.createElement('div');
            newCard.className = 'review-item-card';
            newCard.style.animation = 'fadeIn 0.5s ease';
            newCard.innerHTML = `
                <div class="review-item-header">
                    <div class="review-author-info">
                        <div class="review-avatar" style="background: linear-gradient(135deg, #10b981, #059669);">${initials}</div>
                        <div>
                            <div class="review-author-name">${escapeHtml(nameVal)} <span class="badge" style="font-size: 0.72rem; padding: 0.15rem 0.5rem; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; border-radius: 12px; margin-left: 0.3rem;">Just Now</span></div>
                            <div class="review-course-tag"><i class="fa-solid fa-graduation-cap text-accent"></i> ${escapeHtml(courseVal)}</div>
                        </div>
                    </div>
                    <div class="review-item-stars">
                        ${starsHtml}
                    </div>
                </div>
                <p class="review-item-text">
                    "${escapeHtml(messageVal)}"
                </p>
            `;

            reviewsList.prepend(newCard);
        }

        form.reset();
        const starWidget = document.getElementById('starRatingWidget');
        if (starWidget) {
            const stars = starWidget.querySelectorAll('i');
            stars.forEach(s => s.classList.add('active'));
            const ratingHidden = document.getElementById('ratingValue');
            if (ratingHidden) ratingHidden.value = 5;
            const display = document.getElementById('ratingScoreDisplay');
            if (display) display.textContent = "5.0 / 5.0 (Excellent)";
        }

        btn.innerHTML = originalText;
        btn.disabled = false;

        if (successMessage) {
            successMessage.style.display = 'flex';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 6000);
        }
    }, 1000);
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================
   BASIC IT - 1 EXAMINATION LOGIC & ENGINE
   ========================================================== */

const bit1Questions = [
    {
        id: 1,
        category: "Computer Fundamentals",
        question: "What is the full form of CPU?",
        options: [
            "Central Processing Unit",
            "Central Program Unit",
            "Control Processing User",
            "Computer Processing Unit"
        ],
        correct: 0,
        explanation: "CPU stands for Central Processing Unit. It is often referred to as the 'brain' of the computer, executing instructions and managing system operations."
    },
    {
        id: 2,
        category: "Hardware & Memory",
        question: "Which of the following is considered volatile memory in a computer?",
        options: [
            "ROM (Read Only Memory)",
            "RAM (Random Access Memory)",
            "Hard Disk Drive (HDD)",
            "Optical Disc (DVD)"
        ],
        correct: 1,
        explanation: "RAM (Random Access Memory) is volatile memory, meaning its contents are immediately erased when power is lost or switched off."
    },
    {
        id: 3,
        category: "Input / Output Devices",
        question: "Which of the following devices is strictly an Input device?",
        options: [
            "Computer Monitor",
            "Laser Printer",
            "Barcode Scanner",
            "Audio Speaker"
        ],
        correct: 2,
        explanation: "A barcode scanner captures printed barcode symbols and feeds that input data directly into the computer."
    },
    {
        id: 4,
        category: "Operating Systems",
        question: "Which system software acts as the primary intermediary between computer hardware and user applications?",
        options: [
            "Operating System",
            "Web Browser",
            "Spreadsheet Software",
            "Device Firmware"
        ],
        correct: 0,
        explanation: "The Operating System (such as Windows, Linux, or macOS) manages system resources, file systems, and runs user applications."
    },
    {
        id: 5,
        category: "Data & Storage Units",
        question: "1 Gigabyte (1 GB) is precisely equivalent to how many Megabytes (MB)?",
        options: [
            "100 MB",
            "1,000 MB",
            "1,024 MB",
            "2,048 MB"
        ],
        correct: 2,
        explanation: "In binary computing standard, 1 GB = 1,024 MB (and 1 MB = 1,024 KB)."
    },
    {
        id: 6,
        category: "Keyboard Shortcuts",
        question: "Which keyboard shortcut undoes the most recent action in most software applications?",
        options: [
            "Ctrl + Y",
            "Ctrl + Z",
            "Ctrl + X",
            "Ctrl + U"
        ],
        correct: 1,
        explanation: "Ctrl + Z is the universal shortcut to Undo an operation, whereas Ctrl + Y is commonly used for Redo."
    },
    {
        id: 7,
        category: "Internet & Protocols",
        question: "What does 'HTTPS' stand for in a website URL address?",
        options: [
            "HyperText Transfer Protocol Secure",
            "High Transfer Text Program Standard",
            "Hyperlink Text Transmission Security",
            "Host Terminal Transfer Protocol Secure"
        ],
        correct: 0,
        explanation: "HTTPS stands for HyperText Transfer Protocol Secure, which encrypts website communication using TLS/SSL."
    },
    {
        id: 8,
        category: "Computer Networks",
        question: "A network connecting computers within a limited geographical area like a single office or school is called a:",
        options: [
            "WAN (Wide Area Network)",
            "LAN (Local Area Network)",
            "MAN (Metropolitan Area Network)",
            "PAN (Personal Area Network)"
        ],
        correct: 1,
        explanation: "A LAN (Local Area Network) spans a small, localized physical area such as an office room, laboratory, or campus building."
    },
    {
        id: 9,
        category: "MS Office Suite",
        question: "Which application program in Microsoft Office is primarily built for creating presentations and slide decks?",
        options: [
            "MS Word",
            "MS PowerPoint",
            "MS Excel",
            "MS Outlook"
        ],
        correct: 1,
        explanation: "MS PowerPoint is Microsoft's presentation software used to create dynamic slideshows with animations, text, and graphics."
    },
    {
        id: 10,
        category: "Computer Fundamentals",
        question: "What is the smallest basic unit of digital data in computer storage?",
        options: [
            "Byte",
            "Bit",
            "Kilobyte",
            "Word"
        ],
        correct: 1,
        explanation: "A 'Bit' (short for Binary Digit) can represent only two binary values: 0 or 1, making it the fundamental unit of digital computing."
    },
    {
        id: 11,
        category: "Web Browsing",
        question: "Which function key is widely used across web browsers to refresh or reload the active page?",
        options: [
            "F1",
            "F2",
            "F5",
            "F11"
        ],
        correct: 2,
        explanation: "Pressing F5 reloads the current web page in all major browsers (Chrome, Edge, Firefox, Safari)."
    },
    {
        id: 12,
        category: "Cybersecurity",
        question: "A security program explicitly engineered to detect, quarantine, and eliminate computer malware is called:",
        options: [
            "Antivirus",
            "Spyware",
            "Ransomware",
            "Shareware"
        ],
        correct: 0,
        explanation: "Antivirus software actively scans files and system activity to identify and neutralize malicious threats."
    },
    {
        id: 13,
        category: "CPU Architecture",
        question: "Which component inside the CPU handles arithmetic computations (addition, subtraction) and logical evaluations?",
        options: [
            "ALU (Arithmetic Logic Unit)",
            "Control Unit (CU)",
            "Cache Memory",
            "Internal Registers"
        ],
        correct: 0,
        explanation: "The Arithmetic Logic Unit (ALU) performs all basic arithmetic and Boolean logical operations (AND, OR, NOT) within the processor."
    },
    {
        id: 14,
        category: "User Interfaces",
        question: "What does 'GUI' stand for in modern computing environments?",
        options: [
            "General User Interface",
            "Graphical User Interface",
            "Global Unified Interaction",
            "Guided User Instruction"
        ],
        correct: 1,
        explanation: "GUI stands for Graphical User Interface, which allows users to interact visually using windows, icons, menus, and pointers."
    },
    {
        id: 15,
        category: "Hardware & Ports",
        question: "Which modern digital cable interface transmits both uncompressed high-definition video and multi-channel audio?",
        options: [
            "VGA",
            "HDMI",
            "PS/2",
            "Serial RS-232"
        ],
        correct: 1,
        explanation: "HDMI (High-Definition Multimedia Interface) transmits high-resolution video and multi-channel digital audio simultaneously over a single cable."
    },
    {
        id: 16,
        category: "File Management",
        question: "What is the standard document file extension used by modern editions of Microsoft Word?",
        options: [
            ".txt",
            ".docx",
            ".xlsx",
            ".pptx"
        ],
        correct: 1,
        explanation: ".docx is the default XML-based document file format introduced by Microsoft Word starting in Office 2007."
    },
    {
        id: 17,
        category: "Cloud Computing",
        question: "Which of the following is a prominent example of Cloud Storage?",
        options: [
            "Google Drive",
            "Internal DVD-RW",
            "RAM Module",
            "ROM BIOS"
        ],
        correct: 0,
        explanation: "Google Drive, OneDrive, and Dropbox store files on secure cloud servers, allowing access from any internet-connected device."
    },
    {
        id: 18,
        category: "Number Systems",
        question: "The binary numeral system operates on which numeric base?",
        options: [
            "Base 10",
            "Base 16",
            "Base 2",
            "Base 8"
        ],
        correct: 2,
        explanation: "Binary operates on Base 2, using only two numerals (0 and 1) representing the physical on/off switch states in digital microprocessors."
    },
    {
        id: 19,
        category: "Hardware Components",
        question: "The primary printed circuit board that interconnects the CPU, RAM, and storage devices is known as the:",
        options: [
            "Motherboard",
            "Video Graphics Card",
            "Power Supply Unit",
            "Sound Card"
        ],
        correct: 0,
        explanation: "The Motherboard (or mainboard) provides electrical pathways and sockets through which all core computer components communicate."
    },
    {
        id: 20,
        category: "Internet & Email",
        question: "In an email client, what does 'BCC' stand for when adding recipients?",
        options: [
            "Backup Carbon Copy",
            "Blind Carbon Copy",
            "Business Communication Copy",
            "Binary Coded Connection"
        ],
        correct: 1,
        explanation: "Blind Carbon Copy (BCC) sends an email copy to recipients without showing their email addresses to any other recipient on the thread."
    }
];

let examState = {
    currentIndex: 0,
    answers: new Array(bit1Questions.length).fill(null),
    flagged: new Set(),
    totalTimeSeconds: 20 * 60, // 20 minutes
    timeRemaining: 20 * 60,
    timerInterval: null,
    isSubmitted: false,
    examStarted: false
};

function initBit1Exam() {
    if (!examState.initialized) {
        setupExamEventListeners();
        examState.initialized = true;
    }

    // Always reset view to CBT tab by default
    switchExamTab('cbt');

    // If exam has already been started by the candidate and not submitted, ensure active workspace is visible
    if (examState.examStarted && !examState.isSubmitted) {
        showActiveExamWorkspace();
    } else if (!examState.isSubmitted) {
        showInstructionsScreen();
    }
}

function switchExamTab(tabName) {
    const tabBtnCBT = document.getElementById('tabBtnCBT');
    const tabBtnGoogleForm = document.getElementById('tabBtnGoogleForm');
    const cbtContainer = document.getElementById('cbtExamContainer');
    const googleFormContainer = document.getElementById('googleFormContainer');

    if (tabName === 'cbt') {
        if (tabBtnCBT) tabBtnCBT.classList.add('active');
        if (tabBtnGoogleForm) tabBtnGoogleForm.classList.remove('active');
        if (cbtContainer) cbtContainer.style.display = 'block';
        if (googleFormContainer) googleFormContainer.style.display = 'none';
    } else {
        if (tabBtnGoogleForm) tabBtnGoogleForm.classList.add('active');
        if (tabBtnCBT) tabBtnCBT.classList.remove('active');
        if (cbtContainer) cbtContainer.style.display = 'none';
        if (googleFormContainer) googleFormContainer.style.display = 'block';
    }
}

function showInstructionsScreen() {
    const instructionsCard = document.getElementById('examInstructionsCard');
    const activeWorkspace = document.getElementById('examActiveWorkspace');
    const resultCard = document.getElementById('examResultCard');

    if (instructionsCard) instructionsCard.style.display = 'block';
    if (activeWorkspace) activeWorkspace.style.display = 'none';
    if (resultCard) resultCard.style.display = 'none';
}

function showActiveExamWorkspace() {
    const instructionsCard = document.getElementById('examInstructionsCard');
    const activeWorkspace = document.getElementById('examActiveWorkspace');
    const resultCard = document.getElementById('examResultCard');

    if (instructionsCard) instructionsCard.style.display = 'none';
    if (activeWorkspace) activeWorkspace.style.display = 'block';
    if (resultCard) resultCard.style.display = 'none';

    renderPalette();
    renderCurrentQuestion();
    updateProgressUI();
}

function setupExamEventListeners() {
    const btnPrev = document.getElementById('btnPrevQuestion');
    const btnNext = document.getElementById('btnNextQuestion');
    const btnClear = document.getElementById('btnClearSelection');
    const btnFlag = document.getElementById('btnFlagQuestion');
    const btnSubmitTop = document.getElementById('btnSubmitExamTop');
    const btnSubmitBottom = document.getElementById('btnSubmitExamBottom');
    const btnStartConfirmed = document.getElementById('btnStartExamConfirmed');
    const chkTerms = document.getElementById('chkAcceptTerms');

    // Tabs
    const tabBtnCBT = document.getElementById('tabBtnCBT');
    const tabBtnGoogleForm = document.getElementById('tabBtnGoogleForm');

    if (tabBtnCBT) {
        tabBtnCBT.addEventListener('click', () => switchExamTab('cbt'));
    }

    if (tabBtnGoogleForm) {
        tabBtnGoogleForm.addEventListener('click', () => switchExamTab('googleForm'));
    }

    // Start Exam Button from Instructions
    if (btnStartConfirmed) {
        btnStartConfirmed.addEventListener('click', () => {
            if (chkTerms && !chkTerms.checked) {
                alert("Please check the box confirming you have read and understood the instructions.");
                return;
            }

            examState.examStarted = true;
            showActiveExamWorkspace();
            startExamTimer();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (examState.currentIndex > 0) {
                examState.currentIndex--;
                renderCurrentQuestion();
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (examState.currentIndex < bit1Questions.length - 1) {
                examState.currentIndex++;
                renderCurrentQuestion();
            }
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            examState.answers[examState.currentIndex] = null;
            renderCurrentQuestion();
            renderPalette();
            updateProgressUI();
        });
    }

    if (btnFlag) {
        btnFlag.addEventListener('click', () => {
            const idx = examState.currentIndex;
            if (examState.flagged.has(idx)) {
                examState.flagged.delete(idx);
            } else {
                examState.flagged.add(idx);
            }
            renderCurrentQuestion();
            renderPalette();
        });
    }

    if (btnSubmitTop) {
        btnSubmitTop.addEventListener('click', promptSubmitExam);
    }

    if (btnSubmitBottom) {
        btnSubmitBottom.addEventListener('click', promptSubmitExam);
    }
}

function startExamTimer() {
    clearInterval(examState.timerInterval);
    updateTimerDisplay();

    examState.timerInterval = setInterval(() => {
        examState.timeRemaining--;
        updateTimerDisplay();

        if (examState.timeRemaining <= 0) {
            clearInterval(examState.timerInterval);
            alert("Time has expired! Submitting your Basic IT - 1 Examination now.");
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElem = document.getElementById('examTimer');
    const timerBox = document.getElementById('examTimerBox');
    if (!timerElem) return;

    const mins = Math.floor(examState.timeRemaining / 60);
    const secs = examState.timeRemaining % 60;
    timerElem.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (timerBox) {
        if (examState.timeRemaining <= 120) {
            timerBox.className = 'exam-timer-box timer-danger';
        } else if (examState.timeRemaining <= 300) {
            timerBox.className = 'exam-timer-box timer-warning';
        } else {
            timerBox.className = 'exam-timer-box';
        }
    }
}

function renderCurrentQuestion() {
    const q = bit1Questions[examState.currentIndex];
    if (!q) return;

    // Badges & text
    const categoryElem = document.getElementById('questionCategory');
    const numberBadgeElem = document.getElementById('questionNumberBadge');
    const textElem = document.getElementById('questionText');
    const flagBtn = document.getElementById('btnFlagQuestion');
    const flagText = document.getElementById('btnFlagText');

    if (categoryElem) categoryElem.textContent = q.category;
    if (numberBadgeElem) numberBadgeElem.textContent = `Question ${examState.currentIndex + 1} of ${bit1Questions.length}`;
    if (textElem) textElem.textContent = q.question;

    // Flag button state
    if (flagBtn) {
        if (examState.flagged.has(examState.currentIndex)) {
            flagBtn.classList.add('active');
            flagBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i> <span>Marked for Review</span>';
        } else {
            flagBtn.classList.remove('active');
            flagBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i> <span>Mark for Review</span>';
        }
    }

    // Previous / Next buttons state
    const btnPrev = document.getElementById('btnPrevQuestion');
    const btnNext = document.getElementById('btnNextQuestion');
    if (btnPrev) btnPrev.disabled = (examState.currentIndex === 0);
    if (btnNext) {
        if (examState.currentIndex === bit1Questions.length - 1) {
            btnNext.innerHTML = 'Finish <i class="fa-solid fa-check"></i>';
        } else {
            btnNext.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
        }
    }

    // Render Options
    const optionsContainer = document.getElementById('optionsContainer');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];

        q.options.forEach((optText, optIdx) => {
            const optDiv = document.createElement('div');
            const isSelected = examState.answers[examState.currentIndex] === optIdx;
            optDiv.className = `option-item ${isSelected ? 'selected' : ''}`;
            optDiv.innerHTML = `
                <div class="option-marker">${letters[optIdx]}</div>
                <div class="option-text">${optText}</div>
            `;

            optDiv.addEventListener('click', () => {
                examState.answers[examState.currentIndex] = optIdx;
                renderCurrentQuestion();
                renderPalette();
                updateProgressUI();
            });

            optionsContainer.appendChild(optDiv);
        });
    }

    // Highlight active in palette
    renderPalette();
}

function renderPalette() {
    const paletteGrid = document.getElementById('questionPaletteGrid');
    if (!paletteGrid) return;

    paletteGrid.innerHTML = '';

    bit1Questions.forEach((q, idx) => {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.textContent = idx + 1;

        if (idx === examState.currentIndex) {
            btn.classList.add('current');
        }

        const isAnswered = examState.answers[idx] !== null;
        const isFlagged = examState.flagged.has(idx);

        if (isAnswered) {
            btn.classList.add('answered');
        }

        if (isFlagged) {
            btn.classList.add('flagged');
        }

        btn.addEventListener('click', () => {
            examState.currentIndex = idx;
            renderCurrentQuestion();
        });

        paletteGrid.appendChild(btn);
    });
}

function updateProgressUI() {
    const progressText = document.getElementById('examProgressText');
    const answeredCount = document.getElementById('examAnsweredCount');
    const progressFill = document.getElementById('examProgressFill');

    const answered = examState.answers.filter(ans => ans !== null).length;
    const total = bit1Questions.length;

    if (progressText) {
        progressText.textContent = `Question ${examState.currentIndex + 1} of ${total}`;
    }

    if (answeredCount) {
        answeredCount.textContent = `${answered} of ${total} Answered`;
    }

    if (progressFill) {
        const percent = Math.round((answered / total) * 100);
        progressFill.style.width = `${Math.max(percent, 5)}%`;
    }
}

function promptSubmitExam() {
    const answered = examState.answers.filter(ans => ans !== null).length;
    const unanswered = bit1Questions.length - answered;

    let message = `Are you sure you want to submit your examination?\n\n• Answered: ${answered}\n• Unattempted: ${unanswered}`;
    if (unanswered > 0) {
        message += `\n\nYou still have ${unanswered} unattempted questions!`;
    }

    if (confirm(message)) {
        submitExam();
    }
}

function submitExam() {
    clearInterval(examState.timerInterval);
    examState.isSubmitted = true;

    // Calculate score
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    bit1Questions.forEach((q, idx) => {
        const userChoice = examState.answers[idx];
        if (userChoice === null) {
            unattemptedCount++;
        } else if (userChoice === q.correct) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    const totalQuestions = bit1Questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 60;
    const timeSpent = examState.totalTimeSeconds - examState.timeRemaining;
    const timeMins = Math.floor(timeSpent / 60);
    const timeSecs = timeSpent % 60;

    // Hide active exam workspace, show result card
    const activeWorkspace = document.getElementById('examActiveWorkspace');
    const resultCard = document.getElementById('examResultCard');
    const resultContent = document.getElementById('resultContent');

    if (activeWorkspace) activeWorkspace.style.display = 'none';

    if (resultCard && resultContent) {
        resultCard.style.display = 'block';

        const letters = ['A', 'B', 'C', 'D'];

        let reviewsHTML = '';
        bit1Questions.forEach((q, idx) => {
            const userChoice = examState.answers[idx];
            let itemClass = 'is-unanswered';
            let userAnsText = 'Not Attempted';

            if (userChoice !== null) {
                userAnsText = `${letters[userChoice]}: ${q.options[userChoice]}`;
                if (userChoice === q.correct) {
                    itemClass = 'is-correct';
                } else {
                    itemClass = 'is-incorrect';
                }
            }

            const correctAnsText = `${letters[q.correct]}: ${q.options[q.correct]}`;

            reviewsHTML += `
                <div class="review-item ${itemClass}">
                    <div class="review-q-title">
                        <span>Q${idx + 1}. ${q.question}</span>
                    </div>
                    <div class="review-answers-grid">
                        <div>
                            <span class="review-ans-label">Your Response:</span>
                            <span style="font-weight: 600; color: ${userChoice === q.correct ? 'var(--success)' : (userChoice === null ? '#facc15' : 'var(--danger)')}">
                                ${userChoice === q.correct ? '<i class="fa-solid fa-check"></i> ' : (userChoice === null ? '<i class="fa-solid fa-minus"></i> ' : '<i class="fa-solid fa-xmark"></i> ')}
                                ${userAnsText}
                            </span>
                        </div>
                        <div>
                            <span class="review-ans-label">Correct Answer:</span>
                            <span style="font-weight: 600; color: var(--success);">
                                <i class="fa-solid fa-check"></i> ${correctAnsText}
                            </span>
                        </div>
                    </div>
                    <div class="review-explanation">
                        <strong>Explanation:</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });

        resultContent.innerHTML = `
            <div class="result-badge-icon ${passed ? 'result-badge-passed' : 'result-badge-failed'}">
                <i class="fa-solid ${passed ? 'fa-trophy' : 'fa-clipboard-check'}"></i>
            </div>
            <h2>${passed ? '🎉 Congratulations! You Passed!' : '📚 Exam Completed - Keep Practicing!'}</h2>
            <div class="score-display">${correctCount} / ${totalQuestions}</div>
            <div class="score-percentage">Score: <strong>${percentage}%</strong> &bull; Passing Mark: 60% (12 Marks)</div>

            <div class="result-stats-grid">
                <div class="stat-box">
                    <div class="stat-val" style="color: var(--success);">${correctCount}</div>
                    <div class="stat-lbl">Correct</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="color: var(--danger);">${wrongCount}</div>
                    <div class="stat-lbl">Incorrect</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="color: #facc15;">${unattemptedCount}</div>
                    <div class="stat-lbl">Unattempted</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="color: var(--accent-primary);">${timeMins}m ${timeSecs}s</div>
                    <div class="stat-lbl">Time Taken</div>
                </div>
            </div>

            <div class="result-actions">
                <button class="btn btn-primary" id="btnRetakeExam">
                    <i class="fa-solid fa-rotate-right"></i> Retake Exam
                </button>
                <button class="btn btn-secondary" data-navigate="test-bit">
                    <i class="fa-solid fa-arrow-left"></i> Back to B-IT Tests
                </button>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSefHqJZ4flS4h771lO1Y0UNO7IIoEZsEbnmOdfxMsSE7ddYww/viewform?usp=header"
                    target="_blank" class="btn btn-outline">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Google Form
                </a>
            </div>

            <div class="review-section">
                <h3 class="mb-2"><i class="fa-solid fa-list-check text-accent"></i> Detailed Answer Review</h3>
                ${reviewsHTML}
            </div>
        `;

        const btnRetake = document.getElementById('btnRetakeExam');
        if (btnRetake) {
            btnRetake.addEventListener('click', restartExam);
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restartExam() {
    examState.currentIndex = 0;
    examState.answers = new Array(bit1Questions.length).fill(null);
    examState.flagged = new Set();
    examState.timeRemaining = examState.totalTimeSeconds;
    examState.isSubmitted = false;
    examState.examStarted = true;

    showActiveExamWorkspace();
    startExamTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================
   COURSE NOTES: SEARCH, FILTER & PREVIEW MODAL LOGIC
   ========================================================== */

function initNotesFeatures() {
    // 1. Live Search within Notes Grid
    const searchInputs = document.querySelectorAll('.notes-search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const targetGridId = e.target.getAttribute('data-filter-target');
            const targetGrid = document.getElementById(targetGridId);
            if (!targetGrid) return;

            const cards = targetGrid.querySelectorAll('.note-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const title = card.querySelector('.note-title')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('.note-desc')?.textContent.toLowerCase() || '';
                const topics = Array.from(card.querySelectorAll('.topic-badge')).map(t => t.textContent.toLowerCase()).join(' ');

                const matches = !query || title.includes(query) || desc.includes(query) || topics.includes(query);
                card.style.display = matches ? 'flex' : 'none';
                if (matches) visibleCount++;
            });

            // Handle empty state message
            let emptyMsg = targetGrid.querySelector('.notes-empty-state');
            if (visibleCount === 0) {
                if (!emptyMsg) {
                    emptyMsg = document.createElement('div');
                    emptyMsg.className = 'notes-empty-state';
                    emptyMsg.style.gridColumn = '1 / -1';
                    emptyMsg.innerHTML = `
                        <i class="fa-solid fa-file-circle-question"></i>
                        <h3>No matching notes found</h3>
                        <p>Try searching with another keyword or reset the category filter.</p>
                    `;
                    targetGrid.appendChild(emptyMsg);
                } else {
                    emptyMsg.style.display = 'block';
                }
            } else if (emptyMsg) {
                emptyMsg.style.display = 'none';
            }
        });
    });

    // 2. Category Filter Chips
    const filterContainers = document.querySelectorAll('.notes-filter-chips');
    filterContainers.forEach(container => {
        container.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;

            // Update active chip state
            container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filterValue = chip.getAttribute('data-filter');
            const targetGridId = container.getAttribute('data-filter-target');
            const targetGrid = document.getElementById(targetGridId);
            if (!targetGrid) return;

            // Clear search input on chip change
            const searchInput = document.querySelector(`.notes-search-input[data-filter-target="${targetGridId}"]`);
            if (searchInput) searchInput.value = '';

            const cards = targetGrid.querySelectorAll('.note-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                const matches = (filterValue === 'all' || category === filterValue);
                card.style.display = matches ? 'flex' : 'none';
                if (matches) visibleCount++;
            });

            // Clean up empty state if any
            const emptyMsg = targetGrid.querySelector('.notes-empty-state');
            if (emptyMsg) {
                emptyMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
            }
        });
    });

    // 3. Document / Drive Preview Modal
    const previewModal = document.getElementById('notesPreviewModal');
    const previewIframe = document.getElementById('previewModalIframe');
    const previewTitle = document.getElementById('previewModalTitle');
    const previewOpenDrive = document.getElementById('previewModalOpenDrive');
    const previewCloseBtn = document.getElementById('previewModalCloseBtn');

    // Event delegation for all preview buttons
    document.addEventListener('click', (e) => {
        const previewBtn = e.target.closest('.btn-preview');
        if (previewBtn && previewModal) {
            const docTitle = previewBtn.getAttribute('data-doc-title') || 'Document Preview';
            const docUrl = previewBtn.getAttribute('data-doc-url') || 'https://drive.google.com/';

            if (previewTitle) {
                previewTitle.innerHTML = `<i class="fa-solid fa-file-pdf text-accent"></i> ${docTitle}`;
            }

            if (previewOpenDrive) {
                previewOpenDrive.href = docUrl;
            }

            if (previewIframe) {
                const existingNotice = document.getElementById('previewModalFolderNotice');
                if (existingNotice) existingNotice.remove();

                let embedUrl = docUrl;
                if (embedUrl.includes('drive.google.com/file/d/')) {
                    embedUrl = embedUrl.replace(/\/view(\?.*)?$/, '/preview');
                    previewIframe.style.display = 'block';
                    previewIframe.src = embedUrl;
                } else {
                    // Google Drive folders cannot be embedded in iframes due to browser security
                    previewIframe.style.display = 'none';
                    previewIframe.src = 'about:blank';
                    const notice = document.createElement('div');
                    notice.id = 'previewModalFolderNotice';
                    notice.className = 'folder-preview-notice';
                    notice.innerHTML = `
                        <div style="text-align: center; padding: 2.5rem 1.5rem; color: #fff;">
                            <div style="font-size: 3.8rem; color: #10b981; margin-bottom: 1.25rem;">
                                <i class="fa-brands fa-google-drive"></i>
                            </div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Google Drive Course Notes Folder</h3>
                            <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem auto; line-height: 1.6; font-size: 0.98rem;">
                                All unit notes, PDFs, assignments, and study materials for this course are organized in Google Drive. Click below to view and download all files.
                            </p>
                            <a href="${escapeHtml(docUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-gdrive" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1.6rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; text-decoration: none;">
                                <i class="fa-brands fa-google-drive"></i> Open Folder in Google Drive <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.85rem; margin-left: 0.3rem;"></i>
                            </a>
                        </div>
                    `;
                    previewIframe.parentElement.appendChild(notice);
                }
            }

            previewModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // prevent background scrolling
        }
    });

    // Close Modal functions
    function closePreviewModal() {
        if (previewModal) {
            previewModal.classList.remove('show');
            if (previewIframe) {
                previewIframe.src = 'about:blank';
                previewIframe.style.display = 'block';
            }
            const existingNotice = document.getElementById('previewModalFolderNotice');
            if (existingNotice) existingNotice.remove();
            document.body.style.overflow = '';
        }
    }

    if (previewCloseBtn) {
        previewCloseBtn.addEventListener('click', closePreviewModal);
    }

    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                closePreviewModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewModal && previewModal.classList.contains('show')) {
            closePreviewModal();
        }
    });
}

// 4. Course-wise WhatsApp Channels Modal Controller
function initCourseChannelsModal() {
    const floatingBtn = document.getElementById('floatingNotesBtn');
    const channelModal = document.getElementById('courseChannelsModal');
    const closeBtn = document.getElementById('channelModalCloseBtn');

    if (!channelModal) return;

    function openModal() {
        channelModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        channelModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (floatingBtn) {
        floatingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    channelModal.addEventListener('click', (e) => {
        if (e.target === channelModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && channelModal.classList.contains('show')) {
            closeModal();
        }
    });

    // Close modal when jumping to course notes
    channelModal.querySelectorAll('.channel-notes-jump').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
        });
    });
}



