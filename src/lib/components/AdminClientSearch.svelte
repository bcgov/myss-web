<script lang="ts">
    let {
        loading = false,
        onsearch,
    }: {
        loading?: boolean;
        onsearch?: (detail: { first_name: string; last_name: string; sin: string; page: number }) => void;
    } = $props();

    let first_name: string = $state('');
    let last_name: string = $state('');
    let sin: string = $state('');

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        onsearch?.({ first_name, last_name, sin, page: 1 });
    }
</script>

<form class="client-search" onsubmit={handleSubmit} novalidate>
    <h2 class="client-search__title">Search for Client</h2>

    <div class="client-search__fields">
        <div class="field">
            <label for="cs-first-name">First Name</label>
            <input
                id="cs-first-name"
                type="text"
                bind:value={first_name}
                placeholder="e.g. Jane"
                autocomplete="off"
            />
        </div>

        <div class="field">
            <label for="cs-last-name">Last Name</label>
            <input
                id="cs-last-name"
                type="text"
                bind:value={last_name}
                placeholder="e.g. Smith"
                autocomplete="off"
            />
        </div>

        <div class="field">
            <label for="cs-sin">Social Insurance Number</label>
            <input
                id="cs-sin"
                type="text"
                bind:value={sin}
                placeholder="e.g. 123-456-789"
                autocomplete="off"
                maxlength="11"
            />
        </div>
    </div>

    <button type="submit" class="btn-search" disabled={loading}>
        {loading ? 'Searching…' : 'Search'}
    </button>
</form>

<style>
    .client-search {
        background: #fff;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .client-search__title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #003366;
        margin: 0 0 1rem 0;
    }

    .client-search__fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .field label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #333;
    }

    .field input {
        padding: 0.45rem 0.7rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        color: #212529;
        transition: border-color 0.15s;
    }

    .field input:focus {
        outline: none;
        border-color: #1a5a96;
        box-shadow: 0 0 0 2px rgba(26, 90, 150, 0.2);
    }

    .btn-search {
        padding: 0.5rem 1.5rem;
        background: #003366;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .btn-search:hover:not(:disabled) {
        background: #002244;
    }

    .btn-search:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
