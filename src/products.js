import kenzAiHubLogo from './assets/kenzaihub.webp';
import aiBizzLogo from './assets/aibizz (2).webp';
import kenMeetLogo from './assets/kenmeet.webp';
import kenzIntentLogo from './assets/kenz-intent.webp';
import kenVoiceLogo from './assets/kenvoice-logo.webp';
import recruifyLogo from './assets/recrufy.webp';
import smartIdpLogo from './assets/smartidp.webp';
import leapLogo from './assets/logo-leap5.png';


export { leapLogo, kenzAiHubLogo, smartIdpLogo };

/**
 * Exact mapping of services to ERP custom_lead_product IDs.
 * Sourced from .env with fallback to default ERP codes.
 */
export const PRODUCT_ID_MAP = {
  'kenz-ai-hub': import.meta.env.VITE_PRODUCT_KENZ_AI_HUB || 'STO-ITEM-2026-00029',
  'ai-bizz-hub': import.meta.env.VITE_PRODUCT_AI_BIZZ_HUB || 'STO-ITEM-2026-00030',
  'kenmeet': import.meta.env.VITE_PRODUCT_KENMEET || 'STO-ITEM-2026-00031',
  'kenz-intent': import.meta.env.VITE_PRODUCT_KENZ_INTENT || 'STO-ITEM-2026-00032',
  'kenvoice': import.meta.env.VITE_PRODUCT_KENVOICE || 'STO-ITEM-2026-00002',
  'recruify-ai': import.meta.env.VITE_PRODUCT_RECRUIFY_AI || 'STO-ITEM-2026-00033',
  'smart-idp': import.meta.env.VITE_PRODUCT_SMART_IDP || 'STO-ITEM-2026-00034',
};

/**
 * Dynamic product catalog with individual custom_lead_product IDs.
 */
export const DEFAULT_PRODUCTS = [
  {
    id: 'kenz-ai-hub',
    product_id: 31,
    productId: PRODUCT_ID_MAP['kenz-ai-hub'],
    name: 'Kenz AI Hub',
    product_name: 'Kenzaihub',
    product_desc: 'AI product',
    tagline: 'Premium AI Services',
    url: 'https://kenzaihub.io/',
    displayUrl: 'kenzaihub.io',
    logo: kenzAiHubLogo,
  },
  {
    id: 'ai-bizz-hub',
    product_id: 32,
    productId: PRODUCT_ID_MAP['ai-bizz-hub'],
    name: 'AI Bizz Hub',
    product_name: 'Aibizzhub',
    product_desc: 'Aibizzhub',
    tagline: 'Smart ERP & Business',
    url: 'https://aibizzhub.io/',
    displayUrl: 'aibizzhub.io',
    logo: aiBizzLogo,
  },
  {
    id: 'kenmeet',
    product_id: 33,
    productId: PRODUCT_ID_MAP['kenmeet'],
    name: 'KenMeet',
    product_name: 'Kenmeet',
    product_desc: 'Kenmeet',
    tagline: 'AI Meetings & Summary',
    url: 'https://kenmeet.kenzaihub.io/',
    displayUrl: 'kenmeet.kenzaihub.io',
    logo: kenMeetLogo,
  },
  {
    id: 'kenz-intent',
    product_id: 34,
    productId: PRODUCT_ID_MAP['kenz-intent'],
    name: 'Kenz Intent',
    product_name: 'KENZINTENT',
    product_desc: 'KENZINTENT',
    tagline: 'Buyer Intent & Leads',
    url: 'https://kenz-intent.kenzaihub.io/',
    displayUrl: 'kenz-intent.kenzaihub.io',
    logo: kenzIntentLogo,
  },
  {
    id: 'kenvoice',
    product_id: 2,
    productId: PRODUCT_ID_MAP['kenvoice'],
    name: 'KenVoice',
    product_name: 'KenVoice',
    product_desc: 'Conversational Voice AI',
    tagline: 'Conversational Voice AI',
    url: 'https://kenvoice.ai/',
    displayUrl: 'kenvoice.ai',
    logo: kenVoiceLogo,
  },
  {
    id: 'recruify-ai',
    product_id: 35,
    productId: PRODUCT_ID_MAP['recruify-ai'],
    name: 'Recruify AI',
    product_name: 'Recruify ai',
    product_desc: 'Recruify ai',
    tagline: 'Smart Talent',
    url: 'https://recruifyai.com/',
    displayUrl: 'recruifyai.com',
    logo: recruifyLogo,
  },
  {
    id: 'smart-idp',
    product_id: 36,
    productId: PRODUCT_ID_MAP['smart-idp'],
    name: 'Smart IDP',
    product_name: 'SMART IDP',
    product_desc: 'SMART IDP',
    tagline: 'Intelligent Document AI',
    url: 'https://smartidp.ai/',
    displayUrl: 'smartidp.ai',
    logo: smartIdpLogo,
  },
];
