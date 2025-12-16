const UserListApp = (() => {
  // Данные
  let users = [
    { id: 1, firstName: 'Анна', lastName: 'Иванова', age: 25, email: 'anna@example.com', photoUrl: null },
    { id: 2, firstName: 'Борис', lastName: 'Петров', age: 17, email: 'boris@example.com', photoUrl: null },
    { id: 3, firstName: 'Виктория', lastName: 'Сидорова', age: 30, email: 'viktoriya@example.com', photoUrl: null },
    { id: 4, firstName: 'Глеб', lastName: 'Козлов', age: 16, email: 'gleb@example.com', photoUrl: null },
    { id: 5, firstName: 'Дарья', lastName: 'Морозова', age: 22, email: 'daria@example.com', photoUrl: null }
  ];

  let sortBy = 'asc'; // 'asc' | 'desc'
  let minAge = null;

  // DOM
  const usersListEl = document.getElementById('users-list');
  const ageFilterEl = document.getElementById('age-filter');
  const sortAscBtn = document.getElementById('sort-asc');
  const sortDescBtn = document.getElementById('sort-desc');

  // Валидация URL
  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  // Установка фото по URL
  function setPhotoUrl(userId) {
    const input = document.getElementById(`photo-url-${userId}`);
    const url = input.value.trim();
    if (url && isValidUrl(url)) {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.photoUrl = url;
        render();
      }
    } else {
      alert('Пожалуйста, введите корректный URL изображения (начинается с http:// или https://)');
    }
  }

  // Удаление фото
  function removePhoto(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.photoUrl = null;
      render();
    }
  }

  // Генерация HTML одной карточки
  function createUserCard(user) {
    const fullName = `${user.firstName} ${user.lastName}`;
    const initial = user.firstName.charAt(0).toUpperCase();

    const avatarContent = user.photoUrl
      ? `<img src="${user.photoUrl}" alt="Фото ${fullName}" class="user-card__avatar">`
      : `<div class="user-card__avatar">${initial}</div>`;

    const deleteBtn = user.photoUrl
      ? `<button type="button" onclick="UserListApp.removePhoto(${user.id})">Удалить фото</button>`
      : '';

    return `
      <li class="user-card" data-user-id="${user.id}">
        ${avatarContent}
        <div class="user-card__info">
          <h2>${fullName}</h2>
          <p>Возраст: ${user.age}</p>
          <p>Email: ${user.email}</p>
          <div class="user-card__photo-controls">
            <!-- Загрузка файла -->
            <input type="file" id="photo-file-${user.id}" accept="image/*" />
            <label for="photo-file-${user.id}">Загрузите фото</label>

            <!-- URL -->
            <input
              type="url"
              id="photo-url-${user.id}"
              class="user-card__photo-url"
              placeholder="или введите URL"
              value="${user.photoUrl || ''}"
            />
            <button type="button" onclick="UserListApp.setPhotoUrl(${user.id})">Применить URL</button>

            <!-- Удаление -->
            ${deleteBtn}
          </div>
        </div>
      </li>
    `;
  }

  // Рендер всего списка
  function render() {
    // Фильтрация
    let filtered = users;
    if (minAge !== null) {
      filtered = users.filter(u => u.age >= minAge);
    }

    // Сортировка
    filtered.sort((a, b) => {
      const nameA = (a.firstName + ' ' + a.lastName).toLowerCase();
      const nameB = (b.firstName + ' ' + b.lastName).toLowerCase();
      return sortBy === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    // Отрисовка
    usersListEl.innerHTML = filtered.map(createUserCard).join('');

    // Назначение обработчиков файлов (после innerHTML)
    filtered.forEach(user => {
      const fileInput = document.getElementById(`photo-file-${user.id}`);
      if (fileInput) {
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const userToUpdate = users.find(u => u.id === user.id);
              if (userToUpdate) {
                userToUpdate.photoUrl = ev.target.result;
                render();
              }
            };
            reader.readAsDataURL(file);
          }
        };
      }
    });
  }

  // Инициализация
  function init() {
    ageFilterEl.addEventListener('input', () => {
      minAge = ageFilterEl.value ? Number(ageFilterEl.value) : null;
      render();
    });

    sortAscBtn.addEventListener('click', () => {
      sortBy = 'asc';
      render();
    });

    sortDescBtn.addEventListener('click', () => {
      sortBy = 'desc';
      render();
    });

    render();
  }

  // Публичный API
  return {
    init,
    setPhotoUrl,
    removePhoto
  };
})();

// Запуск приложения
UserListApp.init();