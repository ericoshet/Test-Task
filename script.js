const UserListApp = (() => {
  let users = [
    { id: 1, firstName: 'Анна', lastName: 'Иванова', age: 25, email: 'anna@example.com', photoUrl: null },
    { id: 2, firstName: 'Борис', lastName: 'Петров', age: 17, email: 'boris@example.com', photoUrl: null },
    { id: 3, firstName: 'Виктория', lastName: 'Сидорова', age: 30, email: 'viktoriya@example.com', photoUrl: null },
    { id: 4, firstName: 'Глеб', lastName: 'Козлов', age: 16, email: 'gleb@example.com', photoUrl: null },
    { id: 5, firstName: 'Дарья', lastName: 'Морозова', age: 22, email: 'daria@example.com', photoUrl: null }
  ];

  let sortBy = 'asc';
  let minAge = null;

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

  // Генерация HTML карточки
  function createUserCard(user) {
    const fullName = `${user.firstName} ${user.lastName}`;
    const initial = `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`;
    const avatarContent = user.photoUrl
      ? `<img src="${user.photoUrl}" alt="Фото ${fullName}" class="user-card__avatar">`
      : `<div class="user-card__avatar">${initial}</div>`;

    const deleteBtn = user.photoUrl
      ? `<button type="button" class="user-card__remove-photo" data-user-id="${user.id}">Удалить фото</button>`
      : '';

    return `
      <li class="user-card" data-user-id="${user.id}">
        ${avatarContent}
        <div class="user-card__info">
          <h2>${fullName}</h2>
          <p>Возраст: ${user.age}</p>
          <p>Email: ${user.email}</p>
          <div class="user-card__photo-controls">
            <input type="file" id="photo-file-${user.id}" accept="image/*" />
            <label for="photo-file-${user.id}">Загрузить файл</label>
            <input
              type="url"
              id="photo-url-${user.id}"
              class="user-card__photo-url"
              placeholder="или URL"
              value="${user.photoUrl || ''}"
            />
            <button type="button" class="user-card__apply-url" data-user-id="${user.id}">Применить URL</button>
            ${deleteBtn}
          </div>
        </div>
      </li>
    `;
  }

  // Обновление одной карточки
  function updateUserCard(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const cardEl = document.querySelector(`.user-card[data-user-id="${userId}"]`);
    if (!cardEl) return;

    const newCardHTML = createUserCard(user);
    const tmp = document.createElement('div');
    tmp.innerHTML = newCardHTML.trim();
    const newCardEl = tmp.firstElementChild;

    cardEl.replaceWith(newCardEl);

    // Переназначаем обработчик загрузки файла
    const fileInput = newCardEl.querySelector(`#photo-file-${userId}`);
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const userToUpdate = users.find(u => u.id === userId);
            if (userToUpdate) {
              userToUpdate.photoUrl = ev.target.result;
              updateUserCard(userId);
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }

  // Полная перерисовка списка (для фильтрации/сортировки)
  function renderFullList() {
    let filtered = users;
    if (minAge !== null) {
      filtered = users.filter(u => u.age >= minAge);
    }

    filtered.sort((a, b) => {
      const nameA = (a.firstName + ' ' + a.lastName).toLowerCase();
      const nameB = (b.firstName + ' ' + b.lastName).toLowerCase();
      return sortBy === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    usersListEl.innerHTML = filtered.map(createUserCard).join('');

    // Назначаем обработчики файлов
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
                updateUserCard(user.id);
              }
            };
            reader.readAsDataURL(file);
          }
        };
      }
    });
  }

  // Локальные обработчики (не глобальные!)
  function handleApplyUrl(userId) {
    const input = document.getElementById(`photo-url-${userId}`);
    const url = input.value.trim();
    if (url && isValidUrl(url)) {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.photoUrl = url;
        updateUserCard(userId);
      }
    } else {
      alert('Пожалуйста, введите корректный URL изображения (начинается с http:// или https://)');
    }
  }

  function handleRemovePhoto(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.photoUrl = null;
      updateUserCard(userId);
    }
  }

  // Инициализация
  function init() {
    // Делегирование на списке
    usersListEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('user-card__apply-url')) {
        const userId = Number(e.target.dataset.userId);
        handleApplyUrl(userId);
      } else if (e.target.classList.contains('user-card__remove-photo')) {
        const userId = Number(e.target.dataset.userId);
        handleRemovePhoto(userId);
      }
    });

    // Фильтр по возрасту
    ageFilterEl.addEventListener('input', () => {
      minAge = ageFilterEl.value ? Number(ageFilterEl.value) : null;
      renderFullList();
    });

    // Сортировка
    sortAscBtn.addEventListener('click', () => {
      sortBy = 'asc';
      renderFullList();
    });

    sortDescBtn.addEventListener('click', () => {
      sortBy = 'desc';
      renderFullList();
    });

    renderFullList();
  }

  return { init };
})();

UserListApp.init();