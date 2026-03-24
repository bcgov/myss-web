<!-- src/routes/registration/[token]/step-2/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { savePersonalInfo } from '$lib/api/registration';

  const token = page.params.token;

  let firstName = $state('');
  let middleName = $state('');
  let lastName = $state('');
  let email = $state('');
  let emailConfirm = $state('');
  let sin = $state('');
  let phn = $state('');
  let dateOfBirth = $state('');
  let gender = $state('');
  let phoneNumber = $state('');
  let phoneType = $state('CELL');
  let hasOpenCase = $state(false);
  let loading = $state(false);
  let errorMessage = $state<string | null>(null);

  async function handleContinue() {
    loading = true;
    errorMessage = null;
    try {
      await savePersonalInfo(token, {
        first_name: firstName,
        middle_name: middleName || undefined,
        last_name: lastName,
        email,
        email_confirm: emailConfirm,
        sin,
        phn: phn || undefined,
        date_of_birth: dateOfBirth,
        gender,
        phone_number: phoneNumber,
        phone_type: phoneType,
        has_open_case: hasOpenCase,
      });
      await goto(`/registration/${token}/step-3`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('422')) {
        errorMessage = 'Please check the highlighted fields and try again.';
      } else {
        errorMessage = 'An error occurred. Please try again.';
      }
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create an Account — Step 2 of 5 — MySelfServe</title>
</svelte:head>

<main>
  <h1>Create an Account</h1>
  <p>Step 2 of 5 — Personal Information</p>

  <form onsubmit={(e) => { e.preventDefault(); handleContinue(); }}>
    <fieldset>
      <legend>Your information</legend>

      <div class="field">
        <label for="firstName">First name <span aria-hidden="true">*</span></label>
        <input id="firstName" type="text" bind:value={firstName} required maxlength="50" />
      </div>
      <div class="field">
        <label for="middleName">Middle name (optional)</label>
        <input id="middleName" type="text" bind:value={middleName} maxlength="50" />
      </div>
      <div class="field">
        <label for="lastName">Last name <span aria-hidden="true">*</span></label>
        <input id="lastName" type="text" bind:value={lastName} required maxlength="50" />
      </div>
      <div class="field">
        <label for="email">Email address <span aria-hidden="true">*</span></label>
        <input id="email" type="email" bind:value={email} required maxlength="250" />
      </div>
      <div class="field">
        <label for="emailConfirm">Confirm email address <span aria-hidden="true">*</span></label>
        <input id="emailConfirm" type="email" bind:value={emailConfirm} required maxlength="250" />
      </div>
      <div class="field">
        <label for="sin">Social Insurance Number (SIN) <span aria-hidden="true">*</span></label>
        <input id="sin" type="text" bind:value={sin} required maxlength="11" inputmode="numeric" />
      </div>
      <div class="field">
        <label for="phn">Personal Health Number (PHN) (optional)</label>
        <input id="phn" type="text" bind:value={phn} maxlength="10" inputmode="numeric" />
      </div>
      <div class="field">
        <label for="dob">Date of birth <span aria-hidden="true">*</span></label>
        <input id="dob" type="date" bind:value={dateOfBirth} required />
      </div>
      <div class="field">
        <label for="gender">Gender <span aria-hidden="true">*</span></label>
        <select id="gender" bind:value={gender} required>
          <option value="">Select...</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="U">Unknown / prefer not to say</option>
        </select>
      </div>
      <div class="field">
        <label for="phone">Phone number <span aria-hidden="true">*</span></label>
        <input id="phone" type="tel" bind:value={phoneNumber} required />
      </div>
      <div class="field">
        <label for="phoneType">Phone type <span aria-hidden="true">*</span></label>
        <select id="phoneType" bind:value={phoneType} required>
          <option value="CELL">Cell</option>
          <option value="HOME">Home</option>
          <option value="WORK">Work</option>
          <option value="MESSAGE">Message</option>
        </select>
      </div>

      <div class="field">
        <label>
          <input type="checkbox" bind:checked={hasOpenCase} />
          I am currently receiving assistance from the Ministry
        </label>
      </div>
    </fieldset>

    {#if errorMessage}
      <div class="error" role="alert">{errorMessage}</div>
    {/if}

    <button type="submit" disabled={loading}>
      {loading ? 'Saving...' : 'Continue'}
    </button>
  </form>
</main>
