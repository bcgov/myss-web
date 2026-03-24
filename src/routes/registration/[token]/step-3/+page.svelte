<!-- src/routes/registration/[token]/step-3/+page.svelte -->
<script lang="ts">
  const emailProviders = [
    { label: 'Gmail',    url: 'https://mail.google.com' },
    { label: 'Outlook',  url: 'https://outlook.live.com' },
    { label: 'Hotmail',  url: 'https://outlook.live.com' },
    { label: 'iCloud',   url: 'https://www.icloud.com/mail' },
    { label: 'Yahoo',    url: 'https://mail.yahoo.com' },
    { label: 'AOL',      url: 'https://mail.aol.com' },
    { label: 'Shaw',     url: 'https://webmail.shaw.ca' },
    { label: 'Telus',    url: 'https://webmail.telus.net' },
    { label: 'Rogers',   url: 'https://www.rogers.com/email' },
    { label: 'Bell',     url: 'https://bell.ca/email' },
  ];

  let selectedProvider = $state('');

  function goToProvider() {
    const found = emailProviders.find(p => p.label === selectedProvider);
    if (found) {
      window.open(found.url, '_blank', 'noopener');
    }
  }
</script>

<svelte:head>
  <title>Create an Account — Step 3 of 5 — MySelfServe</title>
</svelte:head>

<main>
  <h1>Create an Account</h1>
  <p>Step 3 of 5 — Verify Your Email</p>

  <div class="notice" role="note">
    <p>
      We have sent a verification email to the address you provided.
      Please check your inbox and click the link in the email to continue.
    </p>
  </div>

  <p>Check your email using one of these providers:</p>

  <div class="provider-picker">
    <select bind:value={selectedProvider} aria-label="Select email provider">
      <option value="">Select your email provider...</option>
      {#each emailProviders as provider}
        <option value={provider.label}>{provider.label}</option>
      {/each}
    </select>
    <button type="button" onclick={goToProvider} disabled={!selectedProvider}>
      Go to my inbox
    </button>
  </div>

  <p>
    Once you click the link in your email, you will be taken to the next step automatically.
  </p>
</main>
