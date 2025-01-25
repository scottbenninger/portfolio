console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");
console.log(navLinks);

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);
console.log(currentLink);

currentLink?.classList.add("current");

const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/scottbenninger', title: 'GitHub' },
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

const nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  if (a.host !== location.host) {
    a.target = '_blank';
  }
  nav.append(a);
}

// Apply the saved theme on page load
if ('colorScheme' in localStorage) {
  const savedScheme = localStorage.colorScheme;
  document.documentElement.style.setProperty('color-scheme', savedScheme);
} else {
  // Set to automatic if no preference is found
  document.documentElement.style.setProperty('color-scheme', 'light dark');
}

// Add the theme switcher to the page
document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
      Theme:
      <select id="theme-switch">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>`
);

const themeSwitch = document.querySelector('#theme-switch');

// Set the dropdown to the saved scheme
if ('colorScheme' in localStorage) {
  themeSwitch.value = localStorage.colorScheme;
}

// Update the theme when the user changes it
themeSwitch.addEventListener('input', (event) => {
  const colorScheme = event.target.value;
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.colorScheme = colorScheme;
});
