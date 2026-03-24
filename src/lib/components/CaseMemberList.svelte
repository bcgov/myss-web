<script lang="ts">
    import type { CaseMember } from '$lib/api/account';

    let { members }: { members: CaseMember[] } = $props();
</script>

<section class="case-member-list">
    <h2>Case Members</h2>

    {#if members.length === 0}
        <p class="empty">No case members found.</p>
    {:else}
        <table>
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Relationship</th>
                </tr>
            </thead>
            <tbody>
                {#each members as member}
                    <tr>
                        <td>{member.name}</td>
                        <td>{member.relationship}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</section>

<style>
    .case-member-list {
        background: #fff;
        border: 1px solid #c6d4e3;
        border-radius: 6px;
        padding: 1.5rem;
    }

    h2 {
        font-size: 1.15rem;
        color: #003366;
        margin: 0 0 1rem;
        font-weight: 700;
    }

    .empty {
        color: #555;
        font-style: italic;
        margin: 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
    }

    thead {
        background: #f0f4f8;
    }

    th {
        text-align: left;
        padding: 0.6rem 0.85rem;
        font-weight: 600;
        color: #003366;
        border-bottom: 2px solid #c6d4e3;
    }

    td {
        padding: 0.6rem 0.85rem;
        color: #222;
        border-bottom: 1px solid #e8eef4;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    tbody tr:hover {
        background: #f8fafc;
    }
</style>
