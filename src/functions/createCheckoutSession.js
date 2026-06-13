import { base44 } from '../api/base44Client';

export async function createCheckoutSession(data = {}) {
    return base44.functions.invoke('createCheckoutSession', data);
}
