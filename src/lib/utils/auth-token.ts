export function getToken(): string {
    return (typeof window !== 'undefined' && window.sessionStorage.getItem('auth_token')) ?? '';
}
