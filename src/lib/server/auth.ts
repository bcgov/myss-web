import { SvelteKitAuth } from '@auth/sveltekit';
import type { OIDCConfig } from '@auth/core/providers';

// BCeID OIDC provider (BC Government identity platform)
const BCeIDProvider: OIDCConfig<Record<string, unknown>> = {
    id: 'bceid',
    name: 'BCeID',
    type: 'oidc',
    issuer: process.env.BCEID_ISSUER ?? 'https://loginproxy.gov.bc.ca/auth/realms/standard',
    clientId: process.env.BCEID_CLIENT_ID ?? '',
    clientSecret: process.env.BCEID_CLIENT_SECRET ?? '',
};

// BC Services Card OIDC provider
const BCServicesCardProvider: OIDCConfig<Record<string, unknown>> = {
    id: 'bcServicesCard',
    name: 'BC Services Card',
    type: 'oidc',
    issuer: process.env.BC_SERVICES_CARD_ISSUER ?? 'https://loginproxy.gov.bc.ca/auth/realms/standard',
    clientId: process.env.BC_SERVICES_CARD_CLIENT_ID ?? '',
    clientSecret: process.env.BC_SERVICES_CARD_CLIENT_SECRET ?? '',
};

// Keycloak / IDIR provider for workers
const IDIRProvider: OIDCConfig<Record<string, unknown>> = {
    id: 'idir',
    name: 'IDIR',
    type: 'oidc',
    issuer: process.env.IDIR_ISSUER ?? 'https://loginproxy.gov.bc.ca/auth/realms/standard',
    clientId: process.env.IDIR_CLIENT_ID ?? '',
    clientSecret: process.env.IDIR_CLIENT_SECRET ?? '',
};

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [BCeIDProvider, BCServicesCardProvider, IDIRProvider],
    secret: process.env.AUTH_SECRET,
    trustHost: process.env.NODE_ENV === 'production' || process.env.TRUST_HOST === 'true',
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.bceid_guid = (profile as Record<string, unknown>).bceid_guid as string | undefined;
                token.idir_username = (profile as Record<string, unknown>).idir_username as string | undefined;
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                accessToken: token.access_token as string | undefined,
                provider: token.provider as string | undefined,
                idir_username: token.idir_username as string | undefined,
            };
        },
    },
});
