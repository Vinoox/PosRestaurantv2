export const extractJwt = (responseBody: any): string | null => {
    if (!responseBody) return null;
    if (typeof responseBody === 'string' && responseBody.startsWith('eyJ')) return responseBody;
    if (typeof responseBody === 'object') {
        const t = responseBody.token || responseBody.Token || responseBody.accessToken || responseBody.AccessToken || responseBody.jwt;
        if (t && typeof t === 'string' && t.startsWith('eyJ')) return t;
        const found = Object.values(responseBody).find(val => typeof val === 'string' && (val as string).startsWith('eyJ'));
        if (found) return found as string;
    }
    return null;
};