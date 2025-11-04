const state = {
  loading: false,
  notifications: []
};

export function setLoading(value){
  state.loading = Boolean(value);
  document.body.classList.toggle('is-loading', state.loading);
}

export function notify(message, type = 'info'){
  state.notifications.push({ message, type, id: Date.now() });
  console.log(`[${type}]`, message);
}

export function getNotifications(){
  return [...state.notifications];
}
