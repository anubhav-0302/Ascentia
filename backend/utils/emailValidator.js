// Email validation utility for backend

// Common disposable email domains (optional - can be expanded)
const DISPOSABLE_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com'
];

// List of common professional TLDs
const PROFESSIONAL_TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'co', 'io', 'ai', 'tech', 'dev', 'app', 'cloud',
  'info', 'biz', 'xyz', 'online', 'site', 'store',
  'academy', 'agency', 'business', 'company', 'corporation',
  'services', 'solutions', 'technology', 'ventures',
  // Country codes for professional use
  'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in',
  'br', 'mx', 'es', 'it', 'nl', 'se', 'no', 'fi', 'dk'
];

/**
 * Validates email address with professional domain requirements
 * @param {string} email - Email address to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid and error message
 */
const validateEmail = (email, options = {}) => {
  const { allowDisposable = false, requireProfessionalTLD = false } = options;

  // Basic format validation
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Check for trailing special characters (like the example "abc@ac.com'")
  if (email !== email.trim() || /[^a-zA-Z0-9@._%+-]$/.test(email)) {
    return {
      isValid: false,
      error: 'Email cannot end with special characters'
    };
  }

  // Split email into parts
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Validate domain part
  if (!domain || domain.length < 4) {
    return {
      isValid: false,
      error: 'Invalid email domain'
    };
  }

  // Check for single-letter domain parts (e.g., a.c.com)
  const domainParts = domain.split('.');
  
  // The main domain name (before TLD) must be at least 3 characters
  if (domainParts.length >= 2 && domainParts[domainParts.length - 2].length < 3) {
    return {
      isValid: false,
      error: 'Email domain name must be at least 3 characters long'
    };
  }
  
  // All domain parts must be at least 2 characters
  if (domainParts.some(part => part.length < 2)) {
    return {
      isValid: false,
      error: 'Email domain parts must be at least 2 characters long'
    };
  }

  // Check TLD
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'Invalid email extension'
    };
  }

  // Require professional TLD if specified
  if (requireProfessionalTLD && !PROFESSIONAL_TLDS.includes(tld)) {
    return {
      isValid: false,
      error: 'Please use a professional email address'
    };
  }

  // Check for disposable email domains
  if (!allowDisposable && DISPOSABLE_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Disposable email addresses are not allowed'
    };
  }

  // Additional checks for professional emails
  if (requireProfessionalTLD) {
    // Reject obviously non-professional patterns
    const unprofessionalPatterns = [
      /^\d+/, // Domain starts with numbers
      /.*\d{5,}.*/, // Contains 5+ consecutive digits
      /^[a-z]\.com$/, // Single letter domains like a.com
      /^[a-z]{1,2}\.com$/, // Two letter domains like ab.com
    ];

    if (unprofessionalPatterns.some(pattern => pattern.test(domain))) {
      return {
        isValid: false,
        error: 'Please use a professional email address'
      };
    }
  }

  return {
    isValid: true
  };
};

// Export the validation function and regex for use in controllers
export { validateEmail };
export const emailValidationRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export { PROFESSIONAL_TLDS };
export { DISPOSABLE_DOMAINS };
