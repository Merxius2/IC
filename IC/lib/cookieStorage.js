/**
 * Cookie Storage Helper
 * Provides functions to save and load data from cookies with expiration
 */

export const saveToCookie = (key, data, daysExpiration = 30) => {
  try {
    const jsonData = JSON.stringify(data);
    const date = new Date();
    date.setTime(date.getTime() + daysExpiration * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${key}=${encodeURIComponent(jsonData)};${expires};path=/`;
  } catch (error) {
    console.error(`Error saving to cookie: ${key}`, error);
  }
};

export const loadFromCookie = (key) => {
  try {
    const nameEQ = `${key}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const jsonData = decodeURIComponent(cookie.substring(nameEQ.length));
        return JSON.parse(jsonData);
      }
    }
    return null;
  } catch (error) {
    console.error(`Error loading from cookie: ${key}`, error);
    return null;
  }
};

export const deleteCookie = (key) => {
  try {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  } catch (error) {
    console.error(`Error deleting cookie: ${key}`, error);
  }
};
