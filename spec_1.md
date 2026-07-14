# Spec: Diagnóstico de salud financiera (Fase 1)
Fecha: 14 de julio de 2026

## Overview
App web donde una persona natural en Colombia carga sus deudas, su ingreso y su gasto mensual, y recibe un diagnóstico de su salud financiera con la primera acción a tomar. Funciona sin registro y sin ayuda de nadie: entra, llena tres cosas, entiende cómo está y sabe qué pagar primero. Esta v1 entrega un diagnóstico conservador (lectura de indicadores y orden de pago), sin consejos profundos, que llegan en la v2.

## Usuarios objetivo
Cualquier persona natural que quiere una foto rápida de su salud financiera, esté endeudada o no. Hoy lo resuelve a ojo, en una hoja de Excel propia, o no lo resuelve. Le falta una lectura clara de si sus deudas están en zona sana y no sabe cuál pagar primero. Todo trabaja en pesos colombianos (COP).

## Alcance
### La v1 SÍ hace
Cuatro cosas, en el orden en que las usa la persona:
- **Carga de deudas.** El usuario agrega una o varias deudas. Por cada una registra nombre, saldo, cuota mínima mensual y tasa de interés. La tasa se pide desde ya porque la v2 la necesita; en la v1 el orden de pago va por saldo, no por tasa.
- **Carga de ingreso y gasto mensual.** Registra su ingreso mensual y su gasto de vida mensual. El gasto no incluye las cuotas de las deudas, que ya quedaron en el paso anterior. La pantalla lo dice explícito para evitar contar la deuda dos veces.
- **Cálculo de indicadores.** Con esos datos, la app obtiene la capacidad de pago (cuotas ÷ ingreso), el nivel de endeudamiento y el excedente mensual (ingreso menos gasto de vida menos cuotas).
- **Diagnóstico con recomendación principal.** Semáforo de situación anclado en la capacidad de pago, orden de pago por bola de nieve (de menor a mayor saldo) y qué hacer primero, en texto simple.

### La v1 NO hace
Esta lista es la pared de carga del proyecto. Nada de esto entra en la Fase 1:
- No guarda datos entre sesiones ni maneja cuentas de usuario. Si la persona recarga o cierra la ventana, los datos se pierden.
- No compara bola de nieve contra avalancha ni calcula el ahorro en intereses (v2).
- No proyecta la fecha de libertad de deudas (v2).
- No da recomendaciones profundas por perfil (v2).
- No simula abonos extra (v2).
- No exporta a PDF, no dibuja gráficas de evolución, no comparte resultados y no envía alertas de pago (backlog).

## Comportamiento esperado
Paso a paso desde los ojos del usuario:
1. Entra a la app. Ve en una línea qué hace y un botón para empezar. No hay registro ni login.
2. Carga sus deudas. Agrega la primera con nombre, saldo, cuota mínima y tasa. Puede sumar más o seguir con una sola.
3. Carga ingreso y gasto. Escribe su ingreso mensual y su gasto de vida mensual. La pantalla le recuerda no incluir las cuotas de deuda en el gasto.
4. Pide el diagnóstico con un clic.
5. Ve el resultado en una sola pantalla: el semáforo (verde, amarillo o rojo) con una frase que explica su situación, el orden en que conviene pagar las deudas y cuál atacar primero. Todo en lenguaje simple.
6. Puede volver atrás y ajustar cualquier dato para ver cómo cambia el diagnóstico.

Regla del semáforo: se ancla en la capacidad de pago (cuotas ÷ ingreso). Los cortes de verde, amarillo y rojo quedan a validar por el experto antes de construir. Verificar fuente del estándar que se adopte (el rango bancario común ronda 30% a 40%, pendiente de confirmar).

## Errores y seguridad
Qué puede salir mal y cómo se maneja:
- **Sin deudas cargadas.** No hay nada que diagnosticar. La app pide al menos una deuda antes de dejar avanzar.
- **Ingreso vacío o en cero.** Sin ingreso no se puede calcular la capacidad de pago. La app lo señala y pide el dato.
- **Cuotas mayores al ingreso.** El excedente da negativo. El diagnóstico lo muestra como situación de riesgo y la app sigue funcionando normal.
- **Entradas negativas o no numéricas** en saldo, cuota, tasa, ingreso o gasto. La app las rechaza y explica el formato esperado.
- **Tasa de interés.** Definir antes de construir si se captura como tasa mensual o efectiva anual, y dejarlo claro en la pantalla para que el dato sea comparable.
- **Privacidad.** No se pide nombre real, correo ni número de identificación. Los datos financieros no se guardan ni salen del dispositivo. Al cerrar la sesión, desaparecen.

## Éxito
La v1 funciona si pasan las dos cosas a la vez:
- La persona termina la carga y llega al diagnóstico sin abandonar (completación).
- La persona sale sabiendo su semáforo y cuál deuda pagar primero (comprensión de la acción).

## V2 (opcional)
Todo lo que se recortó de la v1 vive aquí:
- Comparador bola de nieve contra avalancha, con el ahorro en intereses de cada método.
- Proyección de la fecha de libertad de deudas según el plan elegido.
- Recomendaciones profundas por escenario (sobreendeudado, apretado, sano).
- Simulador de abonos extra ("si pago 200.000 más al mes, ¿qué cambia?").
- Más lejos, en backlog: exportar a PDF, gráficas de evolución de deudas, guardar datos y cuentas de usuario, compartir resultados, contenido educativo enlazado desde el diagnóstico y alertas o recordatorios de pago.
