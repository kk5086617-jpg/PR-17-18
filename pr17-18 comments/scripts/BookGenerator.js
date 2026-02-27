/* объявляется массив строк */
const SUBJECTS = [
    'fantasy',
    'science',
    'romance',
    'history',
    'horror',
    'love'
];


/* рандомно выбирается жанр */
function randomItem(SUBJECTS) {
    return SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
}


export async function generateBooks(count = 10) {
    // Пытаемся получить книги максимум 5 раз с разными жанрами
    for (let attempt = 0; attempt < 5; attempt++) {
        // Получаем случайный жанр для текущей попытки
        const subject = randomItem(SUBJECTS);
        
        // Формируем URL для запроса к OpenLibrary API
        // Запрашиваем книги по выбранному жанру, ограничивая результат 50 книгами
        const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;

        // Отправляем GET-запрос к API и ждем ответ
        const response = await fetch(url);
        
        // Проверяем успешность запроса (статус 200-299)
        // Если запрос неудачный - переходим к следующей попытке
        if (!response.ok) continue;

        // Парсим JSON-ответ в JavaScript объект
        const data = await response.json();
        
        // Проверяем наличие массива книг в ответе
        // Если нет поля works или это не массив - переходим к следующей попытке
        if (!data.works || !Array.isArray(data.works)) continue;

        // Обрабатываем полученные книги
        const books = data.works
            // Фильтруем: оставляем только книги с названием и хотя бы одним автором
            // Опциональная цепочка (?.) безопасно проверяет наличие авторов
            .filter(b => b.title && b.authors?.length)
            // Берем только первые count книг из отфильтрованного массива
            .slice(0, count)
            // Преобразуем каждую книгу в нужный нам формат
            .map(book => ({
                // Генерируем уникальный идентификатор для каждой книги
                id: crypto.randomUUID(),
                // Название книги
                title: book.title,
                // Преобразуем массив авторов в строку с именами через запятую
                author: book.authors.map(a => a.name).join(', '),
                // Присваиваем жанр, по которому делали запрос
                genre: subject,
                // Год первой публикации, если его нет - ставим null
                year: book.first_publish_year ?? null,
                // Генерируем случайный рейтинг от 3 до 5 с одним знаком после запятой
                // Math.random() * 2 дает число 0-2, прибавляем 3 = 3-5
                // toFixed(1) округляет до 1 знака, унарный плюс преобразует строку в число
                rating: +(Math.random() * 2 + 3).toFixed(1)
            }));

        // Если удалось получить хотя бы одну книгу
        if (books.length > 0) {
            // Возвращаем массив книг и завершаем выполнение функции
            return books;
        }
    }
    
    // Если после 5 попыток не удалось получить ни одной книги
    // Выбрасываем ошибку с соответствующим сообщением
    throw new Error("не удалось сгенерировать книги")
}
