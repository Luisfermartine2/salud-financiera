# Roadmap: Diagnóstico de salud financiera
Fecha: 13 de julio de 2026

## La idea en una frase
Una app web donde una persona natural carga sus deudas, ingresos y gastos, y recibe un diagnóstico de su salud financiera con recomendaciones concretas para empezar a actuar, sin registrarse y sin ayuda de nadie.

## La acción core
Recibir el diagnóstico con recomendaciones. Todo lo demás (cargar datos, calcular indicadores, ordenar deudas) existe para servir ese momento: la persona entiende cómo está y sabe qué hacer primero.

## Fase 1 — Lanzamiento
El camino más corto a que un desconocido reciba un diagnóstico útil. El diagnóstico de esta fase es deliberadamente conservador: lectura de indicadores y orden de pago, sin consejos profundos. La profundidad viene en la Fase 2, cuando la base ya funcione.

| # | Feature | Por qué va primero | Depende de |
|---|---------|--------------------|------------|
| 1 | Carga de deudas (nombre, saldo, cuota mínima, tasa) | Sin datos no hay nada que diagnosticar. Es la puerta de entrada de todo. | — |
| 2 | Ingreso y gasto mensual | El diagnóstico necesita saber cuánto entra y cuánto sobra; con deudas solas no hay foto de salud. | — |
| 3 | Indicadores básicos (nivel de endeudamiento, capacidad de pago, excedente mensual) | Son la materia prima del diagnóstico. Convierten los datos crudos en lectura. | #1, #2 |
| 4 | Diagnóstico con recomendación principal: semáforo de situación + orden de pago por bola de nieve + qué hacer primero, en texto simple | Es la acción core. Sin esto la app es una calculadora, no un diagnóstico. | #3 |

## Fase 2 — Mejora
Con lo aprendido de la Fase 1 (qué entiende la gente, dónde se traba, qué pregunta), se profundiza el diagnóstico. En orden:

1. **Comparador bola de nieve vs. avalancha, con ahorro en intereses de cada método.** Es la mejora que más valor agrega a la recomendación: convierte "paga en este orden" en "este camino te ahorra X en intereses".
2. **Proyección de fecha de libertad de deudas.** Cuántos meses faltan según el plan elegido. Le da al usuario una meta concreta.
3. **Recomendaciones profundas por escenario.** Consejos según el perfil (sobreendeudado, apretado, sano). Va aquí y no en la Fase 1 porque es la parte que toca tu expertise y tu reputación: necesita el cuidado que solo puedes darle cuando el resto ya funciona.
4. **Simulador de abonos extra.** "Si pago 200.000 más al mes, ¿qué cambia?"

## Backlog
Nada de esto bloquea el lanzamiento. Aquí viven las ideas que necesitan datos de la Fase 1 para decidirse y las de vanidad:

- **Exportar el diagnóstico a PDF.** Útil, pero nadie lo pide antes de que exista el diagnóstico.
- **Gráficas de evolución de deudas.** Vanidad en esta etapa: se ve impresionante pero no acerca a nadie a la acción core.
- **Guardar datos entre sesiones / cuentas de usuario.** Es otro proyecto: implica servidor, custodia de datos personales y obligaciones legales. No entra hasta que la herramienta demuestre que la usan.
- **Compartir resultados.** Choca con la naturaleza privada del tema; solo se reconsidera si los usuarios lo piden.
- **Contenido educativo enlazado desde el diagnóstico.** Depende de que exista tu contenido de marca; se decide cuando el embudo de audiencia esté andando.
- **Alertas o recordatorios de pago.** Requiere guardar datos; encadenado a cuentas de usuario.

## Siguiente paso
Convertir la Fase 1 en spec con /crear-specs, usando este roadmap como contexto.
