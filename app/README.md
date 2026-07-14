# Diagnóstico financiero — Fase 1

App web donde una persona natural en Colombia carga sus deudas, su ingreso y su
gasto mensual, y recibe un diagnóstico de su salud financiera con qué pagar
primero. Sin registro, sin backend y **sin guardar datos**: todo vive en el
dispositivo y se pierde al recargar o cerrar la pestaña.

Implementación fiel del handoff de diseño *Luisfer Martinez · Finance & Tax*
(`../Diseño de plataforma-handoff.zip`), sobre el spec `../spec_1.md` y el
`../roadmap.md`.

## Cómo correrla

No necesita instalación ni build. Con un servidor estático:

```bash
cd "Diagnostico financiero/app"
python3 -m http.server 8765
# abre http://localhost:8765
```

O simplemente abre `index.html` en el navegador (las fuentes Manrope / IBM Plex
Mono se cargan de Google Fonts; sin internet caen a fuentes del sistema).

## Qué hace (alcance Fase 1)

1. **Portada** — explica qué hace y arranca el diagnóstico.
2. **Deudas** — una o varias, con nombre, saldo, cuota mínima y tasa E.A. (%).
   Validación por campo y opción de agregar/quitar.
3. **Ingreso y gasto** — ingreso mensual y gasto de vida (sin cuotas de deuda).
4. **Diagnóstico** — semáforo anclado en la capacidad de pago (cuotas ÷ ingreso),
   indicadores (capacidad de pago, nivel de endeudamiento, excedente mensual) y
   orden de pago por **bola de nieve** (de menor a mayor saldo), con la deuda a
   atacar primero.

### Grado de sobreendeudamiento (Fase 1)

Anclado en la **capacidad de pago** (cuotas ÷ ingreso mensual):

| Capacidad de pago | Estado                          |
|-------------------|---------------------------------|
| ≤ 15 %            | Sano                            |
| > 15 % a 25 %     | Sobreendeudado grado 1          |
| > 25 % a 35 %     | Sobreendeudado grado 2          |
| > 35 %            | Sobreendeudamiento crónico g. 3 |

Cortes en versión *coaching*: alarman un poco antes que el estándar de crédito
(que suele tolerar hasta ~30–40 %) para empujar el cambio de hábito temprano.

El **nivel de endeudamiento** (saldo total ÷ ingreso anual) se muestra como
indicador de apoyo, sin grado: con estos mismos cortes casi cualquier saldo real
caería en grado 3, así que no se usa para clasificar.

El **excedente negativo** (cuotas + gasto > ingreso) es una *alerta de flujo*
independiente: se muestra como bandera roja, pero no cambia el grado, porque
mide falta de flujo de caja, no estructura de deuda.

## Estructura

```
app/
├── index.html          Shell + carga de tokens y app
├── css/
│   ├── tokens/         Design system verbatim (colors, typography, spacing, effects)
│   │                   colors.css añade dark auto por prefers-color-scheme
│   └── app.css         Componentes (Card, Button, Input, Badge, StatCard) + layout
└── js/
    └── app.js          Máquina de estados del wizard, validación y cálculo
```

## No hace (queda para Fase 2 / backlog)

Comparador bola de nieve vs. avalancha, proyección de fecha de libertad de deudas,
recomendaciones por perfil, simulador de abonos extra, exportar a PDF, gráficas,
guardar datos y cuentas de usuario. Ver `../roadmap.md`.
