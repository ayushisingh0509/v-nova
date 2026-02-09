// useUserInfo.ts
interface UserInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

// useUserInfo.ts

// Extraction utilities

// Helper to clean trailing punctuation
const cleanValue = (text: string): string => {
  return text.trim().replace(/[.,!?;:]+$/, "");
};

export const extractName = (transcript: string): string => {
  const patterns = [
    /(?:my name is|this is|i am|i'm|call me|name is|it's)\s+([a-z\s]+)/i,
    /^(?:the name is)\s+([a-z\s]+)/i
  ];

  let extracted = transcript;
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      extracted = match[1];
      break;
    }
  }
  return cleanValue(extracted);
};

export const extractEmail = (transcript: string): string => {
  // Finds email even in messy context
  const emailPattern = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const match = transcript.match(emailPattern);

  if (match) {
    return match[1].toLowerCase();
  }

  // Fallback for "at" "dot"
  const spokenPattern = /([a-z0-9._+-]+)\s*(?:at|@)\s*([a-z0-9.-]+)\s*(?:dot|\.)\s*([a-z]{2,})/i;
  const spokenMatch = transcript.match(spokenPattern);
  if (spokenMatch) {
    return `${spokenMatch[1]}@${spokenMatch[2]}.${spokenMatch[3]}`.toLowerCase();
  }

  return cleanValue(transcript).toLowerCase();
};

export const extractPhone = (transcript: string): string => {
  // Remove common phone phrases first to avoid capturing words
  let cleaned = transcript
    .replace(/(?:my )?(?:phone|number|contact)(?: number)?(?: is)?/gi, '')
    .trim();

  // Extract digits and common separators
  const phonePattern = /[\d\s\-\(\)\.+]{10,}/;
  const match = cleaned.match(phonePattern);

  if (match) {
    // Keep only digits and + (for country code)
    return match[0].replace(/[^\d+]/g, '');
  }

  return cleaned.replace(/[^\d+]/g, '');
};

export const extractAddress = (transcript: string): string => {
  const patterns = [
    /(?:i live (?:at|on|in)|my address is|address:?|the address is|ship to|shipping address is)\s+(.+)/i
  ];

  let extracted = transcript;
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      extracted = match[1];
      break;
    }
  }
  return cleanValue(extracted);
};

export const extractCardNumber = (transcript: string): string => {
  // Remove common phrases
  let cleaned = transcript
    .replace(/(?:my )?(?:card|credit card)(?: number)?(?: is)?/gi, '')
    .trim();

  // Extract digits and spaces
  const cardPattern = /[\d\s]{13,19}/;
  const match = cleaned.match(cardPattern);

  return match ? match[0].replace(/\s/g, '') : cleaned.replace(/\D/g, '');
};

export const extractExpiryDate = (transcript: string): string => {
  // Remove common phrases
  let cleaned = transcript
    .replace(/(?:expiry|expiration)(?: date)?(?: is)?/gi, '')
    .trim();

  // Match MM/YY or MM/YYYY format
  const expiryPattern = /(\d{1,2})\s*[\/\-]\s*(\d{2,4})/;
  const match = cleaned.match(expiryPattern);

  if (match) {
    const month = match[1].padStart(2, '0');
    const year = match[2].length === 2 ? match[2] : match[2].slice(-2);
    return `${month}/${year}`;
  }

  // Try extracting just numbers if pattern fails "12 25"
  const numbers = cleaned.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    const month = numbers[0].padStart(2, '0');
    const year = numbers[1].length === 4 ? numbers[1].slice(-2) : numbers[1];
    return `${month}/${year}`;
  }

  return cleanValue(cleaned);
};

export const extractCVV = (transcript: string): string => {
  // Remove common phrases
  let cleaned = transcript
    .replace(/(?:cvv|security code|cvc)(?: is)?/gi, '')
    .trim();

  // Extract 3-4 digits
  const cvvPattern = /\d{3,4}/;
  const match = cleaned.match(cvvPattern);

  return match ? match[0] : cleaned.replace(/\D/g, '');
};

export const useUserInfo = () => {
  const getUserInfo = (): UserInfo => {
    const storedInfo = localStorage.getItem('userInfo');
    return storedInfo ? JSON.parse(storedInfo) : {
      name: '',
      email: '',
      address: '',
      phone: '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    };
  };

  const updateUserInfo = (info: Partial<UserInfo>) => {
    const currentInfo = getUserInfo();
    const newInfo = { ...currentInfo, ...info };
    localStorage.setItem('userInfo', JSON.stringify(newInfo));
  };

  // New method: extract and update from voice transcript
  const updateFromVoice = (field: keyof UserInfo, transcript: string) => {
    let extractedValue: string;

    switch (field) {
      case 'name':
      case 'cardName':
        extractedValue = extractName(transcript);
        break;
      case 'email':
        extractedValue = extractEmail(transcript);
        break;
      case 'phone':
        extractedValue = extractPhone(transcript);
        break;
      case 'address':
        extractedValue = extractAddress(transcript);
        break;
      case 'cardNumber':
        extractedValue = extractCardNumber(transcript);
        break;
      case 'expiryDate':
        extractedValue = extractExpiryDate(transcript);
        break;
      case 'cvv':
        extractedValue = extractCVV(transcript);
        break;
      default:
        extractedValue = transcript.trim();
    }

    console.log(`[useUserInfo] Extracted ${field}:`, extractedValue, 'from:', transcript);
    updateUserInfo({ [field]: extractedValue });
    return extractedValue;
  };

  return { getUserInfo, updateUserInfo, updateFromVoice };
};