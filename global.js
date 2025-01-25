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
    { url: 'https://github.com/scottbenninger', title: 'GitHub' }
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
  // Add the theme switcher dropdown to the page
document.body.insertAdjacentHTML(
    'afterbegin',
    
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    
  );
  
  const select = document.querySelector('#theme-switcher');
  
  // Check if a color scheme is saved in localStorage and apply it
  if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme; // Update the dropdown to reflect the saved value
  }
  