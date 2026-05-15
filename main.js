document.addEventListener('DOMContentLoaded', () => {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const selectedLang = btn.textContent.trim().toLowerCase();
            
            changeLanguage(selectedLang);
        });
    });
});


// Nav scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
    nav.style.borderBottomColor = 'rgba(0,212,255,0.25)';
    } else {
    nav.style.borderBottomColor = 'rgba(0,212,255,0.15)';
    }
});


//////////////////////////////////////// language switcher
const boxLanguageSelect = document.querySelector(".language-toggle")
const langButtons = document.querySelectorAll("[data-language]")
const textsToChange = document.querySelectorAll("[data-section]")

langButtons.forEach((e) =>{
  e.addEventListener("click",() => {
    console.log(e.dataset.language)
    fetch(`i18n/${e.dataset.language}.json`)
    .then(res => res.json())
    .then(data => {
      textsToChange.forEach((elem) =>{
        const section = elem.dataset.section;
        const value = elem.dataset.value;

        elem.innerHTML = data[section][value]
      })
    })
  })
})
  



