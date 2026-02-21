import { generateBooks } from "./scripts/BookGenerator.js";

let books = [];
const tableBody = document.getElementById('table-body');
const countEl = document.getElementById('count');
const searchInput = document.getElementById('search');
const form = document.getElementById('book-form');

async function loadBooks() {
    try {
        books = await generateBooks(10);
        render();
    } catch (error) {
        console.error('ошибка загрузки книг', error);
        alert('Не удалосб загрузить книги');
    }
}

document.getElementById('reload').addEventListener('click', loadBooks);

function render() {
    tableBody.innerHTML = '';

    const query = searchInput.value.toLowerCase().trim();

    const filtered = books.filter(book => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query));

    filtered.forEach(book => {
        const tr = document.createElement('tr');
        tr.dataset.id = book.id;

        tr.innerHTML = `
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>${book.genre || ''}</td>
    <td>${book.year ?? ''}</td>
    <td>${book.rating ?? ''}</td>
    <td>
    <button class="edit">Редактировать</button>
    <button class="delete">Удалить</button>
    </td>
    `;

        tableBody.appendChild(tr);
    });

    countEl.textContent = filtered.length;
}

tableBody.addEventListener('click', e => {
    const row = e.target.closest('tr');
    if (!row) return;

    const id = row.dataset.id;

    if (e.target.classList.contains('delete')) {
        if (!confirm('Действительно удалить книгу?')) return;

        books = books.filter(book => book.id !== id);
        render();
    }

    if (e.target.classList.contains('edit')) {
        const book = books.find(b => b.id === id);
        if (book) fillForm(book);
    }
});

form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const bookData = normalizeBook(data);

    if (data.id) {
        // Редактирование
        const book = books.find(b => b.id === data.id);
        if (book) {
            Object.assign(book, bookData);
        }
    } else {
        // Добавление новой книги
        books.push({
            id: crypto.randomUUID(),
            ...bookData
        });
    }

    form.reset();
    form.querySelector('[name="id"]').value = ''; // очень важно!
    render();
});

function fillForm(book) {
    form.querySelector('[name="id"]').value = book.id;
    form.querySelector('[name="title"]').value = book.title;
    form.querySelector('[name="author"]').value = book.author;
    form.querySelector('[name="genre"]').value = book.genre || '';
    form.querySelector('[name="year"]').value = book.year || '';
    form.querySelector('[name="rating"]').value = book.rating || '';
}

// Поиск в реальном времени
searchInput.addEventListener('input', render);

// Экспорт JSON
document.getElementById('export').addEventListener('click', () => {
    const json = JSON.stringify(books, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'books.json';
    link.click();

    URL.revokeObjectURL(url);
});

// Старт
loadBooks();

