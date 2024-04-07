// Get all the dropdown buttons
const dropdownBtns = document.querySelectorAll('.dropdown-btn');

// Add click event listener to each dropdown button
dropdownBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const dropdownContent = btn.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  });
});
