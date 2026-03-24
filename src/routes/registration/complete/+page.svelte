<!-- src/routes/registration/complete/+page.svelte -->
<svelte:head>
  <title>Registration Complete — MySelfServe</title>
</svelte:head>

<main>
  <h1>Your account is being set up</h1>

  <div class="notice" role="status">
    <p>
      Thank you for registering with MySelfServe. Your account is being prepared.
      This usually takes just a few minutes.
    </p>
    <p>
      Once your account is ready, you can
      <a href="/auth/signin">sign in with your BCeID</a>.
    </p>
  </div>

  <p>
    If you have been waiting more than 5 minutes and still cannot sign in,
    please contact the Ministry at <strong>1-866-866-0800</strong>.
  </p>
</main>
