# 🔢 Sudoku Web Moderno

Un juego de **Sudoku** elegante, moderno y responsivo hecho con HTML5, CSS3 y JavaScript vanilla. Listo para jugar localmente o publicar de forma gratuita en **GitHub Pages**.

![Vista previa](https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png)

---

## ✨ Características

- 🧠 **Generador inteligente con solución única**: Algoritmo de backtracking que crea tableros válidos y garantiza siempre una única solución posible.
- 🎚️ **4 Niveles de dificultad**:
  - **Fácil**: Ideal para principiantes y partidas rápidas (~38 pistas).
  - **Medio**: Nivel balanceado estándar (~30 pistas).
  - **Difícil**: Reto para jugadores avanzados (~25 pistas).
  - **Experto**: Máxima dificultad para estrategas (~22 pistas).
- 📝 **Modo Notas / Lápiz**: Anota números candidatos en una cuadrícula miniatura de 3x3 dentro de cada celda.
- ↩️ **Historial y Deshacer**: Deshaz tus movimientos en cualquier momento sin perder el estado del tablero.
- 💡 **Sistema de Pistas**: Obtén ayuda si te quedas atascado.
- 🎨 **Diseño Moderno & Modo Oscuro**: Detección automática del tema del sistema con botón para alternar entre modo claro y oscuro.
- 📱 **100% Responsivo**: Se adapta fluidamente a móviles, tablets y escritorios.
- ⏱️ **Cronómetro y Contador de Errores**: Con función de pausa para no perder el tiempo de juego.
- 💾 **Guardado Automático**: Si cierras o recargas la pestaña, tu partida en curso y tus estadísticas se mantienen intactas (`localStorage`).
- 🎉 **Animación de Victoria**: Celebración con confeti al completar el tablero.

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| `1` - `9` | Escribir número en la celda seleccionada |
| `Flechas (↑ ↓ ← →)` | Navegar por las celdas del tablero |
| `Backspace` / `Supr` | Borrar número o notas de la celda |
| `N` | Activar / Desactivar modo Notas (Lápiz) |
| `H` | Pedir una pista |
| `P` | Pausar / Reanudar el juego |
| `Ctrl + Z` / `Cmd + Z` | Deshacer último movimiento |

---

## 🚀 Cómo publicarlo en GitHub Pages (Paso a Paso)

### 1. Inicializar y subir el repositorio a GitHub

Si aún no has subido este código a tu cuenta de GitHub, ejecuta en tu terminal:

```bash
# Comprobar estado de git
git status

# Añadir los archivos y hacer tu primer commit
git add .
git commit -m "feat: implementar juego de Sudoku para GitHub Pages"

# Cambiar la rama principal a main (si no lo está ya)
git branch -M main

# Conectar con tu repositorio remoto de GitHub (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir los cambios
git push -u origin main
```

### 2. Activar GitHub Pages

1. Entra a tu repositorio en **GitHub**.
2. Ve a la pestaña **Settings** (Configuración) en la parte superior.
3. En el menú lateral izquierdo, haz clic en **Pages**.
4. En **Build and deployment** > **Source**:
   - Puedes seleccionar **Deploy from a branch** -> Selecciona rama `main` y carpeta `/ (root)`, luego clic en **Save**.
   - O bien seleccionar **GitHub Actions** (el proyecto ya incluye el archivo `.github/workflows/deploy.yml` configurado automáticamente).
5. ¡Listo! En 1 o 2 minutos, GitHub te dará tu enlace público, por ejemplo:
   `https://TU_USUARIO.github.io/TU_REPO/`

---

## 💻 Probar localmente

Puedes probar el juego en tu navegador de dos formas:

1. **Directamente**: Haz doble clic sobre el archivo `index.html` para abrirlo en cualquier navegador.
2. **Con un servidor local** (opcional):
   ```bash
   # Con Python 3
   python3 -m http.server 8000

   # O con Node.js npx
   npx serve .
   ```
   Luego abre `http://localhost:8000` en tu navegador.

---

## 📂 Estructura del Proyecto

```text
├── index.html              # Estructura principal y maquetación accesible
├── css/
│   └── styles.css          # Estilos modernos, diseño responsivo y temas
├── js/
│   ├── sudoku.js           # Motor de generación, resolución y validación
│   ├── game.js             # Lógica del juego, interacción de usuario y guardado
│   └── confetti.js         # Efecto de confeti para la victoria
├── .github/
│   └── workflows/
│       └── deploy.yml      # Flujo de despliegue automático para GitHub Pages
└── README.md               # Documentación e instrucciones
```

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia [MIT](LICENSE). ¡Siéntete libre de clonarlo, personalizarlo y mejorarlo!
