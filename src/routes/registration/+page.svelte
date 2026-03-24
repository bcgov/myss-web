<!-- src/routes/registration/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { startRegistration } from '$lib/api/registration';
  import type { AccountCreationType } from '$lib/api/registration';

  let accountType = $state<AccountCreationType>('SELF');
  let withHelperAuthorised = $state(false);
  let repFirstName = $state('');
  let repLastName = $state('');
  let repPhone = $state('');
  let loading = $state(false);
  let errorMessage = $state<string | null>(null);

  let showHelperAuth = $derived(accountType === 'WITH_HELPER');
  let showRepFields = $derived(accountType === 'POA' || accountType === 'PARENT');

  async function handleContinue() {
    loading = true;
    errorMessage = null;
    try {
      const { token } = await startRegistration(accountType);
      await goto(`/registration/${token}/step-2`);
    } catch (err) {
      errorMessage = 'Could not start registration. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create an Account — Step 1 of 5 — MySelfServe</title>
</svelte:head>

<main>
  <h1>Create an Account</h1>
  <p>Step 1 of 5 — Account Type</p>

  <form onsubmit={(e) => { e.preventDefault(); handleContinue(); }}>
    <fieldset>
      <legend>Who is this account for?</legend>

      <label>
        <input type="radio" bind:group={accountType} value="SELF" />
        I am making an account for myself (and family if applicable)
      </label>

      <label>
        <input type="radio" bind:group={accountType} value="WITH_HELPER" />
        Someone is helping me make this account
      </label>

      <label>
        <input type="radio" bind:group={accountType} value="POA" />
        I am a legal representative making an account on behalf of someone else
      </label>

      <label>
        <input type="radio" bind:group={accountType} value="PARENT" />
        I am making an account for a minor child
      </label>
    </fieldset>

    {#if showHelperAuth}
      <fieldset>
        <legend>Helper authorisation</legend>
        <p>Do you authorise this person to help you?</p>
        <label>
          <input type="checkbox" bind:checked={withHelperAuthorised} />
          Yes, I authorise information sharing with my helper
        </label>
        {#if withHelperAuthorised}
          <p>
            Please download, complete, and attach the
            <a href="/documents/HR3189.pdf" download>HR3189 Consent to Disclosure of Information</a>
            form. You will be able to attach it in a later step.
          </p>
        {/if}
      </fieldset>
    {/if}

    {#if showRepFields}
      <fieldset>
        <legend>Representative details</legend>
        <div class="field">
          <label for="rep-first">Representative first name</label>
          <input id="rep-first" type="text" bind:value={repFirstName} required />
        </div>
        <div class="field">
          <label for="rep-last">Representative last name</label>
          <input id="rep-last" type="text" bind:value={repLastName} required />
        </div>
        <div class="field">
          <label for="rep-phone">Representative phone number</label>
          <input id="rep-phone" type="tel" bind:value={repPhone} required />
        </div>
      </fieldset>
    {/if}

    {#if errorMessage}
      <div class="error" role="alert">{errorMessage}</div>
    {/if}

    <button type="submit" disabled={loading}>
      {loading ? 'Starting...' : 'Continue'}
    </button>
  </form>
</main>
