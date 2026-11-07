const API_URL = 'https://dummyjson.com';

// Если пользователь уже вошёл — сразу на профиль
if (localStorage.getItem('accessToken')) {
  window.location.replace('profile.html');
}

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('username-error');
const passwordError = document.getElementById('password-error');
const formError = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');

function setFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
}

function clearErrors() {
  setFieldError(usernameInput, usernameError, '');
  setFieldError(passwordInput, passwordError, '');
  formError.textContent = '';
}

function validate(username, password) {
  let valid = true;
  if (!username) {
    setFieldError(usernameInput, usernameError, 'Введите логин');
    valid = false;
  }
  if (!password) {
    setFieldError(passwordInput, passwordError, 'Введите пароль');
    valid = false;
  }
  return valid;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Пустые поля — ошибка, запрос не отправляем
  if (!validate(username, password)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Вход...';

  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });

    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    window.location.href = 'profile.html';
  } catch (error) {
    if (error.response && error.response.status === 400) {
      formError.textContent = 'Неверный логин или пароль';
    } else {
      formError.textContent = 'Не удалось выполнить вход. Проверьте подключение и попробуйте снова';
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Войти';
  }
});

// Убираем ошибку поля при вводе
usernameInput.addEventListener('input', () => setFieldError(usernameInput, usernameError, ''));
passwordInput.addEventListener('input', () => setFieldError(passwordInput, passwordError, ''));