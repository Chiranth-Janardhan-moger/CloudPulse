// Simple encryption utility for localStorage
// Note: This provides obfuscation, not true security. For production,
// consider using secure session storage or backend-managed sessions.

const ENCRYPTION_KEY = 'aws-dashboard-key-v1';

export const encryptData = (data: string): string => {
  try {
    // Base64 encode with simple XOR cipher
    const encoded = btoa(
      data
        .split('')
        .map((char, i) => 
          String.fromCharCode(
            char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
          )
        )
        .join('')
    );
    return encoded;
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

export const decryptData = (encryptedData: string): string => {
  try {
    // Decode Base64 and reverse XOR cipher
    const decoded = atob(encryptedData)
      .split('')
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        )
      )
      .join('');
    return decoded;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

export const secureStore = (key: string, data: any): void => {
  const jsonString = JSON.stringify(data);
  const encrypted = encryptData(jsonString);
  sessionStorage.setItem(key, encrypted);
};

export const secureRetrieve = (key: string): any => {
  const encrypted = sessionStorage.getItem(key);
  if (!encrypted) return null;
  
  try {
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to retrieve secure data:', error);
    return null;
  }
};

export const secureRemove = (key: string): void => {
  sessionStorage.removeItem(key);
};
