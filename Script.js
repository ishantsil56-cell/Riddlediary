// --- 1. Riddle Authentication Logic ---
const storedRiddleAnswer = "echo"; 

function submitRiddle() {
    const input = document.getElementById('riddle-input').value.toLowerCase().trim();
    const feedback = document.getElementById('riddle-feedback');

    if (input === storedRiddleAnswer) {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('diary-screen').classList.add('active');
        initDiary();
    } else {
        feedback.innerText = "The ink fades... try again.";
        feedback.classList.remove('error-shake'); 
        void feedback.offsetWidth; // Trigger reflow
        feedback.classList.add('error-shake');
        setTimeout(() => feedback.classList.remove('error-shake'), 1000);
        document.getElementById('riddle-input').value = "";
    }
}

// --- 2. Diary Notes State Management ---
let diaryPages = [];
let currentPageIndex = 0;

const magicalQuotes = [
    "The ink knows what the heart hides.",
    "Shadows lengthen where the quill rests.",
    "A secret kept is a power slept.",
    "Words are but magic woven into existence.",
    "Memory is the darkest magic of all."
];

function initDiary() {
    // Load existing notes from Local Storage
    const savedNotes = localStorage.getItem('magicalDiaryNotes');
    
    if (savedNotes) {
        diaryPages = JSON.parse(savedNotes);
    } else {
        // Create a default first page if empty
        addNote(true);
    }
    renderPageContent(currentPageIndex);
}

function saveNotes() {
    localStorage.setItem('magicalDiaryNotes', JSON.stringify(diaryPages));
}

// --- 3. Note Operations (Add / Delete / Edit) ---
function addNote(isInitial = false) {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const randomQuote = magicalQuotes[Math.floor(Math.random() * magicalQuotes.length)];
    
    const newNote = {
        date: today,
        title: "Untitled Memory",
        content: "",
        quote: randomQuote
    };

    diaryPages.push(newNote);
    
    if (!isInitial) {
        // Jump to the newly created page with a flip animation
        currentPageIndex = diaryPages.length - 1;
        flipPage(0); // 0 means stay on current index but trigger animation
    }
    saveNotes();
}

function deleteNote() {
    if (diaryPages.length === 0) return;

    // Remove current page
    diaryPages.splice(currentPageIndex, 1);
    
    if (diaryPages.length === 0) {
        // If they delete the last page, create a blank one
        addNote(true);
        currentPageIndex = 0;
    } else if (currentPageIndex >= diaryPages.length) {
        // If they deleted the last item in the array, move back one index
        currentPageIndex = diaryPages.length - 1;
    }
    
    saveNotes();
    flipPage(0);
}

function updateCurrentNote(field, value) {
    if (diaryPages[currentPageIndex]) {
        diaryPages[currentPageIndex][field] = value;
        saveNotes();
    }
}

// --- 4. UI Rendering & Animation ---
function renderPageContent(index) {
    if(index >= diaryPages.length || index < 0) return;
    
    const pageData = diaryPages[index];
    const contentDiv = document.getElementById('diary-content');
    
    contentDiv.innerHTML = `
        <div class="flashcard-date">${pageData.date}</div>
        
        <input type="text" 
               class="flashcard-title" 
               value="${pageData.title}" 
               oninput="updateCurrentNote('title', this.value)" 
               placeholder="Title your memory..."/>
               
        <textarea 
               placeholder="Pour your thoughts onto the parchment..." 
               oninput="updateCurrentNote('content', this.value)">${pageData.content}</textarea>
               
        <div class="flashcard-quote">"${pageData.quote}"</div>
    `;

    document.getElementById('page-indicator').innerText = `Page ${index + 1} / ${diaryPages.length}`;
}

function flipPage(direction) {
    const newIndex = currentPageIndex + direction;
    
    // Prevent flipping out of bounds
    if (newIndex < 0 || newIndex >= diaryPages.length) return;
    
    currentPageIndex = newIndex;
    const bookElement = document.getElementById('diary-content');
    
    // Animate turning
    const rotation = direction > 0 ? "-90deg" : "90deg";
    bookElement.style.transform = `rotateY(${rotation})`; 
    bookElement.style.opacity = "0";
    
    setTimeout(() => {
        renderPageContent(currentPageIndex);
        
        // Snap to opposite side before animating back in
        bookElement.style.transition = "none";
        bookElement.style.transform = `rotateY(${direction > 0 ? "90deg" : "-90deg"})`;
        
        // Force reflow
        void bookElement.offsetWidth;
        
        // Animate settling
        bookElement.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease";
        bookElement.style.transform = "rotateY(0deg)";
        bookElement.style.opacity = "1";
    }, 300);
}