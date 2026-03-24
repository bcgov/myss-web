<script lang="ts">
    let { status }: { status: string } = $props();

    type TimelineStep = {
        label: string;
        key: string;
    };

    const steps: TimelineStep[] = [
        { label: 'Draft', key: 'draft' },
        { label: 'Submitted', key: 'submitted' },
        { label: 'In Progress', key: 'in progress' },
        { label: 'Complete', key: 'complete' },
    ];

    const terminalNegative = new Set(['denied', 'cancelled', 'rejected', 'withdrawn']);

    let normalized = $derived(status.toLowerCase());
    let isTerminalNegative = $derived(terminalNegative.has(normalized));

    function getStepState(step: TimelineStep, currentStatus: string, terminalNeg: boolean): 'completed' | 'active' | 'pending' {
        const order = steps.map((s) => s.key);
        const currentIndex = order.indexOf(currentStatus);
        const stepIndex = order.indexOf(step.key);

        if (terminalNeg) {
            return stepIndex === 0 ? 'completed' : 'pending';
        }
        if (currentIndex === -1) {
            // Unknown status — treat as before first step
            return 'pending';
        }
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    }

    let stepStates = $derived(steps.map((step) => ({
        ...step,
        state: getStepState(step, normalized, isTerminalNegative),
    })));
</script>

<div class="timeline" aria-label="Service request status timeline">
    {#if isTerminalNegative}
        <div class="terminal-status terminal-status--negative" role="status">
            Status: <strong>{status}</strong>
        </div>
    {:else}
        <ol class="timeline__steps">
            {#each stepStates as step, i (step.key)}
                <li
                    class="timeline__step timeline__step--{step.state}"
                    aria-current={step.state === 'active' ? 'step' : undefined}
                >
                    <span class="timeline__dot" aria-hidden="true"></span>
                    <span class="timeline__label">{step.label}</span>
                    {#if i < stepStates.length - 1}
                        <span class="timeline__connector" aria-hidden="true"></span>
                    {/if}
                </li>
            {/each}
        </ol>
    {/if}
</div>

<style>
    .timeline {
        margin: 1.5rem 0;
    }

    .timeline__steps {
        display: flex;
        align-items: flex-start;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 0;
    }

    .timeline__step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        flex: 1;
    }

    .timeline__dot {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
        border: 2px solid #adb5bd;
        background: white;
        z-index: 1;
        transition: background 0.2s, border-color 0.2s;
    }

    .timeline__step--completed .timeline__dot {
        background: #28a745;
        border-color: #28a745;
    }

    .timeline__step--active .timeline__dot {
        background: #003366;
        border-color: #003366;
        box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.25);
    }

    .timeline__step--pending .timeline__dot {
        background: white;
        border-color: #adb5bd;
    }

    .timeline__label {
        margin-top: 0.4rem;
        font-size: 0.78rem;
        text-align: center;
        color: #555;
        font-weight: 400;
    }

    .timeline__step--active .timeline__label {
        color: #003366;
        font-weight: 700;
    }

    .timeline__step--completed .timeline__label {
        color: #155724;
    }

    .timeline__connector {
        position: absolute;
        top: 0.6rem;
        left: 50%;
        width: 100%;
        height: 2px;
        background: #adb5bd;
        z-index: 0;
    }

    .timeline__step--completed .timeline__connector {
        background: #28a745;
    }

    .terminal-status {
        font-size: 0.95rem;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        display: inline-block;
    }

    .terminal-status--negative {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
</style>
