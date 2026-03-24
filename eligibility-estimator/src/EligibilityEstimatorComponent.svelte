<!-- src/EligibilityEstimatorComponent.svelte -->
<!--
  Inner component — no <svelte:options customElement> here.
  Used directly by unit tests (jsdom) and wrapped by EligibilityEstimator.svelte
  (the Custom Element shell) for production builds.
-->
<script lang="ts">
  import { calculateEligibility } from './api/eligibility';
  import type { EligibilityRequest, EligibilityResponse } from './api/eligibility';

  // Props become HTML attributes on the custom element.
  // `api-url` attribute → apiUrl prop (Svelte converts kebab-case automatically).
  // Default: VITE_API_URL baked in at build time; override at runtime via attribute.
  export let apiUrl: string = import.meta.env.VITE_API_URL || '/api';

  // Optional: if set, shows a "Create an account to apply" link in the eligible result.
  // `registration-url` attribute → registrationUrl prop.
  export let registrationUrl: string = '';

  // ---- Form state ----
  let relationship_status: 'SINGLE' | 'COUPLE' = 'SINGLE';
  let num_dependants = 0;
  let applicant_pwd = false;
  let spouse_pwd = false;
  let monthly_income = '';
  let spouse_monthly_income = '';
  let primary_vehicle_value = '';
  let other_vehicle_value = '';
  let other_asset_value = '';

  // ---- Result state ----
  let loading = false;
  let result: EligibilityResponse | null = null;
  let errorMessage: string | null = null;

  $: showSpouseFields = relationship_status === 'COUPLE';

  async function handleSubmit() {
    loading = true;
    result = null;
    errorMessage = null;

    const req: EligibilityRequest = {
      relationship_status,
      num_dependants,
      applicant_pwd,
      spouse_pwd: showSpouseFields ? spouse_pwd : false,
      monthly_income: monthly_income || '0',
      spouse_monthly_income: showSpouseFields ? (spouse_monthly_income || '0') : '0',
      primary_vehicle_value: primary_vehicle_value || '0',
      other_vehicle_value: other_vehicle_value || '0',
      other_asset_value: other_asset_value || '0',
    };

    try {
      result = await calculateEligibility(apiUrl, req);
    } catch {
      errorMessage = 'We could not calculate your estimate right now. Please try again later.';
    } finally {
      loading = false;
    }
  }

  function formatDollars(amount: string): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(parseFloat(amount));
  }
</script>

