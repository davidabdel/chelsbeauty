
import React, { useState, useEffect, useMemo } from 'react';
import { TESTIMONIALS, GALLERY_ITEMS, FAQS } from './constants';
import { Category, PricingData, Service } from './types';

// Initial data fetch simulation
const INITIAL_PRICING_URL = './pricing.json';
const CONTACT_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/joEvTeHi9PfiwLqHNsZY/webhook-trigger/63ac8f27-84ea-4754-9591-14b85407c20f';

// --- Components ---

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-center leading-none ${className}`}>
    <span className="font-serif text-2xl md:text-3xl tracking-wide text-charcoal">Chels Essence</span>
    <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-gold -mt-1">Beauty</span>
  </div>
);

const Button = ({ children, variant = 'primary', onClick, className = "", type = "button", disabled = false }: any) => {
  const baseStyles = "px-8 py-3 rounded-full font-sans font-medium transition-all duration-300 tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-charcoal text-white hover:bg-gold",
    secondary: "bg-gold text-white hover:bg-charcoal",
    outline: "border border-charcoal text-charcoal hover:bg-charcoal hover:text-white",
    ghost: "text-charcoal hover:text-gold",
    danger: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const SectionHeading = ({ title, subtitle, centered = true }: { title: string, subtitle?: string, centered?: boolean }) => (
  <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
    <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4 italic">{title}</h2>
    {subtitle && <p className="font-sans text-sage uppercase tracking-widest text-xs font-semibold">{subtitle}</p>}
    <div className={`h-px w-24 bg-gold/30 mt-6 ${centered ? 'mx-auto' : ''}`} />
  </div>
);

const AdminLogin = ({ login, navigateTo }: { login: (p: string) => boolean, navigateTo: (p: string) => void }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pass)) {
      navigateTo('admin-pricing');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 shadow-xl">
        <Logo className="mb-8" />
        <h2 className="font-serif text-2xl text-center mb-6">Owner Access</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-sans uppercase tracking-widest text-charcoal/60 mb-2">Password</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-cream rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-gold transition-all"
              placeholder="Enter password"
              required
            />
            {error && <p className="text-red-500 text-xs mt-2">Incorrect password. Please try again.</p>}
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <div className="mt-8 text-center">
          <button onClick={() => navigateTo('home')} className="text-xs font-sans text-charcoal/40 uppercase tracking-widest hover:text-gold transition-colors">← Back to Site</button>
        </div>
      </div>
    </div>
  );
};

const AdminPricing = ({ isAuthenticated, pricing, logout, handleSavePricing, login, navigateTo, saveStatus }: any) => {
  if (!isAuthenticated) return <AdminLogin login={login} navigateTo={navigateTo} />;
  if (!pricing) return <div className="p-20 text-center font-serif">Loading...</div>;

  const [editData, setEditData] = useState<PricingData>({ ...pricing });

  // Update local state when prop changes to ensure sync (though usually pricing won't change under feet)
  // But safer to initialize state only once or use useEffect if needed.
  // Ideally, we just use initial state.

  const addCategory = () => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      sortOrder: editData.categories.length + 1,
      isActive: true,
      services: []
    };
    setEditData({ ...editData, categories: [...editData.categories, newCat] });
  };

  const deleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category and all its services?')) {
      setEditData({ ...editData, categories: editData.categories.filter(c => c.id !== id) });
    }
  };

  const addService = (catId: string) => {
    const updatedCats = editData.categories.map(cat => {
      if (cat.id === catId) {
        const newSvc: Service = {
          id: `svc-${Date.now()}`,
          name: 'New Service',
          price: 0,
          sortOrder: cat.services.length + 1,
          isActive: true,
          description: ''
        };
        return { ...cat, services: [...cat.services, newSvc] };
      }
      return cat;
    });
    setEditData({ ...editData, categories: updatedCats });
  };

  const updateService = (catId: string, svcId: string, updates: Partial<Service>) => {
    const updatedCats = editData.categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          services: cat.services.map(s => s.id === svcId ? { ...s, ...updates } : s)
        };
      }
      return cat;
    });
    setEditData({ ...editData, categories: updatedCats });
  };

  const deleteService = (catId: string, svcId: string) => {
    const updatedCats = editData.categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, services: cat.services.filter(s => s.id !== svcId) };
      }
      return cat;
    });
    setEditData({ ...editData, categories: updatedCats });
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCats = [...editData.categories];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newCats.length) return;
    [newCats[index], newCats[target]] = [newCats[target], newCats[index]];
    setEditData({ ...editData, categories: newCats.map((c, i) => ({ ...c, sortOrder: i + 1 })) });
  };

  const moveService = (catId: string, svcIndex: number, direction: 'up' | 'down') => {
    const updatedCats = editData.categories.map(cat => {
      if (cat.id === catId) {
        const svcs = [...cat.services];
        const target = direction === 'up' ? svcIndex - 1 : svcIndex + 1;
        if (target < 0 || target >= svcs.length) return cat;
        [svcs[svcIndex], svcs[target]] = [svcs[target], svcs[svcIndex]];
        return { ...cat, services: svcs.map((s, i) => ({ ...s, sortOrder: i + 1 })) };
      }
      return cat;
    });
    setEditData({ ...editData, categories: updatedCats });
  };

  return (
    <div className="pt-32 pb-24 bg-cream min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="font-serif text-3xl mb-2">Pricing Manager</h1>
            <p className="text-sm text-charcoal/50">Manage your menu, prices, and studio details.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={logout}>Logout</Button>
            <Button onClick={() => handleSavePricing(editData)} disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {saveStatus === 'saved' && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-8 border border-green-200 text-sm flex justify-between items-center">
            <span>Changes saved successfully to local storage!</span>
            {/* Download function needs to be moved or passed, let's omit download for now or duplicate logic? 
                Actually downloadPricingJSON was inside App. We can just pass it or move it. 
                Move downloadPricingJSON to utils or just define it here. 
                It uses pricing which is passed as prop. 
            */}
            <button onClick={() => {
              const blob = new Blob([JSON.stringify(editData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'pricing.json';
              a.click();
              URL.revokeObjectURL(url);
            }} className="font-bold underline">Download pricing.json for developer</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-serif text-lg mb-4">Studio Details</h3>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Location</label>
                <input value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} className="w-full bg-cream rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Phone</label>
                <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full bg-cream rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Booking Note</label>
                <input value={editData.note} onChange={e => setEditData({ ...editData, note: e.target.value })} className="w-full bg-cream rounded-md p-2 text-sm" />
              </div>
            </div>
            <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10 text-xs leading-relaxed text-gold/80 italic">
              Note: For changes outside pricing and services (branding, images, layouts), please contact your developer.
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-10">
            {editData.categories.map((cat, catIndex) => (
              <div key={cat.id} className="bg-white rounded-2xl p-8 shadow-sm border border-beige/50">
                <div className="flex justify-between items-center mb-6 gap-4">
                  <div className="flex-1">
                    <input
                      value={cat.name}
                      onChange={e => {
                        const newCats = [...editData.categories];
                        newCats[catIndex].name = e.target.value;
                        setEditData({ ...editData, categories: newCats });
                      }}
                      className="font-serif text-2xl text-charcoal bg-transparent border-b border-transparent focus:border-gold outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveCategory(catIndex, 'up')} className="p-2 hover:bg-cream rounded text-gold">↑</button>
                    <button onClick={() => moveCategory(catIndex, 'down')} className="p-2 hover:bg-cream rounded text-gold">↓</button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-red-50 text-red-500 rounded">✕</button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {cat.services.map((svc, svcIndex) => (
                    <div key={svc.id} className="group flex flex-col sm:flex-row gap-4 p-4 bg-cream/30 rounded-xl hover:bg-cream/60 transition-colors">
                      <div className="flex-1 space-y-2">
                        <input
                          placeholder="Service Name"
                          value={svc.name}
                          onChange={e => updateService(cat.id, svc.id, { name: e.target.value })}
                          className="bg-transparent font-medium text-sm w-full outline-none focus:text-gold"
                        />
                        <input
                          placeholder="Optional description"
                          value={svc.description}
                          onChange={e => updateService(cat.id, svc.id, { description: e.target.value })}
                          className="bg-transparent text-[11px] w-full outline-none italic text-charcoal/50"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white px-3 py-1 rounded border border-beige">
                          <span className="text-xs text-charcoal/40 mr-1">{editData.currencySymbol}</span>
                          <input
                            type="number"
                            value={svc.price}
                            onChange={e => updateService(cat.id, svc.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-12 text-sm font-serif outline-none"
                          />
                        </div>
                        <div className="flex gap-1 border-l border-beige pl-3">
                          <button onClick={() => moveService(cat.id, svcIndex, 'up')} className="text-xs text-gold">↑</button>
                          <button onClick={() => moveService(cat.id, svcIndex, 'down')} className="text-xs text-gold">↓</button>
                          <button onClick={() => deleteService(cat.id, svc.id)} className="text-xs text-red-400">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="text-xs py-2 px-4 border border-dashed border-beige" onClick={() => addService(cat.id)}>
                  + Add Service to {cat.name}
                </Button>
              </div>
            ))}

            <button
              onClick={addCategory}
              className="w-full py-6 border-2 border-dashed border-gold/20 rounded-2xl font-serif text-xl text-gold/40 hover:text-gold hover:border-gold/40 hover:bg-white transition-all"
            >
              + Add New Pricing Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Auth Hook ---
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('ceb_admin_session'));

  const login = (password: string) => {
    // Simple check against env variable
    const adminPass = process.env.ADMIN_PASSWORD || 'ChelsAdmin3621';
    if (password === adminPass) {
      localStorage.setItem('ceb_admin_session', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('ceb_admin_session');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const { isAuthenticated, login, logout } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Load Pricing Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = localStorage.getItem('ceb_pricing_data');
        if (savedData) {
          setPricing(JSON.parse(savedData));
        } else {
          const res = await fetch(INITIAL_PRICING_URL);
          const data = await res.json();
          setPricing(data);
        }
      } catch (err) {
        console.error("Failed to load pricing", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page: string) => {
    setActivePage(page);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePricing = async (newData: PricingData) => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('ceb_pricing_data', JSON.stringify(newData));
      setPricing(newData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const downloadPricingJSON = () => {
    if (!pricing) return;
    const blob = new Blob([JSON.stringify(pricing, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricing.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('submitting');
    try {
      const response = await fetch(CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactForm,
          source: 'Chels Essence Beauty Website',
          submittedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setContactStatus('success');
        setContactForm({ name: '', phone: '', message: '' });
      } else {
        setContactStatus('error');
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setContactStatus('error');
    }
  };

  // --- Views ---

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-80"
            alt="Beauty Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <span className="font-sans text-gold uppercase tracking-[0.3em] text-xs mb-4 block">Based in {pricing?.location || 'Kellyville'}</span>
            <h1 className="font-serif text-5xl md:text-7xl text-charcoal mb-6 leading-tight">
              Enhance Your <br />
              <span className="italic">Natural Beauty</span>
            </h1>
            <p className="font-sans text-charcoal/70 text-lg mb-8 max-w-md leading-relaxed">
              Premium brow, lash and beauty treatments tailored to you. Experience a moment of calm and luxury.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigateTo('contact')}>Book Now</Button>
              <Button variant="outline" onClick={() => navigateTo('services')}>View Pricing</Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-charcoal/60 font-sans">
              <span>By Appointment</span>
              <span className="w-1 h-1 bg-gold rounded-full" />
              <span>{pricing?.note || 'Limited Spots Available'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section (Home) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeading title="Signature Services" subtitle="Pricing Highlights" />
          <div className="max-w-3xl mx-auto space-y-4">
            {pricing?.categories.filter(c => c.isActive).slice(0, 3).map(cat => (
              <div key={cat.id} className="group p-6 bg-cream rounded-xl hover:bg-blush/20 transition-all">
                <h4 className="font-serif text-xl mb-4 border-b border-gold/10 pb-2">{cat.name}</h4>
                <div className="space-y-3">
                  {cat.services.filter(s => s.isActive).slice(0, 2).map(s => (
                    <div key={s.id} className="flex justify-between items-center text-sm">
                      <span className="font-sans">{s.name}</span>
                      <span className="font-serif font-bold text-gold">{pricing.currencySymbol}{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-center mt-12">
              <Button variant="outline" onClick={() => navigateTo('services')}>View Full Menu</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <SectionHeading title="Client Stories" subtitle="Kind Words" />
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white p-8 rounded-2xl relative shadow-sm">
                <div className="flex text-gold mb-4">
                  {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="font-sans text-charcoal/70 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {t.initials}
                  </div>
                  <span className="font-serif text-sm font-semibold">{t.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderServices = () => (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <SectionHeading title="Services & Pricing" subtitle="The Menu" />
        <div className="max-w-4xl mx-auto">
          {pricing?.categories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(cat => (
            <div key={cat.id} className="mb-16">
              <h3 className="font-serif text-2xl text-charcoal mb-8 border-b border-gold/20 pb-2 flex items-center justify-between">
                <span>{cat.name}</span>
              </h3>
              <div className="space-y-6">
                {cat.services.filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(s => (
                  <div key={s.id} className="flex justify-between items-start group">
                    <div>
                      <h4 className="font-sans font-medium text-charcoal group-hover:text-gold transition-colors">{s.name}</h4>
                      {s.description && <p className="text-charcoal/50 text-xs mt-1 italic">{s.description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-px w-12 bg-gold/20 hidden md:block" />
                      <span className="font-serif text-lg font-bold text-gold">{pricing.currencySymbol}{s.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blush/20 p-8 rounded-2xl mt-16 border border-blush/40">
            <h4 className="font-serif text-xl mb-4">Important Information</h4>
            <div className="grid md:grid-cols-2 gap-8 text-sm font-sans text-charcoal/70 leading-relaxed">
              <div>
                <p className="font-bold text-charcoal mb-2">Arrival Time</p>
                <p>Please arrive 5 minutes prior to your appointment to settle in and complete any necessary forms.</p>
              </div>
              <div>
                <p className="font-bold text-charcoal mb-2">Location & Bookings</p>
                <p>Studio in {pricing?.location}. Phone: {pricing?.phone}. {pricing?.note}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



  const renderGallery = () => (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <SectionHeading title="Treatment Gallery" subtitle="Our Work" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {GALLERY_ITEMS.map(item => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]">
              <img src={item.url} alt={item.alt} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
                <p className="text-white font-sans text-sm tracking-wide">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeading title="About the Studio" subtitle="Our Philosophy" />
          <div className="prose prose-lg mx-auto font-sans text-charcoal/70 leading-relaxed mb-16">
            <p>Welcome to Chels Essence Beauty. Located in Kellyville, we specialize in high-precision lash and brow artistry.</p>
            <img src="/about-studio.png" className="rounded-2xl my-8 w-full shadow-lg" alt="Studio View" />
          </div>
          <h3 className="font-serif text-3xl text-charcoal mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-beige rounded-xl p-6">
                <h4 className="font-serif text-lg text-charcoal mb-2">{faq.question}</h4>
                <p className="text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <SectionHeading title="Book Your Escape" subtitle="Contact Us" />
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3 space-y-8">
            <div>
              <h4 className="font-serif text-xl mb-4">Get in Touch</h4>
              <p className="font-sans text-charcoal/60 text-sm mb-6">DM us on Instagram or use the form below.</p>
              <div className="space-y-4 text-sm font-sans">
                <a href={`tel:${pricing?.phone.replace(/\s/g, '')}`} className="flex items-center gap-4 hover:text-gold transition-colors">
                  <span className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">📞</span>
                  {pricing?.phone}
                </a>
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">📍</span>
                  {pricing?.location}, NSW
                </div>
              </div>
            </div>
            <div className="p-6 bg-blush/20 rounded-2xl">
              <p className="font-serif text-lg mb-2 italic">{pricing?.note}</p>
            </div>
          </div>
          <div className="md:w-2/3 bg-white p-12 rounded-2xl shadow-xl shadow-charcoal/5">
            {contactStatus === 'success' ? (
              <div className="text-center py-12 space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                <h3 className="font-serif text-2xl text-charcoal">Message Sent Successfully</h3>
                <p className="text-charcoal/60 font-sans max-w-sm mx-auto">Thank you for reaching out! We have received your enquiry and will be in touch with you shortly.</p>
                <Button variant="outline" onClick={() => setContactStatus('idle')}>Send Another Message</Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-widest text-charcoal/60 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full bg-cream rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-gold transition-all"
                      placeholder="Your name"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-widest text-charcoal/60 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full bg-cream rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-gold transition-all"
                      placeholder="Phone number"
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-charcoal/60 mb-2">Message</label>
                  <textarea
                    className="w-full bg-cream rounded-lg px-4 py-3 h-32 outline-none focus:ring-1 focus:ring-gold transition-all"
                    placeholder="Tell us about the services you're interested in..."
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>
                {contactStatus === 'error' && (
                  <p className="text-red-500 text-xs text-center">Something went wrong. Please try again or DM us on Instagram.</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={contactStatus === 'submitting'}
                >
                  {contactStatus === 'submitting' ? 'Sending...' : 'Send Enquiry'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream selection:bg-gold/30">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={() => navigateTo('home')} className="hover:opacity-70 transition-opacity">
            <Logo />
          </button>
          <nav className="hidden md:flex items-center gap-10">
            {['home', 'services', 'gallery', 'about', 'contact'].map(item => (
              <button
                key={item}
                onClick={() => navigateTo(item)}
                className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-colors ${activePage === item ? 'text-gold' : 'text-charcoal hover:text-gold'}`}
              >
                {item}
              </button>
            ))}
            <Button variant="primary" onClick={() => navigateTo('contact')} className="ml-4 py-2 text-xs">Book Now</Button>
          </nav>
          <button className="md:hidden text-charcoal" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[60] bg-white transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8">
          <button className="absolute top-8 right-8 text-3xl font-light" onClick={() => setIsMenuOpen(false)}>&times;</button>
          <div className="flex flex-col gap-8 mt-20 items-center">
            {['home', 'services', 'gallery', 'about', 'contact'].map(item => (
              <button key={item} onClick={() => navigateTo(item)} className="font-serif text-3xl capitalize text-charcoal">{item}</button>
            ))}
          </div>
        </div>
      </div>

      <main>
        {activePage === 'home' && renderHome()}
        {activePage === 'services' && renderServices()}
        {activePage === 'gallery' && renderGallery()}
        {activePage === 'about' && renderAbout()}
        {activePage === 'contact' && renderContact()}
        {activePage === 'admin-login' && <AdminLogin login={login} navigateTo={navigateTo} />}
        {activePage === 'admin-pricing' && <AdminPricing
          isAuthenticated={isAuthenticated}
          pricing={pricing}
          logout={logout}
          handleSavePricing={handleSavePricing}
          saveStatus={saveStatus}
          login={login}
          navigateTo={navigateTo}
        />}
      </main>

      <footer className="bg-white py-20 border-t border-cream">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <Logo />
          <div className="flex gap-8 font-sans text-[10px] uppercase tracking-widest text-charcoal/60">
            <button onClick={() => navigateTo('home')}>Home</button>
            <button onClick={() => navigateTo('services')}>Pricing</button>
            <button onClick={() => navigateTo('admin-login')}>Admin</button>
          </div>
          <div className="text-right">
            <p className="font-serif italic text-charcoal">{pricing?.phone}</p>
            <p className="font-sans text-[10px] uppercase tracking-widest text-gold">{pricing?.location}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}