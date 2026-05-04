import crypto from 'crypto';

interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  [key: string]: string | undefined;
}

// PayFast requires fields in a specific order for the signature if not using alphabetical sort.
// However, many implementations use alphabetical sort (ksort) and it works if the form follows it.
// To be safe and follow the most reliable path:
export const generatePayFastSignature = (data: PayFastData, passphrase?: string): string => {
  let queryString = '';
  
  // 1. Sort keys alphabetically (equivalent to PHP ksort)
  const sortedKeys = Object.keys(data).sort();

  // 2. Concatenate key=value pairs
  sortedKeys.forEach((key) => {
    if (data[key] !== undefined && data[key] !== '' && data[key] !== null) {
      // 3. Values must be URL-encoded, with spaces as +
      const value = encodeURIComponent(String(data[key]).trim()).replace(/%20/g, '+');
      queryString += `${key}=${value}&`;
    }
  });

  // 4. Remove trailing ampersand
  queryString = queryString.substring(0, queryString.length - 1);

  // 5. Append passphrase if it exists
  if (passphrase && passphrase.trim() !== '') {
    queryString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  // 6. Generate MD5 hash
  return crypto.createHash('md5').update(queryString).digest('hex');
};

export const verifyPayFastNotification = (data: any, passphrase?: string): boolean => {
  const signature = data.signature;
  const dataWithoutSignature = { ...data };
  delete dataWithoutSignature.signature;

  // For ITN, PayFast sends fields in a specific order. 
  // Most modern PayFast integrations use alphabetical sort for verification too.
  const calculatedSignature = generatePayFastSignature(dataWithoutSignature, passphrase);
  return calculatedSignature === signature;
};
