export function formatDate(isoString: string): string {
    if (!isoString) return isoString;
    try {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(isoString));
    } catch {
        return isoString;
    }
}
