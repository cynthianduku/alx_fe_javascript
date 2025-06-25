let quotes = [];


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
  displayQuote(quote);
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}


function displayQuote(quote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
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


function exportToJsonFile() {
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
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    displayQuote(quote);
  } else {
    document.getElementById('quoteDisplay').innerHTML = `<p>No quotes found in "${selectedCategory}"</p>`;
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

const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Replace with real mock API

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    let newQuotes = 0;

    serverQuotes.forEach(serverQuote => {
      if (serverQuote.body && serverQuote.title) {
        const exists = quotes.some(localQuote =>
          localQuote.text === serverQuote.body &&
          localQuote.category === serverQuote.title
        );

        if (!exists) {
          quotes.push({ text: serverQuote.body, category: serverQuote.title });
          newQuotes++;
        }
      }
    });

    if (newQuotes > 0) {
      saveQuotes();
      populateCategories();
      notifyUser(`${newQuotes} new quote(s) synced with server!`);
    }
  } catch (error) {
    console.error('Failed to fetch from server:', error);
  }
}

setInterval(fetchQuotesFromServer, 30000);


loadQuotes();
populateCategories();
createAddQuoteForm();
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
