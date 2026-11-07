const API_URL = 'https://dummyjson.com';

const loadingEl = document.getElementById('loading');
const profileEl = document.getElementById('profile');
const errorEl = document.getElementById('profile-error');
const logoutBtn = document.getElementById('logout-btn');

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function logout() {
  clearTokens();
  window.location.replace('login.html');
}

// Запрос профиля с заголовком Authorization: Bearer
function fetchProfile(token) {
  return axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: 'Bearer ' + token }
  });
}

// Звёздочка: обновление токенов
async function refreshTokens() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('Нет refresh-токена');

  const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  return response.data.accessToken;
}

function renderProfile(user) {
  document.getElementById('avatar').src = user.image;
  document.getElementById('full-name').textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById('email').textContent = user.email;
  document.getElementById('age').textContent = user.age;
  document.getElementById('city').textContent = user.address && user.address.city ? user.address.city : '—';

  loadingEl.hidden = true;
  profileEl.hidden = false;
}

async function loadProfile() {
  const token = localStorage.getItem('accessToken');

  // Нет токена — на страницу входа
  if (!token) {
    window.location.replace('login.html');
    return;
  }

  try {
    const response = await fetchProfile(token);
    renderProfile(response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Токен просрочен или испорчен — пробуем обновить
      try {
        const newToken = await refreshTokens();
        const retry = await fetchProfile(newToken);
        renderProfile(retry.data);
      } catch (refreshError) {
        // Обновить не получилось — выход
        logout();
      }
    } else {
      loadingEl.hidden = true;
      errorEl.textContent = 'Не удалось загрузить профиль. Попробуйте обновить страницу';
    }
  }
}

logoutBtn.addEventListener('click', logout);

loadProfile();