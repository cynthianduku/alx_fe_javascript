let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Use your actual mock endpoint

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Believe in yourself.", category: "Motivation" },
      { text: "Life is short. Smile while you still have teeth.", category: "Humor" },
      { text: "Stay hungry, stay foolish.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function createAddQuoteForm() {
  const formDiv = document.createElement('div');

  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.placeholder = 'Enter a new quote';
  formDiv.appendChild(textInput);

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';
  formDiv.appendChild(categoryInput);

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;
  formDiv.appendChild(addButton);

  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export Quotes';
  exportButton.onclick = exportQuotes;
  formDiv.appendChild(exportButton);

  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.id = 'importFile';
  importInput.onchange = importFromJsonFile;
  formDiv.appendChild(importInput);

  document.body.appendChild(formDiv);
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Both quote and category are required!');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert('Quote added!');
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (error) {
      alert('Failed to import quotes: ' + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}


function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All';
  categorySelect.appendChild(allOption);

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter && (savedFilter === 'all' || categories.includes(savedFilter))) {
    categorySelect.value = savedFilter;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);
  let filtered = quotes;

  if (selectedCategory !== 'all') {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    quoteDisplay.innerHTML = `
      <p><strong>Quote:</strong> ${quote.text}</p>
      <p><strong>Category:</strong> ${quote.category}</p>
    `;
  } else {
    quoteDisplay.innerHTML = `<p>No quotes found in "${selectedCategory}"</p>`;
  }
}


async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    let newQuotes = 0;
    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(localQuote =>
        localQuote.text === serverQuote.body &&
        localQuote.category === serverQuote.title
      );
      if (!exists) {
        quotes.push({ text: serverQuote.body, category: serverQuote.title });
        newQuotes++;
      }
    });

    if (newQuotes > 0) {
      saveQuotes();
      populateCategories();
      notifyUser(`${newQuotes} new quote(s) synced from server.`);
    }

  } catch (error) {
    console.error("Failed to fetch from server:", error);
  }
}

async function syncQuotes() {
  try {
    const unsyncedQuotes = quotes.map(q => ({
      title: q.category,
      body: q.text,
      userId: 1
    }));

    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unsyncedQuotes)
    });

    if (response.ok) {
      notifyUser("Quotes synced with server!");
    } else {
      console.error("Failed to sync quotes to server.");
    }
  } catch (error) {
    console.error("Sync error:", error);
  }
}


function notifyUser(message) {
  const note = document.getElementById('notification');
  note.textContent = message;
  note.style.display = 'block';

  setTimeout(() => {
    note.style.display = 'none';
  }, 5000);
}


loadQuotes();
populateCategories();
createAddQuoteForm();
newQuoteBtn.addEventListener('click', showRandomQuote);


setInterval(() => {
  fetchQuotesFromServer();
  syncQuotes();
}, 30000);
