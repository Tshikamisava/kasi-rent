import dns from 'dns';

const disposableDomains = new Set([
  'mailinator.com', '10minutemail.com', 'temp-mail.org', 'yopmail.com',
  'guerrillamail.com', 'maildrop.cc', 'trashmail.com', 'tempmail.com',
  'dispostable.com', 'getnada.com'
]);

const defaultAllowedDomains = new Set(['gmail.com', 'googlemail.com']);

const parseAllowedDomains = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return defaultAllowedDomains;

  const parsed = raw
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  return parsed.length > 0 ? new Set(parsed) : defaultAllowedDomains;
};

const allowedDomains = parseAllowedDomains(process.env.EMAIL_ALLOWED_DOMAINS);

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  return emailRegex.test(email.trim());
};

export const isDisposableDomain = (email) => {
  try {
    const domain = email.split('@')[1].toLowerCase();
    return disposableDomains.has(domain);
  } catch (e) {
    return false;
  }
};

export const isAllowedEmailDomain = (email) => {
  try {
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.has(domain);
  } catch (e) {
    return false;
  }
};

export const getAllowedEmailDomains = () => Array.from(allowedDomains);

export const hasValidMx = async (email) => {
  if (!isValidEmailFormat(email)) return false;
  const domain = email.split('@')[1];
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (e) {
    return false;
  }
};

export const isAcceptableEmail = async (email) => {
  if (!isValidEmailFormat(email)) return false;
  if (isDisposableDomain(email)) return false;
  if (!isAllowedEmailDomain(email)) return false;

  // Optional MX check when env flag is enabled
  try {
    if (process.env.ENABLE_MX_CHECK === 'true') {
      return await hasValidMx(email);
    }
  } catch (e) {
    // ignore MX errors and fall back to format/domain checks
  }

  return true;
};

export default { isValidEmailFormat, isDisposableDomain, hasValidMx, isAcceptableEmail };
