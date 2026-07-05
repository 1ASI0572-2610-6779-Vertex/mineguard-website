# Feature "Register Your Company" — Especificación para migración al App Web

> Este documento describe **exactamente** cómo funcionaba el modal de registro que vivía
> en la landing page, para reimplementarlo dentro del app web de MineGuard.
> La landing quedó como página estática cuyo único CTA lleva al app web.

---

## 1. Resumen funcional

El feature era un **modal (overlay)** que se abría desde 4 CTAs de la landing:

- Botón héroe "Subscribe Now"
- Los 3 botones de planes (`starter`, `standard`, `enterprise`) en la sección de precios

El modal tenía **dos zonas**:

1. **Calculadora / Assessment (solo UX, no se enviaba al backend):**
   - Slider "Vehicles / Sensors" (`min=1, max=500`, default `25`)
   - Slider "Operators per Shift" (`min=1, max=200`, default `10`)
   - Una tarjeta que recomendaba un plan en tiempo real según el nº de vehículos.

2. **Formulario de registro (lo único que viajaba a la API):**
   - `companyName` (Company Name)
   - `adminFullName` (Administrator Full Name)
   - `adminEmail` (Administrator Email)

Al enviar con éxito, se ocultaba el formulario y se mostraba una pantalla de "Registration Successful".

---

## 2. Contrato con el backend (lo más importante)

### Endpoint

```
POST https://mineguard-webservice.onrender.com/api/v1/subscriptions
Content-Type: application/json
```

### Request body — **FIREWALL: solo estos 3 campos**

```json
{
  "companyName": "Antofagasta Minerals",
  "adminFullName": "Juan García Flores",
  "adminEmail": "jgarcia@company.com"
}
```

> **Decisión de diseño deliberada:** los valores de los sliders (fleetSize, operatorCount)
> y el plan recomendado **NUNCA se enviaban**. Eran solo una herramienta visual para
> orientar al usuario. En el código estaba marcado como `TAREA 4 FIREWALL`. Mantener esa
> separación en el app web salvo que el producto decida lo contrario.

### Respuestas

| Status | Significado | Manejo en UI |
|--------|-------------|--------------|
| `2xx`  | Registro OK | Mostrar pantalla de éxito |
| `409`  | Email ya registrado | Mensaje: "This email is already registered. Please sign in." |
| Otro / red | Error genérico | "Something went wrong. Please try again or contact support@mineguard.io" |

### Implementación original (referencia)

```js
async function registerCompany(companyName, adminFullName, adminEmail) {
  const res = await fetch(`${API_BASE_URL}/api/v1/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, adminFullName, adminEmail }),
  });
  if (!res.ok) {
    const err = new Error('API_ERROR');
    err.status = res.status;   // se usa para distinguir el 409
    throw err;
  }
  return res.json();
}
```

---

## 3. Validación de formulario (front-end)

Antes de enviar se validaba:

- Los 3 campos **no vacíos** (`trim().length > 0`) → error "This field is required."
- `adminEmail` con regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` → error "Please enter a valid email address."

Estado de UI durante el submit:

1. Deshabilitar botón + spinner + texto "Registering..."
2. En éxito → ocultar form, mostrar bloque de éxito.
3. En error → rehabilitar botón, restaurar texto, mostrar mensaje de API inline.

---

## 4. Calculadora de plan (lógica de recomendación)

Fuente de verdad de los planes:

```js
const PLANS = [
  { key: 'starter',    nameKey: 'register.rec-starter-name',    price: '$250', threshold: 49 },
  { key: 'standard',   nameKey: 'register.rec-standard-name',   price: '$499', threshold: 200 },
  { key: 'enterprise', nameKey: 'register.rec-enterprise-name', price: '$899', threshold: Infinity },
];

// Se elige el primer plan cuyo threshold >= fleetSize
function calcRecommendedPlan(fleetSize) {
  return PLANS.find(p => fleetSize <= p.threshold) || PLANS[PLANS.length - 1];
}
```

Regla resultante según nº de vehículos/sensores:

| Vehículos | Plan recomendado | Nombre (EN) | Precio |
|-----------|------------------|-------------|--------|
| 1 – 49    | starter    | Preventive Mesh      | $250/mo |
| 50 – 200  | standard   | Operational Control  | $499/mo |
| 201+      | enterprise | Autonomous Ecosystem | $899/mo |

Cuando el usuario abría el modal desde un botón de plan, los sliders se pre-cargaban:
`starter → 25`, `standard → 100`, `enterprise → 250`.

---

## 5. Textos / i18n (EN y ES)

El modal era bilingüe vía `i18n/en.json` y `i18n/es.json` bajo la clave `register`.
Claves relevantes para reusar en el app web:

```
register.title, register.subtitle, register.tag
register.company-name-label / -placeholder
register.admin-name-label / -placeholder
register.admin-email-label / -placeholder
register.submit, register.submitting
register.success-title, register.success-msg, register.success-close
register.err-required, register.err-email, register.err-api, register.err-conflict
register.assess-section, register.info-section
register.fleet-size-label, register.operator-count-label
register.rec-label, register.rec-starter-name, register.rec-standard-name, register.rec-enterprise-name
register.disclaimer
```

(Los valores completos EN/ES están respaldados en `docs/register-company-i18n.json`.)

---

## 6. Accesibilidad (mantener en el app web)

- Overlay con `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al título.
- Cierre por: botón X, click en backdrop, tecla `Escape`.
- `document.body.style.overflow = 'hidden'` mientras está abierto (bloqueo de scroll).
- Errores de campo con `aria-live="polite"`.
- Focus al primer control al abrir.

---

## 7. Checklist de integración en el app web

- [ ] Crear vista/ruta de registro (`/iam/sign-up` o similar).
- [ ] Reusar el `POST /api/v1/subscriptions` con los **3 campos** exactos.
- [ ] Portar validación (campos requeridos + regex de email).
- [ ] Portar manejo de `409` (email duplicado) y error genérico.
- [ ] (Opcional) Portar la calculadora de plan como ayuda visual — recordar que **no** se envía.
- [ ] Reusar los textos i18n de la clave `register`.
- [ ] Mantener accesibilidad (focus trap, Escape, aria-*).
</content>
</invoke>
