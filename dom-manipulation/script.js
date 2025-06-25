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

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

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

loadQuotes();
createAddQuoteForm();
newQuoteBtn.addEventListener('click', showRandomQuote);
