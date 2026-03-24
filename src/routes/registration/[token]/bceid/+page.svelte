<!-- src/routes/registration/[token]/bceid/+page.svelte -->
<script lang="ts">
  // BCeID linking step. The "Use your BCeID" button triggers Auth.js OIDC redirect.
  const BCEID_REGISTRATION_URL = 'https://www.bceid.ca/register/basic/';
</script>

<svelte:head>
  <title>Create an Account — Step 5 of 5 — MySelfServe</title>
</svelte:head>

<main>
  <h1>Create an Account</h1>
  <p>Step 5 of 5 — Link your BCeID</p>

  <p>
    To complete your registration, you need a Basic BCeID account.
    BCeID is the BC Government's secure online identity service.
  </p>

  <div class="bceid-options">
    <div class="option">
      <h2>Already have a BCeID?</h2>
      <p>Sign in with your existing Basic BCeID to complete registration.</p>
      <a href="/auth/signin?callbackUrl=/registration/complete" class="button-primary">
        Use your BCeID
      </a>
    </div>

    <div class="option">
      <h2>Don't have a BCeID?</h2>
      <p>Create a free Basic BCeID account, then return here to complete your registration.</p>
      <a
        href={BCEID_REGISTRATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="button-secondary"
      >
        Get BCeID
      </a>
    </div>
  </div>
</main>
