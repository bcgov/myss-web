<!-- src/routes/registration/[token]/pin/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { savePin } from '$lib/api/registration';

  const token = page.params.token;
  let pin = $state('');
  let pinConfirm = $state('');
  let loading = $state(false);
  let errorMessage = $state<string | null>(null);

  async function handleSubmit() {
    if (pin !== pinConfirm) {
      errorMessage = 'The PINs do not match.';
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      errorMessage = 'A valid PIN must be 4 digits.';
      return;
    }
    loading = true;
    errorMessage = null;
    try {
      await savePin(token, pin, pinConfirm);
      await goto(`/registration/${token}/bceid`);
    } catch {
      errorMessage = 'Could not save your PIN. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create an Account — Step 4 of 5 — MySelfServe</title>
</svelte:head>

<main>
  <h1>Create an Account</h1>
  <p>Step 4 of 5 — Create your PIN</p>

  <p>
    Your PIN is a 4-digit number used as your electronic signature for
    documents and service requests within MySelfServe.
  </p>

  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <div class="field">
      <label for="pin">PIN (4 digits)</label>
      <input
        id="pin"
        type="password"
        bind:value={pin}
        maxlength="4"
        inputmode="numeric"
        pattern="\d{4}"
        autocomplete="new-password"
        required
      />
    </div>
    <div class="field">
      <label for="pinConfirm">Confirm PIN</label>
      <input
        id="pinConfirm"
        type="password"
        bind:value={pinConfirm}
        maxlength="4"
        inputmode="numeric"
        pattern="\d{4}"
        autocomplete="new-password"
        required
      />
    </div>

    {#if errorMessage}
      <div class="error" role="alert">{errorMessage}</div>
    {/if}

    <button type="submit" disabled={loading}>
      {loading ? 'Saving...' : 'Continue'}
    </button>
  </form>
</main>
