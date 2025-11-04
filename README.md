# Citas Ya SPA

Migración inicial a una arquitectura MVC con enrutamiento por hash y conexión a Supabase.

## Desarrollo

1. Edita `src/config/supabaseClient.js` si necesitas apuntar a otro proyecto Supabase. Usa siempre la **anon key** pública.
2. Sirve el proyecto con cualquier servidor estático (por ejemplo `npx serve .`).
3. La SPA se monta sobre `index.html` y el router usa `location.hash` para navegar.
4. `src/main.js` inicializa la sesión de Supabase y registra el enrutador.

## Estructura

```
/src
  config/        # Cliente de Supabase
  controllers/   # Capa de orquestación
  models/        # Abstracciones de tablas/RPC
  router/        # Router por hash
  services/      # Reglas de negocio
  store/         # Estado global (auth/ui)
  utils/         # Utilidades comunes
  views/         # Vistas renderizadas en el navegador
assets/          # Recursos estáticos (logo, imágenes)
```

## Deploy en GitHub Pages

* Habilita Pages apuntando a la rama `master/main` con carpeta raíz (`/`).
* El uso de hash routing evita problemas de 404. Aun así se incluye `404.html` redirigiendo a la SPA.