<div class="estimator">
  <div class="notice" role="note">
    <p>
      This tool provides a basic estimate only. It does not retain your information
      or affect any application. Results are not a guarantee of eligibility.
    </p>
  </div>

  <form on:submit|preventDefault={handleSubmit} aria-label="Eligibility Estimator">
    <fieldset>
      <legend>About you</legend>

      <div class="field">
        <label>
          <input type="radio" bind:group={relationship_status} value="SINGLE" />
          Single
        </label>
        <label>
          <input type="radio" bind:group={relationship_status} value="COUPLE" />
          Married or in a relationship
        </label>
      </div>

      <div class="field">
        <label for="ee-num-dependants">Number of dependants</label>
        <input
          id="ee-num-dependants"
          type="number"
          min="0"
          max="20"
          bind:value={num_dependants}
        />
      </div>

      <div class="field">
        <label>
          <input type="checkbox" bind:checked={applicant_pwd} />
          I have Persons with Disabilities (PWD) status
        </label>
      </div>

      {#if showSpouseFields}
        <div class="field">
          <label>
            <input type="checkbox" bind:checked={spouse_pwd} />
            My spouse has PWD status
          </label>
        </div>
      {/if}
    </fieldset>

    <fieldset>
      <legend>Monthly income</legend>

      <div class="field">
        <label for="ee-monthly-income">Your monthly income ($)</label>
        <input
          id="ee-monthly-income"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          bind:value={monthly_income}
        />
      </div>

      {#if showSpouseFields}
        <div class="field">
          <label for="ee-spouse-income">Spouse monthly income ($)</label>
          <input
            id="ee-spouse-income"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            bind:value={spouse_monthly_income}
          />
        </div>
      {/if}
    </fieldset>

    <fieldset>
      <legend>Assets</legend>

      <div class="field">
        <label for="ee-primary-vehicle">Value of primary vehicle ($)</label>
        <input
          id="ee-primary-vehicle"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          bind:value={primary_vehicle_value}
        />
      </div>

      <div class="field">
        <label for="ee-other-vehicle">Value of other vehicles ($)</label>
        <input
          id="ee-other-vehicle"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          bind:value={other_vehicle_value}
        />
      </div>

      <div class="field">
        <label for="ee-other-assets">
          Value of other assets (property, investments, cash, savings) ($)
        </label>
        <input
          id="ee-other-assets"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          bind:value={other_asset_value}
        />
      </div>
    </fieldset>

    <button type="submit" disabled={loading}>
      {loading ? 'Calculating…' : 'Check my eligibility'}
    </button>
  </form>

  {#if errorMessage}
    <div class="error" role="alert">{errorMessage}</div>
  {/if}

  {#if result}
    <section aria-live="polite" aria-label="Eligibility estimate result">
      {#if result.eligible}
        <div class="result result--eligible" role="status">
          <h2>You may be eligible for assistance</h2>
          <p>
            Based on what you entered, your estimated monthly benefit is
            <strong>{formatDollars(result.estimated_amount)}</strong>.
          </p>
          <p class="disclaimer">
            This is an estimate only. Actual benefit amounts depend on your full application
            and Ministry review. This tool does not retain your information.
          </p>
          {#if registrationUrl}
            <a href={registrationUrl} class="cta-button">Create an account to apply</a>
          {/if}
        </div>
      {:else}
        <div class="result result--ineligible" role="status">
          <h2>You may not be eligible at this time</h2>
          {#if result.ineligibility_reason === 'assets_exceed_limit'}
            <p>Your total assets appear to exceed the limit for your family situation.</p>
          {:else if result.ineligibility_reason === 'income_exceeds_limit'}
            <p>Your monthly income exceeds the income limit for your family situation.</p>
          {:else}
            <p>Based on the information you provided, you do not appear to meet the eligibility criteria.</p>
          {/if}
          <p class="disclaimer">
            This is an estimate only. You may still wish to contact the Ministry for a full assessment.
          </p>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  /* Styles are scoped to this component. */
  .estimator {
    font-family: system-ui, sans-serif;
    max-width: 600px;
  }
  .notice {
    background: #f0f4f8;
    border-left: 4px solid #2b5797;
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  fieldset {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .field {
    margin-bottom: 0.75rem;
  }
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
  }
  input[type="number"] {
    width: 100%;
    padding: 0.4rem 0.6rem;
    border: 1px solid #999;
    border-radius: 3px;
    font-size: 1rem;
  }
  button[type="submit"] {
    background: #2b5797;
    color: #fff;
    border: none;
    padding: 0.6rem 1.4rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }
  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .error {
    background: #fff0f0;
    border: 1px solid #c00;
    border-radius: 4px;
    padding: 0.75rem;
    margin-top: 1rem;
    color: #c00;
  }
  .result {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 4px;
  }
  .result--eligible {
    background: #eaffea;
    border: 1px solid #3a7a3a;
  }
  .result--ineligible {
    background: #fff8e1;
    border: 1px solid #8a6a00;
  }
  .disclaimer {
    font-size: 0.85rem;
    color: #555;
    margin-top: 0.5rem;
  }
  .cta-button {
    display: inline-block;
    margin-top: 0.75rem;
    background: #2b5797;
    color: #fff;
    padding: 0.5rem 1.2rem;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.95rem;
  }
</style>
