<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import {
    LIMITS,
    TRAP_FIELD,
    type RequestErrors,
    type RequestValues
  } from '$lib/data/request-fields';

  interface Props {
    /**
     * The action's reply, handed down by the page. Null until someone has
     * submitted something.
     */
    result?: {
      sent?: boolean;
      values?: Partial<RequestValues>;
      errors?: RequestErrors;
    } | null;
  }

  let { result = null }: Props = $props();

  /**
   * Set while the request is in flight. The page still works with JavaScript
   * off: `use:enhance` only intercepts the post when it is there — without it
   * the browser submits the form itself and the same action answers with a
   * full page render.
   */
  let sending = $state(false);

  /** Opens the form again after a confirmation, for a second request. */
  let writingAnother = $state(false);

  const values = $derived(result?.values ?? {});
  const errors = $derived(result?.errors ?? {});
  const sent = $derived(result?.sent === true && !writingAnother);

  const submit: SubmitFunction = () => {
    sending = true;

    return async ({ update }) => {
      // `update()` clears the fields on success and leaves them filled on
      // failure — nobody retypes a paragraph because of a missing @.
      await update();
      writingAnother = false;
      sending = false;
    };
  };
</script>

{#if sent}
  <!-- The confirmation replaces the form rather than sitting above it: a form
       still standing under "we have your request" reads as a form that did not
       send. `role="status"` announces it without stealing focus. -->
  <div class="membership-form__receipt" role="status">
    <p class="membership-form__receipt-line">Your request is with a guardian.</p>
    <p>
      We answer every request, including the ones we have to refuse. If nothing arrives within a few
      days, check the address you gave us and write again.
    </p>
    <button type="button" class="text-link" onclick={() => (writingAnother = true)}>
      Send another request
    </button>
  </div>
{:else}
  <form class="membership-form" method="POST" aria-label="Request form" use:enhance={submit}>
    {#if errors.form}
      <p class="membership-form__alert" role="alert">{errors.form}</p>
    {/if}

    <!-- Label, control and message are siblings rather than nested: a label
         wrapping its own error message reads the error out as part of the
         field's name. -->
    <div class="membership-form__field">
      <label for="request-name">Name</label>
      <input
        id="request-name"
        name="name"
        autocomplete="name"
        maxlength={LIMITS.name}
        required
        aria-invalid={errors.name ? 'true' : undefined}
        aria-describedby={errors.name ? 'request-name-error' : undefined}
        value={values.name ?? ''}
      />
      {#if errors.name}
        <p class="membership-form__error" id="request-name-error">{errors.name}</p>
      {/if}
    </div>

    <div class="membership-form__field">
      <label for="request-email">Email</label>
      <input
        id="request-email"
        name="email"
        type="email"
        autocomplete="email"
        maxlength={LIMITS.email}
        required
        aria-invalid={errors.email ? 'true' : undefined}
        aria-describedby={errors.email ? 'request-email-error' : undefined}
        value={values.email ?? ''}
      />
      {#if errors.email}
        <p class="membership-form__error" id="request-email-error">{errors.email}</p>
      {/if}
    </div>

    <div class="membership-form__field">
      <label for="request-phone">
        Phone <span class="membership-form__optional">optional</span>
      </label>
      <input
        id="request-phone"
        name="phone"
        type="tel"
        autocomplete="tel"
        maxlength={LIMITS.phone}
        aria-invalid={errors.phone ? 'true' : undefined}
        aria-describedby={errors.phone ? 'request-phone-error' : undefined}
        value={values.phone ?? ''}
      />
      {#if errors.phone}
        <p class="membership-form__error" id="request-phone-error">{errors.phone}</p>
      {/if}
    </div>

    <div class="membership-form__field">
      <label for="request-business">
        Business or institution <span class="membership-form__optional">optional</span>
      </label>
      <input
        id="request-business"
        name="business"
        autocomplete="organization"
        maxlength={LIMITS.business}
        aria-invalid={errors.business ? 'true' : undefined}
        aria-describedby={errors.business ? 'request-business-error' : undefined}
        value={values.business ?? ''}
      />
      {#if errors.business}
        <p class="membership-form__error" id="request-business-error">{errors.business}</p>
      {/if}
    </div>

    <div class="membership-form__field">
      <label for="request-body">Request</label>
      <textarea
        id="request-body"
        name="request"
        rows="5"
        maxlength={LIMITS.request}
        required
        aria-invalid={errors.request ? 'true' : undefined}
        aria-describedby={errors.request ? 'request-body-error' : 'request-body-hint'}
        >{values.request ?? ''}</textarea
      >
      {#if errors.request}
        <p class="membership-form__error" id="request-body-error">{errors.request}</p>
      {:else}
        <p class="membership-form__hint" id="request-body-hint">
          Where the tea will be poured, roughly how much you go through, and the packaging you need.
        </p>
      {/if}
    </div>

    <!-- The trap. Out of sight and out of the tab order, and hidden from
         assistive technology: only a script filling every input reaches it. -->
    <div class="membership-form__trap" aria-hidden="true">
      <label for="request-{TRAP_FIELD}">Website</label>
      <input id="request-{TRAP_FIELD}" name={TRAP_FIELD} tabindex="-1" autocomplete="off" />
    </div>

    <button type="submit" disabled={sending}>
      {sending ? 'Sending…' : 'Send request'}
    </button>

    <p class="membership-form__note">
      We use what you send only to answer you. <a href="/legacy#privacy">Privacy</a>
    </p>
  </form>
{/if}
