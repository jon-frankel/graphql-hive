import { crypto } from '@whatwg-node/fetch';

const encoder = new TextEncoder();

export function byteStringToUint8Array(byteString: string) {
  const ui = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; ++i) {
    ui[i] = byteString.charCodeAt(i);
  }

  return ui;
}

export type KeyValidator = (targetId: string, headerKey: string) => Promise<boolean>;

type CreateKeyValidatorDeps = {
  keyData: string;
};

const atobMaybe = (str: string): string | null => {
  try {
    return atob(str);
  } catch {
    return null;
  }
};

export const createIsKeyValid =
  (deps: CreateKeyValidatorDeps): KeyValidator =>
  async (targetId: string, accessHeaderValue: string): Promise<boolean> => {
    const headerBinary = atobMaybe(accessHeaderValue);
    if (headerBinary === null) {
      return false;
    }
    const headerData = byteStringToUint8Array(headerBinary);
    const secretKeyData = encoder.encode(deps.keyData);
    const secretKey = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    return await crypto.subtle.verify('HMAC', secretKey, headerData, encoder.encode(targetId));
  };
