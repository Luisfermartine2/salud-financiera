# Diagnóstico financiero

App web donde una persona natural en Colombia carga sus deudas, su ingreso y su
gasto mensual, y recibe un diagnóstico de su salud financiera con qué pagar
primero. Sin registro, sin backend y **sin guardar datos**: todo vive en el
dispositivo y se pierde al recargar o cerrar la pestaña.

## Estructura del repo

```
.
├── app/                          La aplicación (HTML/CSS/JS, sin build)
│   ├── index.html
│   ├── css/                      Tokens del design system + estilos
│   ├── js/app.js                 Wizard, validación y cálculo del diagnóstico
│   └── README.md                 Detalle de la app y cómo correrla
├── spec_1.md                     Spec de la Fase 1 (desde la óptica del usuario)
├── roadmap.md                    Roadmap (Fase 1, Fase 2, backlog)
└── Diseño de plataforma-handoff.zip   Handoff de diseño (Claude Design)
```

## Cómo correrla

No necesita instalación ni build:

```bash
cd app
python3 -m http.server 8765
# abre http://localhost:8765
```

O abre `app/index.html` directamente en el navegador.

## Estado

- **Fase 1 — implementada.** Carga de deudas, ingreso/gasto, indicadores y
  diagnóstico con grado de sobreendeudamiento + orden de pago por bola de nieve.
- **Fase 2 — pendiente.** Comparador bola de nieve vs. avalancha, proyección de
  fecha de libertad de deudas, recomendaciones por perfil, simulador de abonos.
  Ver [`roadmap.md`](roadmap.md).

Diseño e identidad: *Luisfer Martinez · Finance & Tax* (navy/gold, Manrope +
IBM Plex Mono). Detalle del diagnóstico y de la escala de grados en
[`app/README.md`](app/README.md).
