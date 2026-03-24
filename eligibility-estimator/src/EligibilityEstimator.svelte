<!-- src/EligibilityEstimator.svelte -->
<!--
  Custom Element shell — wraps EligibilityEstimatorComponent.
  Compiled as a Web Component with shadow DOM.

  Embed in a CMS:
    <script src="eligibility-estimator.iife.js"></script>
    <eligibility-estimator api-url="https://api.myss.gov.bc.ca"></eligibility-estimator>

  Host as a standalone page:
    Serve index.html + eligibility-estimator.iife.js from any static host.
-->
<svelte:options customElement="eligibility-estimator" />

<script lang="ts">
  import EligibilityEstimatorComponent from './EligibilityEstimatorComponent.svelte';

  // Props become HTML attributes on the custom element.
  // Svelte converts kebab-case attribute names to camelCase props automatically.
  export let apiUrl: string = import.meta.env.VITE_API_URL || '/api';
  export let registrationUrl: string = '';
</script>

<EligibilityEstimatorComponent {apiUrl} {registrationUrl} />
