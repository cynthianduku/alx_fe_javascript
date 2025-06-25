
let quotes = [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Life is short. Smile while you still have teeth.", category: "Humor" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteButton');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
}

function addQuote() {
  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Both fields are required!");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  newQuoteTextInput.value = '';
  newQuoteCategoryInput.value = '';
  alert("Quote added successfully!");
}

newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
