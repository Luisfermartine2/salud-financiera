/* =========================================================================
   Diagnóstico financiero (Fase 1) — lógica de la aplicación
   Reimplementación fiel del prototipo de diseño (Diagnostico Financiero.dc.html).
   App 100% cliente: los datos nunca salen del dispositivo y no se persisten.
   ========================================================================= */

(() => {
  'use strict';

  /* ---- Formato y parseo (idénticos al prototipo) --------------------- */

  const fmtCOP = (n) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Math.round(n || 0));

  // Tasa: acepta decimales y signo; se usa para validar el número tal cual.
  const toNum = (s) => {
    const n = parseFloat(String(s || '').replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  // Montos COP: solo dígitos.
  const parseCOP = (s) => {
    const n = parseInt(String(s || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? 0 : n;
  };

  // Formatea un monto mientras se escribe: separadores de miles es-CO.
  const formatCOPInput = (s) => {
    const n = parseCOP(s);
    return n ? n.toLocaleString('es-CO') : '';
  };

  /* ---- Estado -------------------------------------------------------- */

  const initialState = () => ({
    step: 0,
    debts: [{ id: 1, name: '', saldo: '', cuota: '', tasa: '' }],
    nextId: 2,
    ingreso: '',
    gasto: '',
    step1Error: '',
    errIngreso: '',
    errGasto: '',
  });

  let state = initialState();

  const setState = (patch) => {
    state = { ...state, ...patch };
    render();
  };

  /* ---- Acciones sobre deudas ----------------------------------------- */

  const addDebt = () =>
    setState({
      debts: [
        ...state.debts,
        { id: state.nextId, name: '', saldo: '', cuota: '', tasa: '' },
      ],
      nextId: state.nextId + 1,
    });

  const removeDebt = (id) =>
    setState({ debts: state.debts.filter((d) => d.id !== id) });

  const updateDebt = (id, field, value) =>
    setState({
      debts: state.debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    });

  /* ---- Navegación entre pasos ---------------------------------------- */

  const goStart = () => setState({ step: 1 });
  const goBack = () => setState({ step: Math.max(0, state.step - 1) });

  const goStep2 = () => {
    const { debts } = state;
    if (debts.length === 0) {
      setState({ step1Error: 'Agrega al menos una deuda antes de continuar.' });
      return;
    }
    let ok = true;
    const cleaned = debts.map((d) => {
      const saldo = parseCOP(d.saldo);
      const cuota = parseCOP(d.cuota);
      const tasa = toNum(d.tasa);
      let errSaldo = '';
      let errCuota = '';
      let errTasa = '';
      if (!d.saldo || saldo <= 0) {
        errSaldo = 'Ingresa un saldo mayor a cero.';
        ok = false;
      }
      if (!d.cuota || cuota <= 0) {
        errCuota = 'Ingresa una cuota mayor a cero.';
        ok = false;
      }
      if (d.tasa && tasa < 0) {
        errTasa = 'La tasa no puede ser negativa.';
        ok = false;
      }
      return { ...d, errSaldo, errCuota, errTasa };
    });
    setState({
      debts: cleaned,
      step1Error: ok ? '' : 'Revisa los datos marcados en rojo.',
    });
    if (ok) setState({ step: 2 });
  };

  const goDiagnostico = () => {
    const ing = parseCOP(state.ingreso);
    const gas = parseCOP(state.gasto);
    let errIngreso = '';
    let errGasto = '';
    if (!state.ingreso || ing <= 0)
      errIngreso = 'Registra tu ingreso mensual para calcular el diagnóstico.';
    if (state.gasto && gas < 0) errGasto = 'El gasto no puede ser negativo.';
    setState({ errIngreso, errGasto });
    if (!errIngreso && !errGasto) setState({ step: 3 });
  };

  const reset = () => setState(initialState());

  /* ---- Cálculo del diagnóstico --------------------------------------- */

  const computeDiagnostico = () => {
    const { debts, ingreso, gasto } = state;

    const totalSaldo = debts.reduce((a, d) => a + parseCOP(d.saldo), 0);
    const totalCuota = debts.reduce((a, d) => a + parseCOP(d.cuota), 0);
    const ing = parseCOP(ingreso);
    const gas = parseCOP(gasto);

    const capacidadPago = ing > 0 ? totalCuota / ing : 0;
    const nivelEndeudamiento = ing > 0 ? totalSaldo / (ing * 12) : 0;
    const excedente = ing - gas - totalCuota;

    // Grado de sobreendeudamiento, anclado en la capacidad de pago (cuotas ÷ ingreso).
    // Cortes (versión coaching): ≤15% sano · >15–25% grado 1 · >25–35% grado 2 · >35% crónico grado 3.
    // El nivel de endeudamiento se reporta como indicador de apoyo, sin grado.
    let grado;
    let badgeClass;
    let badgeLabel;
    let semaphorePhrase;
    if (capacidadPago <= 0.15) {
      grado = 0;
      badgeClass = 'sano';
      badgeLabel = 'Sano';
      semaphorePhrase =
        'Tu capacidad de pago está en zona sana: tus cuotas pesan poco sobre tu ingreso.';
    } else if (capacidadPago <= 0.25) {
      grado = 1;
      badgeClass = 'g1';
      badgeLabel = 'Grado 1';
      semaphorePhrase =
        'Sobreendeudado grado 1: tus cuotas empiezan a pesar sobre tu ingreso, pero aún hay margen para actuar.';
    } else if (capacidadPago <= 0.35) {
      grado = 2;
      badgeClass = 'g2';
      badgeLabel = 'Grado 2';
      semaphorePhrase =
        'Sobreendeudado grado 2: tus cuotas ya toman una parte alta de tu ingreso. Conviene reorganizar antes de que crezca.';
    } else {
      grado = 3;
      badgeClass = 'g3';
      badgeLabel = 'Grado 3 · crónico';
      semaphorePhrase =
        'Sobreendeudamiento crónico (grado 3): tus cuotas superan el tercio de tu ingreso. Es momento de actuar.';
    }

    // El excedente negativo es una alerta de flujo aparte: no cambia el grado.
    const excedenteNegativo = excedente < 0;

    // Bola de nieve: menor a mayor saldo. Conserva el número original de deuda.
    const withIndex = debts.map((d, i) => ({ ...d, origIndex: i }));
    const ordered = withIndex
      .slice()
      .sort((a, b) => parseCOP(a.saldo) - parseCOP(b.saldo));

    const ordenDePago = ordered.map((d, i) => ({
      rank: i + 1,
      name: d.name || 'Deuda ' + (d.origIndex + 1),
      saldoFmt: fmtCOP(parseCOP(d.saldo)),
      isFirst: i === 0,
    }));

    let primeraAccion = '';
    if (ordered.length > 0) {
      const first = ordered[0];
      primeraAccion =
        'Paga el mínimo de todas tus deudas y destina cualquier excedente a "' +
        (first.name || 'tu deuda de menor saldo') +
        '", tu deuda con el saldo más bajo.';
    }

    return {
      capacidadPagoFmt: (capacidadPago * 100).toFixed(0) + '%',
      nivelEndeudamientoFmt: (nivelEndeudamiento * 100).toFixed(0) + '%',
      excedenteFmt: fmtCOP(excedente),
      excedenteTone: excedente < 0 ? 'loss' : 'gain',
      excedenteSub: 'Ingreso − gasto − cuotas',
      grado,
      badgeClass,
      badgeLabel,
      semaphorePhrase,
      excedenteNegativo,
      primeraAccion,
      ordenDePago,
    };
  };

  /* ---- Helpers de DOM ------------------------------------------------ */

  const h = (tag, attrs, children) => {
    const el = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function')
          el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v);
      });
    }
    (Array.isArray(children) ? children : children != null ? [children] : [])
      .forEach((c) => {
        if (c == null || c === false) return;
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    return el;
  };

  const badge = (tone, text) =>
    h('span', { class: 'badge badge--' + tone }, text);

  // Input con etiqueta (equivalente a Input.jsx). Preserva foco/caret al re-render.
  const field = ({ label, mono, align, placeholder, value, onInput, error, id }) => {
    const input = h('input', {
      class:
        'field__input' +
        (mono ? ' is-mono' : '') +
        (align === 'right' ? ' is-right' : '') +
        (error ? ' has-error' : ''),
      type: 'text',
      inputmode: mono ? 'numeric' : null,
      placeholder: placeholder || '',
      value: value || '',
      'data-field-id': id || null,
    });
    input.addEventListener('input', onInput);
    return h('label', { class: 'field' }, [
      label ? h('span', { class: 'field__label' }, label) : null,
      input,
      error ? h('div', { class: 'field__error' }, error) : null,
    ]);
  };

  const button = (variant, text, onClick, opts = {}) =>
    h(
      'button',
      {
        class:
          'btn btn--' + variant + (opts.size ? ' btn--' + opts.size : ''),
        type: 'button',
        onClick,
      },
      text
    );

  /* ---- Preservación de foco entre renders ---------------------------- */

  const captureFocus = () => {
    const a = document.activeElement;
    if (a && a.dataset && a.dataset.fieldId) {
      return {
        id: a.dataset.fieldId,
        start: a.selectionStart,
        end: a.selectionEnd,
      };
    }
    return null;
  };

  const restoreFocus = (snap) => {
    if (!snap) return;
    const el = document.querySelector('[data-field-id="' + snap.id + '"]');
    if (el) {
      el.focus();
      try {
        el.setSelectionRange(snap.start, snap.end);
      } catch (_) {
        /* inputs no-text no soportan setSelectionRange */
      }
    }
  };

  /* ---- Vistas por paso ----------------------------------------------- */

  const viewStep0 = () =>
    h('div', { class: 'step' }, [
      h('div', { class: 'card card--hero' }, [
        h('div', { class: 'hero-body' }, [
          h('div', { class: 'eyebrow' }, 'Salud financiera'),
          h(
            'div',
            { class: 'hero-title' },
            'Carga tus deudas, tu ingreso y tu gasto, y recibe un diagnóstico de tu situación con qué pagar primero.'
          ),
          h(
            'div',
            { class: 'hero-sub' },
            'Sin registro. Nadie más ve tus datos: no se guardan ni salen de este dispositivo. Toma menos de dos minutos.'
          ),
          h('div', { style: 'margin-top:8px;' }, [
            button('accent', 'Empezar diagnóstico', goStart, { size: 'lg' }),
          ]),
        ]),
      ]),
    ]);

  const viewStep1 = () => {
    const debtBlocks = state.debts.map((d, i) =>
      h('div', { class: 'debt' }, [
        h('div', { class: 'debt__head' }, [
          h('div', { class: 'debt__label' }, 'Deuda ' + (i + 1)),
          state.debts.length > 1
            ? h(
                'button',
                {
                  class: 'debt__remove',
                  type: 'button',
                  onClick: () => removeDebt(d.id),
                },
                'Quitar'
              )
            : null,
        ]),
        h('div', { class: 'debt__grid' }, [
          h('div', { class: 'col-full' }, [
            field({
              id: 'debt-' + d.id + '-name',
              label: 'Nombre de la deuda',
              placeholder: 'Ej: Tarjeta Falabella',
              value: d.name,
              onInput: (e) => updateDebt(d.id, 'name', e.target.value),
            }),
          ]),
          h('div', {}, [
            field({
              id: 'debt-' + d.id + '-saldo',
              label: 'Saldo actual (COP)',
              mono: true,
              align: 'right',
              placeholder: '0',
              value: d.saldo,
              error: d.errSaldo,
              onInput: (e) =>
                updateDebt(d.id, 'saldo', formatCOPInput(e.target.value)),
            }),
          ]),
          h('div', {}, [
            field({
              id: 'debt-' + d.id + '-cuota',
              label: 'Cuota mínima mensual (COP)',
              mono: true,
              align: 'right',
              placeholder: '0',
              value: d.cuota,
              error: d.errCuota,
              onInput: (e) =>
                updateDebt(d.id, 'cuota', formatCOPInput(e.target.value)),
            }),
          ]),
          h('div', { class: 'col-tasa' }, [
            field({
              id: 'debt-' + d.id + '-tasa',
              label: 'Tasa efectiva anual, E.A. (%)',
              mono: true,
              align: 'right',
              placeholder: '0',
              value: d.tasa,
              error: d.errTasa,
              onInput: (e) => updateDebt(d.id, 'tasa', e.target.value),
            }),
          ]),
        ]),
      ])
    );

    return h('div', { class: 'step' }, [
      h('div', { class: 'card' }, [
        h('div', { class: 'form-body' }, [
          h('div', {}, [
            h('div', { class: 'section-title' }, 'Tus deudas'),
            h(
              'div',
              { class: 'section-help' },
              'Agrega cada deuda con su saldo, cuota mínima mensual y tasa. Necesitas al menos una.'
            ),
          ]),
          h('div', { class: 'debts' }, debtBlocks),
          h(
            'button',
            { class: 'add-debt', type: 'button', onClick: addDebt },
            '+ Agregar otra deuda'
          ),
          state.step1Error
            ? h('div', { class: 'form-error' }, state.step1Error)
            : null,
          h('div', { class: 'actions' }, [
            button('ghost', 'Atrás', goBack),
            button('primary', 'Continuar', goStep2),
          ]),
        ]),
      ]),
    ]);
  };

  const viewStep2 = () =>
    h('div', { class: 'step' }, [
      h('div', { class: 'card' }, [
        h('div', { class: 'form-body' }, [
          h('div', {}, [
            h('div', { class: 'section-title' }, 'Ingreso y gasto mensual'),
            h(
              'div',
              { class: 'section-help' },
              'El gasto de vida no incluye las cuotas de tus deudas: esas ya quedaron registradas en el paso anterior.'
            ),
          ]),
          h('div', {}, [
            field({
              id: 'ingreso',
              label: 'Ingreso mensual (COP)',
              mono: true,
              align: 'right',
              placeholder: '0',
              value: state.ingreso,
              error: state.errIngreso,
              onInput: (e) =>
                setState({ ingreso: formatCOPInput(e.target.value) }),
            }),
          ]),
          h('div', {}, [
            field({
              id: 'gasto',
              label: 'Gasto de vida mensual, sin cuotas de deuda (COP)',
              mono: true,
              align: 'right',
              placeholder: '0',
              value: state.gasto,
              error: state.errGasto,
              onInput: (e) =>
                setState({ gasto: formatCOPInput(e.target.value) }),
            }),
          ]),
          h('div', { class: 'actions' }, [
            button('ghost', 'Atrás', goBack),
            button('primary', 'Ver diagnóstico', goDiagnostico),
          ]),
        ]),
      ]),
    ]);

  const viewStep3 = () => {
    const d = computeDiagnostico();

    const ordenRows = d.ordenDePago.map((row) =>
      h(
        'div',
        { class: 'orden-row' + (row.isFirst ? ' is-first' : '') },
        [
          h('div', { class: 'orden-row__rank' }, String(row.rank)),
          h('div', { class: 'orden-row__main' }, [
            h('div', { class: 'orden-row__name' }, row.name),
            row.isFirst
              ? h('div', { class: 'orden-row__flag' }, 'Ataca esta primero')
              : null,
          ]),
          h('div', { class: 'orden-row__saldo' }, row.saldoFmt),
        ]
      )
    );

    const statCard = (label, value, sub, tone) =>
      h('div', { class: 'statcard' }, [
        h('div', { class: 'statcard__label' }, label),
        h('div', { class: 'statcard__value' }, value),
        h(
          'div',
          { class: 'statcard__sub' + (tone ? ' tone-' + tone : '') },
          sub
        ),
      ]);

    return h('div', { class: 'step' }, [
      h('div', { class: 'diag' }, [
        // Hero: grado de sobreendeudamiento + frase + primera acción
        h('div', { class: 'card card--hero' }, [
          h('div', { class: 'diag-hero-body' }, [
            h('div', { class: 'diag-hero-top' }, [
              badge(d.badgeClass, d.badgeLabel),
              h(
                'div',
                { class: 'diag-capacidad' },
                'Capacidad de pago: ' + d.capacidadPagoFmt
              ),
            ]),
            h('div', { class: 'diag-phrase' }, d.semaphorePhrase),
            h('div', { class: 'diag-accion' }, d.primeraAccion),
          ]),
        ]),

        // Alerta de flujo: aparte del grado, cuando los compromisos superan el ingreso
        d.excedenteNegativo
          ? h('div', { class: 'flow-alert' }, [
              h('div', {}, [
                h('div', { class: 'flow-alert__title' }, 'Alerta de flujo'),
                h(
                  'div',
                  { class: 'flow-alert__text' },
                  'Tus cuotas y tu gasto de vida superan tu ingreso este mes. Al margen de tu grado de deuda, hoy no te alcanza para cubrir tus compromisos: cada mes tendrías que endeudarte más o atrasarte. Reducir el gasto o aumentar el ingreso es tan urgente como reorganizar la deuda.'
                ),
              ]),
            ])
          : null,

        // Indicadores
        h('div', { class: 'stats-grid' }, [
          statCard('Capacidad de pago', d.capacidadPagoFmt, 'Cuotas ÷ ingreso'),
          statCard(
            'Nivel de endeudamiento',
            d.nivelEndeudamientoFmt,
            'Saldo total ÷ ingreso anual'
          ),
          statCard(
            'Excedente mensual',
            d.excedenteFmt,
            d.excedenteSub,
            d.excedenteTone
          ),
        ]),

        // Orden de pago
        h('div', { class: 'card' }, [
          h('div', { class: 'orden' }, [
            h('div', {}, [
              h('div', { class: 'orden__title' }, 'Orden de pago — bola de nieve'),
              h(
                'div',
                { class: 'orden__help' },
                'Sigue pagando el mínimo de todas. Con lo que sobre, ataca primero la de menor saldo.'
              ),
            ]),
            h('div', { class: 'orden__list' }, ordenRows),
          ]),
        ]),

        h(
          'div',
          { class: 'disclaimer' },
          'Este diagnóstico es una lectura inicial de tus indicadores, no un consejo financiero personalizado. Tus datos no se guardan: si recargas o cierras esta pestaña, se pierden.'
        ),

        h('div', { class: 'actions' }, [
          button('ghost', 'Ajustar datos', goBack),
          button('secondary', 'Empezar de nuevo', reset),
        ]),
      ]),
    ]);
  };

  /* ---- Tema (opcional, soportado por el design system) --------------- */

  const currentTheme = () => {
    const explicit = document.documentElement.getAttribute('data-theme');
    if (explicit) return explicit;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const toggleTheme = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    render();
  };

  /* ---- Render principal ---------------------------------------------- */

  const stepNumber = () => (state.step === 0 ? 1 : state.step);

  const render = () => {
    const focusSnap = captureFocus();
    const root = document.getElementById('root');
    root.innerHTML = '';

    // Header con progreso
    const activeCount = state.step === 0 ? 0 : state.step - 1;
    const dots = [0, 1, 2, 3].map((i) =>
      h('div', {
        class: 'progress__dot' + (i <= activeCount ? ' is-active' : ''),
      })
    );

    const header = h('div', { class: 'header' }, [
      h('div', { class: 'header__row' }, [
        h('div', { class: 'header__brand' }, 'Diagnóstico financiero'),
        h('div', { class: 'header__step' }, 'Paso ' + stepNumber() + ' de 4'),
      ]),
      h('div', { class: 'progress' }, dots),
    ]);

    const shell = h('div', { class: 'shell' }, [
      state.step === 0
        ? viewStep0()
        : state.step === 1
        ? viewStep1()
        : state.step === 2
        ? viewStep2()
        : viewStep3(),
    ]);

    root.appendChild(header);
    root.appendChild(shell);

    // Botón de tema flotante, discreto
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = currentTheme() === 'dark' ? 'Tema claro' : 'Tema oscuro';
    }

    restoreFocus(focusSnap);
  };

  /* ---- Arranque ------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    render();
  });
})();
