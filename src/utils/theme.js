export function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}

export function initializeThemeToggle(
  lightToggleId = "themeToggleLight",
  darkToggleId = "themeToggleDark"
) {
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    setCookie("theme", theme, 30);

    // Update radio button states
    const lightToggle = document.getElementById(lightToggleId);
    const darkToggle = document.getElementById(darkToggleId);

    if (lightToggle && darkToggle) {
      lightToggle.checked = theme === "light";
      darkToggle.checked = theme === "dark";
    }
  }

  function initializeTheme() {
    const savedTheme = getCookie("theme") || "light";
    setTheme(savedTheme);
  }

  function setupEventListeners() {
    const lightToggle = document.getElementById(lightToggleId);
    const darkToggle = document.getElementById(darkToggleId);

    if (lightToggle) {
      lightToggle.addEventListener("change", () => {
        if (lightToggle.checked) {
          setTheme("light"); // Changed from "dark" to "light"
        }
      });
    }

    if (darkToggle) {
      darkToggle.addEventListener("change", () => {
        if (darkToggle.checked) {
          setTheme("dark"); // Changed from "light" to "dark"
        }
      });
    }

    initializeTheme();
  }

  // Check if DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupEventListeners);
  } else {
    setupEventListeners();
  }
}
