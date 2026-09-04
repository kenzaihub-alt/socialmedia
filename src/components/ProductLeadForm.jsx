import React, { useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { 
  User, 
  Mail, 
  Building2, 
  Send, 
  Check, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  Loader2, 
  XCircle, 
  X, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_PRODUCTS, PRODUCT_ID_MAP, leapLogo } from '../products';

const PhoneInputComponent = PhoneInput.default || PhoneInput;

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '966',
  company: '',
  product: 'kenz-ai-hub',
  description: '',
};

export default function ProductLeadForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Validation rules
  const validate = (values) => {
    const errs = {};
    if (!values.name.trim()) {
      errs.name = 'Full name is required';
    } else if (values.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      errs.email = 'Business email is required';
    } else if (!emailRegex.test(values.email.trim())) {
      errs.email = 'Enter a valid business email';
    }

    const phoneDigits = (values.phone || '').replace(/[^0-9]/g, '');
    if (!phoneDigits || phoneDigits === '966') {
      errs.phone = 'Phone number is required';
    } else if (phoneDigits.length < 8 || phoneDigits.length > 16) {
      errs.phone = 'Enter a valid phone number';
    }

    if (!values.company.trim()) {
      errs.company = 'Company name is required';
    }

    if (!values.product) {
      errs.product = 'Please select a service';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const vErrors = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: vErrors[name] }));
    }
  };

  const handlePhoneChange = (phoneValue) => {
    const updated = { ...formData, phone: phoneValue };
    setFormData(updated);

    if (touched.phone) {
      const vErrors = validate(updated);
      setErrors((prev) => ({ ...prev, phone: vErrors.phone }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const vErrors = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: vErrors[field] }));
  };

  // Select service and open related website
  const handleProductSelect = (product) => {
    setFormData((prev) => ({ ...prev, product: product.id }));
    setTouched((prev) => ({ ...prev, product: true }));
    setErrors((prev) => ({ ...prev, product: undefined }));

    if (product.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Find currently selected service and its custom_lead_product code
  const selectedService = DEFAULT_PRODUCTS.find((s) => s.id === formData.product) || DEFAULT_PRODUCTS[0];
  const activeProductId = PRODUCT_ID_MAP[formData.product] || selectedService?.productId;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {
      name: true,
      email: true,
      phone: true,
      company: true,
      product: true,
      description: true,
    };
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    // Split Name into first_name and last_name for ERP payload
    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format phone with leading +
    const rawDigits = (formData.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = rawDigits.startsWith('+') ? rawDigits : `+${rawDigits}`;

    // Dynamically resolve custom_lead_product based on the selected product
    const customLeadProduct = PRODUCT_ID_MAP[formData.product] || selectedService?.productId;

    // 1. Construct ERP Lead payload
    const erpPayload = {
      first_name: firstName,
      last_name: lastName || firstName,
      email_id: formData.email.trim(),
      mobile_no: formattedPhone,
      source: 'Website',
      request_type: 'Product Enquiry',
      description: formData.description.trim() || `Inquiry for ${selectedService?.name || 'Kenz AI Hub'}`,
      company: 'kenz ai hub',
      custom_lead_product: customLeadProduct,
      company_name: formData.company.trim(),
      product_id: selectedService?.product_id,
    };

    // 2. Construct CXPro Leads payload
    const cxproPayload = {
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      phone_number: formattedPhone,
      subject: `${selectedService?.name || 'Product'} Inquiry`,
      description: formData.description.trim() || 'Inquiry submitted via website form',
      product_ids: String(selectedService?.product_id || 31),
    };

    console.log('Submitting ERP Lead Payload:', erpPayload);
    console.log('Submitting CXPro Lead Payload:', cxproPayload);

    // Direct API targets (moved directly into component, no proxy needed)
    const ERP_API_URL = import.meta.env.VITE_API_URL || 'https://testerp.aibizzapp.com/api/resource/Lead';
    const ERP_TOKEN = import.meta.env.VITE_API_TOKEN || 'token a5c69b373b08a5f:b12c52520efe83a';

    const CXPRO_API_URL = import.meta.env.VITE_CXPRO_API_URL || 'https://api.riskfortis.com/v1/all-leads';
    const CXPRO_TOKEN = import.meta.env.VITE_CXPRO_API_TOKEN || 'Bearer ak_live_7bE3xN9fQ4wM2zVpK1sC8jD5hG6tY0uR';

    try {
      // 1. Submit directly to ERP Leads API (https://testerp.aibizzapp.com)
      const erpRequest = async () => {
        return await axios.post(ERP_API_URL, erpPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': ERP_TOKEN,
          },
          timeout: 10000,
        });
      };

      // 2. Submit directly to CXPro Leads API (https://api.riskfortis.com)
      const cxproRequest = async () => {
        return await axios.post(CXPRO_API_URL, cxproPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': CXPRO_TOKEN,
          },
          timeout: 10000,
        });
      };

      const [erpResult, cxproResult] = await Promise.allSettled([erpRequest(), cxproRequest()]);

      console.log('ERP API Result:', erpResult);
      console.log('CXPro API Result:', cxproResult);

      const erpSuccess = erpResult.status === 'fulfilled';
      const cxproSuccess = cxproResult.status === 'fulfilled';

      if (!erpSuccess && !cxproSuccess) {
        const errObj = erpResult.reason || cxproResult.reason;
        const errMsg = errObj?.response?.data?.message || 
                       errObj?.response?.data?._server_messages || 
                       errObj?.message || 
                       'Failed to submit inquiry to server. Please try again.';
        throw new Error(typeof errMsg === 'string' ? errMsg : 'Failed to submit inquiry.');
      }

      const createdLead = erpSuccess ? erpResult.value?.data?.data : null;
      const cxproData = cxproSuccess ? cxproResult.value?.data?.data : null;

      setSubmitResult({
        success: true,
        message: 'Thank you! Your inquiry has been submitted successfully to both systems. Our team will contact you within 2 business hours.',
        data: {
          id: createdLead?.name || (cxproData?.id ? `CX-${cxproData.id}` : `LEAD-${Date.now().toString().slice(-6)}`),
          ...formData,
          phone: formattedPhone,
          serviceName: selectedService?.name,
          productId: customLeadProduct,
          product_id: selectedService?.product_id,
          erpSynced: erpSuccess,
          cxproSynced: cxproSuccess,
        },
      });
    } catch (err) {
      console.error('Lead Submission Error:', err);
      const errMsg = err.response?.data?.message || 
                     err.response?.data?._server_messages || 
                     err.message || 
                     'Failed to submit inquiry to server. Please try again.';

      setSubmitResult({
        success: false,
        message: typeof errMsg === 'string' ? errMsg : 'Failed to submit inquiry. Please verify your details.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setTouched({});
    setErrors({});
    setSubmitResult(null);
  };

  const rowOneServices = DEFAULT_PRODUCTS.slice(0, 4);
  const rowTwoServices = DEFAULT_PRODUCTS.slice(4);

  const renderServiceCard = (item) => {
    const isSelected = formData.product === item.id;
    return (
      <button
        key={item.id}
        type="button"
        disabled={isSubmitting}
        onClick={() => handleProductSelect(item)}
        title={`Visit ${item.name} (${item.displayUrl})`}
        className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 min-h-[82px] sm:min-h-[90px] rounded-2xl border transition-all text-center select-none group
          ${isSelected 
            ? 'bg-indigo-50/90 border-indigo-600 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-600/30' 
            : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-sm'}
          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        `}
      >
        {/* Selected checkmark */}
        {isSelected ? (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 group-hover:text-indigo-600">
            <ExternalLink className="w-3 h-3" />
          </span>
        )}

        {/* Logo Image */}
        <div className="w-full h-8 sm:h-9 flex items-center justify-center px-1">
          <img 
            src={item.logo} 
            alt={item.name} 
            className="max-h-7 sm:max-h-8 max-w-full object-contain transition-transform group-hover:scale-105" 
          />
        </div>

        {/* Service Name & Clickable URL */}
        <div className="w-full mt-1">
          <span className={`block text-[11px] sm:text-xs font-bold leading-tight truncate w-full ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
            {item.name}
          </span>
          <span className="block text-[9px] sm:text-[10px] text-indigo-600 group-hover:underline leading-none mt-0.5 truncate w-full font-medium">
            {item.displayUrl}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-[760px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[0_25px_60px_rgba(30,41,59,0.09)] p-6 sm:p-9 relative overflow-hidden text-slate-800">


      {/* 1. TOP LOGO & BRAND HEADER */}
      <div className="flex flex-col items-center text-center mt-1 mb-6">
        {leapLogo && (
          <div className="flex items-center justify-center mb-3">
            <div className="px-4 py-2.5 bg-[#0a0b16] rounded-2xl shadow-md shadow-indigo-500/10 flex items-center justify-center border border-slate-800">
              <img 
                src={leapLogo} 
                alt="LEAP 5" 
                className="h-12 sm:h-14 w-auto object-contain" 
              />
            </div>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Product Lead Form
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select our service & get your special onboarding pass
        </p>
      </div>

      {/* Error Alert */}
      {submitResult && !submitResult.success && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{submitResult.message}</span>
          </div>
          <button type="button" onClick={() => setSubmitResult(null)}>
            <X className="w-3.5 h-3.5 text-rose-400 hover:text-rose-600" />
          </button>
        </div>
      )}

      {/* Success View */}
      {submitResult?.success ? (
        <div className="py-8 px-6 rounded-2xl bg-slate-50 border border-emerald-200 text-center space-y-5 animate-slide-up">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Inquiry Confirmed!</h2>
            <p className="text-sm text-slate-600 mt-1">{submitResult.message}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl text-left text-xs sm:text-sm space-y-2.5 border border-slate-200 shadow-sm text-slate-700 font-sans max-w-lg mx-auto">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Reference:</span>
              <span className="font-mono text-indigo-600 font-bold">{submitResult.data.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="text-slate-900 font-semibold">{submitResult.data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-900 font-medium">{submitResult.data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="text-slate-900 font-medium">{submitResult.data.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Company:</span>
              <span className="text-slate-900">{submitResult.data.company}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Product / Service:</span>
              <span className="text-indigo-600 font-bold">{submitResult.data.serviceName}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-400">Product ID:</span>
              <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded text-xs">
                #{submitResult.data.product_id || submitResult.data.productId}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-50">
              <span className="text-slate-400">Synced Systems:</span>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 font-semibold ${submitResult.data.erpSynced ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Check className="w-3 h-3 stroke-[3]" /> ERP Leads
                </span>
                <span className="text-slate-300">•</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${submitResult.data.cxproSynced ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Check className="w-3 h-3 stroke-[3]" /> CXPro Leads
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto sm:min-w-[240px] mx-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Submit Another Inquiry</span>
          </button>
        </div>
      ) : (
        /* Form Content */
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* 2. OUR SERVICES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] sm:text-xs">
                Our Services <span className="text-rose-500">*</span>
              </span>
              <span className="text-indigo-600 font-mono text-xs font-bold">
                ID: #{selectedService?.product_id || activeProductId}
              </span>
            </div>

            {/* Row 1: 4 items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {rowOneServices.map(renderServiceCard)}
            </div>

            {/* Row 2: 3 items */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {rowTwoServices.map(renderServiceCard)}
            </div>

            {touched.product && errors.product && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.product}</p>
            )}
          </div>

          {/* 3. INPUT FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <span>Name</span>
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-xs sm:text-sm py-2.5 sm:py-3 pl-10 pr-3 outline-none transition-all
                    ${errors.name && touched.name 
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'}
                  `}
                />
              </div>
              {touched.name && errors.name && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <span>Email</span>
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-xs sm:text-sm py-2.5 sm:py-3 pl-10 pr-3 outline-none transition-all
                    ${errors.email && touched.email 
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'}
                  `}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <span>Phone</span>
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <PhoneInputComponent
                  country={'sa'}
                  preferredCountries={['sa', 'ae', 'qa', 'kw', 'om', 'gb', 'us']}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('phone')}
                  disabled={isSubmitting}
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  containerClass="!w-full"
                  inputClass={`!w-full !h-[42px] !text-xs sm:!text-sm !rounded-xl !bg-slate-50 !text-slate-900 ${
                    errors.phone && touched.phone ? '!border-rose-400 !bg-rose-50/20' : '!border-slate-200 focus:!border-indigo-600 focus:!bg-white'
                  }`}
                  buttonClass="!border-none !bg-transparent !rounded-l-xl"
                  dropdownClass="!rounded-xl !shadow-2xl !border-slate-200 text-slate-800"
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <span>Company</span>
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="company"
                  placeholder="Your company or organization"
                  value={formData.company}
                  onChange={handleChange}
                  onBlur={() => handleBlur('company')}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl bg-slate-50 border text-slate-900 placeholder-slate-400 text-xs sm:text-sm py-2.5 sm:py-3 pl-10 pr-3 outline-none transition-all
                    ${errors.company && touched.company 
                      ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100'}
                  `}
                />
              </div>
              {touched.company && errors.company && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.company}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <span>Description</span>
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Tell us about your project requirements, integrations, or timeline..."
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-xs sm:text-sm p-3 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* 4. SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Book A Free Demo</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
