(() => {
  'use strict';

  const form = document.querySelector('[data-launch-signup]');
  if (!form) return;

  const emailInput = form.querySelector('input[name="email"]');
  const websiteInput = form.querySelector('input[name="website"]');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-launch-status]');
  const product = form.dataset.launchProduct;
  const productName = {
    'now-what': 'Now What?',
    'english-lantern': 'The English Lantern'
  }[product];

  if (!emailInput || !websiteInput || !button || !status || !productName) return;

  const messages = {
    en: {
      submit: 'Get on the list',
      submitting: 'Joining…',
      pending: 'Adding your email to the list…',
      invalidEmail: 'Enter a valid email address.',
      success: "You're on the list. We'll email you when " + productName + ' is available.',
      confirmation: 'Check your inbox and confirm your selections. New subscribers receive a welcome email after confirmation. Already confirmed these selections? You are all set. If the email is missing, check spam or contact hello@canais.tech.',
      error: "We couldn't confirm your signup. Please try again, or email hello@canais.tech.",
      timeout: 'The request took too long. Please try again; your email is still here.',
      rateLimited: 'Please wait a little before trying again. Your email is still here.',
      offline: "You're offline. Reconnect and try again; your email is still here."
    },
    es: {
      submit: 'Apuntarme a la lista',
      submitting: 'Guardando…',
      pending: 'Añadiendo tu correo a la lista…',
      invalidEmail: 'Introduce una dirección de correo válida.',
      success: 'Ya estás en la lista. Te avisaremos por correo cuando ' + productName + ' esté disponible.',
      confirmation: 'Busca en tu correo el enlace para confirmar tus selecciones. Si es tu primera confirmación, recibirás un correo de bienvenida. Si ya confirmaste estas selecciones, no tienes que hacer nada más. Si no ves el mensaje, revisa spam o escribe a hello@canais.tech.',
      error: 'No hemos podido confirmar tu inscripción. Inténtalo de nuevo o escribe a hello@canais.tech.',
      timeout: 'La solicitud tardó demasiado. Inténtalo de nuevo; tu correo sigue aquí.',
      rateLimited: 'Espera un poco antes de volver a intentarlo. Tu correo sigue aquí.',
      offline: 'No tienes conexión. Vuelve a conectarte e inténtalo de nuevo; tu correo sigue aquí.'
    }
  };

  let submitting = false;
  let statusKey = '';

  function render() {
    const content = messages[document.documentElement.lang] || messages.en;
    button.textContent = submitting ? content.submitting : content.submit;
    status.textContent = statusKey ? content[statusKey] : '';
  }

  function showStatus(key, state) {
    statusKey = key;
    status.dataset.state = state;
    render();
  }

  function requestError(response) {
    const error = new Error('Launch signup could not be confirmed.');
    error.status = response.status;
    return error;
  }

  async function readJson(response) {
    try {
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      return null;
    }
  }

  emailInput.addEventListener('input', () => {
    emailInput.removeAttribute('aria-invalid');
    if (!submitting) showStatus('', '');
  });

  // Keep the current form state and entered email when the page language changes.
  document.addEventListener('launch-language-change', render);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;

    emailInput.value = emailInput.value.trim();
    if (!emailInput.checkValidity()) {
      emailInput.setAttribute('aria-invalid', 'true');
      showStatus('invalidEmail', 'error');
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute('aria-invalid');

    if (navigator.onLine === false) {
      showStatus('offline', 'error');
      return;
    }

    submitting = true;
    emailInput.readOnly = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    showStatus('pending', 'pending');

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);

    try {
      // A new token is requested for every attempt, including retries.
      const sessionResponse = await fetch('https://canais.tech/api/launch/session', {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const session = await readJson(sessionResponse);
      if (!sessionResponse.ok || typeof session?.token !== 'string' || !session.token) {
        throw requestError(sessionResponse);
      }

      const signupResponse = await fetch('https://canais.tech/api/launch', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value,
          apps: [product],
          consent: true,
          website: websiteInput.value,
          token: session.token
        }),
        signal: controller.signal
      });
      const payload = await readJson(signupResponse);
      if (!signupResponse.ok || payload?.ok !== true) {
        throw requestError(signupResponse);
      }

      form.reset();
      showStatus(payload.status === 'confirmation_required' ? 'confirmation' : 'success', 'success');
    } catch (error) {
      const key = error.name === 'AbortError'
        ? 'timeout'
        : error.status === 429
          ? 'rateLimited'
          : navigator.onLine === false ? 'offline' : 'error';
      showStatus(key, 'error');
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      emailInput.readOnly = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      render();
    }
  });

  button.disabled = false;
  render();
})();
