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

export const generatePayFastSignature = (data: PayFastData, passphrase?: string): string => {
  let queryString = '';
  Object.keys(data)
    .sort()
    .forEach((key) => {
      if (data[key] !== undefined && data[key] !== '') {
        queryString += `${key}=${encodeURIComponent(data[key]!).replace(/%20/g, '+')}&`;
      }
    });

  // Remove trailing ampersand
  queryString = queryString.substring(0, queryString.length - 1);

  if (passphrase) {
    queryString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(queryString).digest('hex');
};

export const verifyPayFastNotification = (data: any, passphrase?: string): boolean => {
  const signature = data.signature;
  const dataWithoutSignature = { ...data };
  delete dataWithoutSignature.signature;

  const calculatedSignature = generatePayFastSignature(dataWithoutSignature, passphrase);
  return calculatedSignature === signature;
};
