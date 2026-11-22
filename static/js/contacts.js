
  const form = document.querySelector('.feedback-form form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();   
    const successNotice = document.querySelector("#form-success");
    const isValid = validateForm(form);
    if (isValid) {
      console.log('Форма валидна, можно отправлять');
      form.reset();
      clearAllErrors(form);
      
      successNotice.classList.remove("hidden");
      successNotice.scrollIntoView({ behavior: 'smooth', block: 'center' });

    }
    else{
      successNotice.classList.add("hidden");
    }
  });

  form.addEventListener('input', (event) => {
    const field = event.target;
    if (field.classList.contains('is-invalid')) {
      clearError(field);
    }
  });


function validateForm(form) {
  let isValid = true;

  const name = form.elements.name;
  const email = form.elements.email;
  const message = form.elements.message;

  if (name.value.trim().length < 2) {
    showError(name, 'Введите имя (минимум 2 символа)');
    isValid = false;
  } else {
    clearError(name);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    showError(email, 'Введите корректный email, например name@mail.ru');
    isValid = false;
  } else {
    clearError(email);
  }

  if (message.value.trim().length < 10) {
    showError(message, 'Сообщение должно быть не короче 10 символов');
    isValid = false;
  } else {
    clearError(message);
  }

  return isValid;
}

function showError(field, text) {
  field.classList.add('is-invalid');
  field.setAttribute('aria-invalid', 'true');
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const errorSpan = document.getElementById(field.id + '-error');
  if (errorSpan) {
    errorSpan.textContent = text;
  }
}

function clearError(field) {
  field.classList.remove('is-invalid');
  field.removeAttribute('aria-invalid');

  const errorSpan = document.getElementById(field.id + '-error');
  if (errorSpan) {
    errorSpan.textContent = '';
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(clearError);
}