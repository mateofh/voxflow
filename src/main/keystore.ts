import keytar from 'keytar';

const SERVICE_NAME = 'VoxFlow';

/**
 * Save an API key securely in the OS keychain
 */
export const saveKey = async (service: string, key: string): Promise<void> => {
  const account = `${SERVICE_NAME}-${service}`;
  if (key && key.trim().length > 0) {
    await keytar.setPassword(SERVICE_NAME, account, key);
    console.log(`✓ Key saved securely for: ${service}`);
  } else {
    // Delete key if empty string provided
    await keytar.deletePassword(SERVICE_NAME, account);
    console.log(`✓ Key removed for: ${service}`);
  }
};

/**
 * Retrieve an API key from the OS keychain
 */
export const getKey = async (service: string): Promise<string | null> => {
  const account = `${SERVICE_NAME}-${service}`;
  return await keytar.getPassword(SERVICE_NAME, account);
};

/**
 * Delete an API key from the OS keychain
 */
export const deleteKey = async (service: string): Promise<boolean> => {
  const account = `${SERVICE_NAME}-${service}`;
  return await keytar.deletePassword(SERVICE_NAME, account);
};

/**
 * Get all stored keys (returns service names, not actual keys)
 */
export const listKeys = async (): Promise<string[]> => {
  const credentials = await keytar.findCredentials(SERVICE_NAME);
  return credentials.map(c => c.account.replace(`${SERVICE_NAME}-`, ''));
};
