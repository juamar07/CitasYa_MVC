import { AuthService } from '../services/AuthService.js';
import { notify } from '../store/ui.js';

export const AuthController = {
  async login({ email, password }){
    const { error } = await AuthService.login(email, password);
    if (error) throw error;
    notify('Inicio de sesión exitoso', 'success');
  },
  async logout(){
    await AuthService.logout();
    notify('Sesión finalizada', 'info');
  },
  async registerCliente(payload){
    const { error } = await AuthService.registerCliente(payload);
    if (error) throw error;
    notify('Usuario registrado, revisa tu correo', 'success');
  }
};
