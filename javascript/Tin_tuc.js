const subNavLinks = document.querySelectorAll('.sub-nav-inner ul li a');
const sections = document.querySelectorAll('.content-section');
const subNavItems = document.querySelectorAll('.sub-nav-inner ul li');

subNavLinks.forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    var targetId = this.getAttribute('data-section');

    sections.forEach(function(section) {
      section.classList.remove('active');
    });

    var targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    subNavItems.forEach(function(item) {
      item.classList.remove('active');
    });
    this.parentElement.classList.add('active');
  });
});