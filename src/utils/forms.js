export function formToJSON(form){
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

export function bindForm(form, handler){
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = formToJSON(form);
    await handler(data, { form });
  });
}
