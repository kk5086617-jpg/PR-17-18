// Импортируем функцию generateBooks из модуля BookGenerator.js
import { generateBooks } from "./scripts/BookGenerator.js";

// Массив для хранения всех книг в памяти приложения
let books = [];
// Ссылка на элемент tbody таблицы, куда будем добавлять строки с книгами
const tableBody = document.getElementById('table-body');
// Ссылка на элемент для отображения количества отфильтрованных книг
const countEl = document.getElementById('count');
// Ссылка на поле ввода поиска
const searchInput = document.getElementById('search');
// Ссылка на форму добавления/редактирования книги
const form = document.getElementById('book-form');

/**
 * Асинхронная функция для загрузки книг через API
 */
async function loadBooks() {
    try {
        // Пытаемся получить 10 книг через функцию generateBooks
        // await приостанавливает выполнение пока книги не загрузятся
        books = await generateBooks(10);
        // После успешной загрузки отображаем книги
        render();
    } catch (error) {
        // Если произошла ошибка при загрузке - выводим в консоль
        console.error('ошибка загрузки книг', error);
        // И показываем уведомление пользователю
        alert('Не удалосб загрузить книги');
    }
}

// Навешиваем обработчик события клика на кнопку "Перезагрузить"
// При клике вызывается функция loadBooks
document.getElementById('reload').addEventListener('click', loadBooks);

/**
 * Функция для отрисовки таблицы с книгами
 */
function render() {
    // Очищаем содержимое таблицы
    tableBody.innerHTML = '';

    // Получаем поисковый запрос, приводим к нижнему регистру и удаляем пробелы по краям
    const query = searchInput.value.toLowerCase().trim();

    // Фильтруем книги по поисковому запросу
    // Проверяем вхождение запроса в название ИЛИ в автора
    const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
    );

    // Проходим по каждой отфильтрованной книге и создаем строку таблицы
    filtered.forEach(book => {
        // Создаем элемент tr (строку таблицы)
        const tr = document.createElement('tr');
        // Сохраняем id книги в data-атрибут строки для последующей идентификации
        tr.dataset.id = book.id;

        // Заполняем HTML содержимое строки данными книги
        tr.innerHTML = `
    <td>${book.title}</td>                    <!-- Название книги -->
    <td>${book.author}</td>                    <!-- Автор -->
    <td>${book.genre || ''}</td>               <!-- Жанр (или пустая строка если нет) -->
    <td>${book.year ?? ''}</td>                 <!-- Год (?? проверяет только null/undefined) -->
    <td>${book.rating ?? ''}</td>               <!-- Рейтинг -->
    <td>
    <button class="edit">Редактировать</button> <!-- Кнопка редактирования -->
    <button class="delete">Удалить</button>     <!-- Кнопка удаления -->
    </td>
    `;

        // Добавляем созданную строку в таблицу
        tableBody.appendChild(tr);
    });

    // Обновляем счетчик с количеством отфильтрованных книг
    countEl.textContent = filtered.length;
}

// Обработчик кликов по таблице (делегирование событий)
tableBody.addEventListener('click', e => {
    // Находим ближайший элемент tr (строку), на которой произошел клик
    const row = e.target.closest('tr');
    // Если строка не найдена (кликнули не по строке) - выходим
    if (!row) return;

    // Получаем id книги из data-атрибута строки
    const id = row.dataset.id;

    // Проверяем, был ли клик по кнопке с классом 'delete'
    if (e.target.classList.contains('delete')) {
        // Запрашиваем подтверждение удаления
        if (!confirm('Действительно удалить книгу?')) return;

        // Фильтруем массив книг - оставляем все кроме удаляемой
        books = books.filter(book => book.id !== id);
        // Перерисовываем таблицу
        render();
    }

    // Проверяем, был ли клик по кнопке с классом 'edit'
    if (e.target.classList.contains('edit')) {
        // Находим книгу по id
        const book = books.find(b => b.id === id);
        // Если книга найдена - заполняем форму её данными
        if (book) fillForm(book);
    }
});

// Обработчик отправки формы (добавление/редактирование)
form.addEventListener('submit', e => {
    // Отменяем стандартное поведение формы (перезагрузку страницы)
    e.preventDefault();

    // Создаем объект FormData из данных формы
    const formData = new FormData(form);
    // Преобразуем FormData в обычный объект
    const data = Object.fromEntries(formData);

    // Нормализуем данные книги (преобразуем строки в числа и т.д.)
    const bookData = normalizeBook(data);

    // Проверяем есть ли id (значит это редактирование существующей книги)
    if (data.id) {
        // Находим книгу по id
        const book = books.find(b => b.id === data.id);
        if (book) {
            // Копируем все поля из bookData в найденную книгу
            Object.assign(book, bookData);
        }
    } else {
        // Если id нет - это добавление новой книги
        books.push({
            // Генерируем уникальный id для новой книги
            id: crypto.randomUUID(),
            // Добавляем все поля из формы
            ...bookData
        });
    }

    // Очищаем форму
    form.reset();
    // Важно: очищаем скрытое поле id, чтобы следующее добавление не считалось редактированием
    form.querySelector('[name="id"]').value = '';
    // Перерисовываем таблицу
    render();
});

/**
 * Функция для заполнения формы данными выбранной книги
 * @param {Object} book - объект книги
 */
function fillForm(book) {
    // Заполняем каждое поле формы соответствующим значением из книги
    form.querySelector('[name="id"]').value = book.id;
    form.querySelector('[name="title"]').value = book.title;
    form.querySelector('[name="author"]').value = book.author;
    form.querySelector('[name="genre"]').value = book.genre || '';
    form.querySelector('[name="year"]').value = book.year || '';
    form.querySelector('[name="rating"]').value = book.rating || '';
}

// Обработчик поиска в реальном времени
// При каждом изменении текста в поиске перерисовываем таблицу
searchInput.addEventListener('input', render);

// Обработчик кнопки экспорта в JSON
document.getElementById('export').addEventListener('click', () => {
    // Преобразуем массив книг в JSON строку с отступами для читаемости
    const json = JSON.stringify(books, null, 2);
    // Создаем Blob (бинарный объект) с JSON данными
    const blob = new Blob([json], { type: 'application/json' });
    // Создаем временный URL для Blob
    const url = URL.createObjectURL(blob);

    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = 'books.json'; // Имя файла для скачивания
    link.click(); // Программно кликаем по ссылке - начинается скачивание

    // Освобождаем временный URL
    URL.revokeObjectURL(url);
});

// Запускаем приложение - загружаем книги при старте
loadBooks();