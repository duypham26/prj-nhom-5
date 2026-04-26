const faqsections = document.querySelectorAll(".faq-section");

faqsections.forEach((section) => {
  const question = section.querySelector(".faq-question");

  question.addEventListener("click", () => {
    section.classList.toggle("active");
  });
});
