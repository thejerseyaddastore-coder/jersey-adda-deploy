import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../api/http';
import toast from 'react-hot-toast';

const SettingsPage = ({ adminToken }) => {
  const navigate = useNavigate();
  const defaultTemplate = `DETAILS
ORDER NO:- {{order_number}}
NAME: {{customer_name}}
PH No:- {{customer_phone}}
ADDRESS:- {{customer_address}}
PINCODE:- {{postal_code}}
JERSEY:- {{order_items}}
TOTAL:- ₹{{total_amount}}
DATE:- {{order_date}}`;
  const [settings, setSettings] = useState({ whatsapp_number: '', whatsapp_message_template: defaultTemplate });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await http.get('/settings');
        setSettings({
          whatsapp_number: data?.data?.whatsapp_number || data?.whatsapp_number || '',
          whatsapp_message_template: data?.data?.whatsapp_message_template || data?.whatsapp_message_template || defaultTemplate,
        });
      } catch (error) {
        toast.error('Failed to load settings.');
        setSettings({ whatsapp_number: '', whatsapp_message_template: '' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    
    const num = (settings?.whatsapp_number || '').trim();
    const template = (settings?.whatsapp_message_template || '').trim();
    if (!num) {
      toast.error('WhatsApp number is required.');
      return;
    }
    if (!/^\+[1-9]\d{1,14}$/.test(num)) {
      toast.error('Please enter a valid WhatsApp number starting with + and country code (e.g. +919876543210).');
      return;
    }
    if (!template) {
      toast.error('WhatsApp message template is required.');
      return;
    }

    setIsSaving(true);
    try {
      await http.put('/settings', { whatsapp_number: num, whatsapp_message_template: template }, {
        headers: {
          'Authorization': `Bearer ${adminToken || window.localStorage.getItem('jerseyAddaAdminToken') || ''}`
        }
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const sampleData = {
    order_number: 'ORD-10001',
    customer_name: 'Rahul Sharma',
    customer_phone: '+919876543210',
    customer_address: '123 Main Road, Flat 4B, Indiranagar, Bangalore, Karnataka - 560038',
    postal_code: '560048',
    order_items: '- Real Madrid 24/25 Jersey (M) x 1 - Price: ₹1,500\n- Arsenal 24/25 Home Jersey (L) x 2 - Price: ₹3,000',
    order_items_with_images: `1.\n\nReal Madrid 24/25 Jersey\n\nSize: M\n\nQuantity: 1\n\nPrice: ₹1500\n\nImage:\nhttps://jerseyadda.in/images/real-madrid.jpg\n\n---\n\n2.\n\nArsenal 24/25 Home Jersey\n\nSize: L\n\nQuantity: 2\n\nPrice: ₹1500\n\nImage:\nhttps://jerseyadda.in/images/arsenal.jpg\n\n---\n`,
    order_items_with_links: `1.\n\nReal Madrid 24/25 Jersey\n\nSize: M\n\nQuantity: 1\n\nPrice: ₹1500\n\nImage:\nhttps://jerseyadda.in/images/real-madrid.jpg\n\n---\n\n2.\n\nArsenal 24/25 Home Jersey\n\nSize: L\n\nQuantity: 2\n\nPrice: ₹1500\n\nImage:\nhttps://jerseyadda.in/images/arsenal.jpg\n\n---\n`,
    total_amount: '4,500',
    order_date: new Date().toLocaleDateString('en-IN')
  };

  const renderPreview = (template) => {
    if (!template) return '';
    return template
      .replace(/\{\{order_number\}\}/g, sampleData.order_number)
      .replace(/\{\{customer_name\}\}/g, sampleData.customer_name)
      .replace(/\{\{customer_phone\}\}/g, sampleData.customer_phone)
      .replace(/\{\{customer_address\}\}/g, sampleData.customer_address)
      .replace(/\{\{order_items_with_images\}\}/g, sampleData.order_items_with_images)
      .replace(/\{\{order_items_with_links\}\}/g, sampleData.order_items_with_links)
      .replace(/\{\{order_items\}\}/g, sampleData.order_items)
      .replace(/\{\{total_amount\}\}/g, sampleData.total_amount)
      .replace(/\{\{postal_code\}\}/g, sampleData.postal_code)
      .replace(/\{\{order_date\}\}/g, sampleData.order_date);
  };

  return (
    <main className="page admin-page" style={{ paddingBottom: '60px' }}>
      {/* Back Navigation Button */}
      <div style={{ margin: '20px 0 16px' }}>
        <button
          onClick={() => navigate(-1)}
          className="action-button action-button--ghost"
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            padding: '10px 20px',
            borderRadius: '999px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.04)',
            color: 'inherit',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '16px', height: '16px' }}
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Header section */}
      <section className="hero hero--compact admin-hero" style={{ marginBottom: '30px' }}>
        <p className="eyebrow">Store Configuration</p>
        <h1>Admin Settings</h1>
        <p className="lede">
          Configure systems settings, notification channels, and order checkout integrations.
        </p>
      </section>

      {/* Grid Layout for settings configuration */}
      <div className="admin-layout">
        
        {/* Settings form panel */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <form className="admin-form" onSubmit={handleUpdate}>
            <div className="section-head" style={{ marginBottom: '16px', display: 'block' }}>
              <p className="eyebrow" style={{ color: 'var(--accent)' }}>Checkout Channel</p>
              <h2 style={{ fontSize: '1.5rem', margin: '4px 0 0', fontWeight: 'bold' }}>WhatsApp Notifications</h2>
            </div>

            <p className="lede" style={{ margin: '0 0 24px', fontSize: '0.95rem', color: 'var(--muted)' }}>
              Configure the WhatsApp receiver. When a customer checks out, their complete order overview (items, size, quantity, address) is sent directly to this number.
            </p>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
              <label className="search-box">
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  WhatsApp Number (with Country Code)
                </span>
                <input
                  id="whatsapp_number"
                  type="text"
                  value={settings?.whatsapp_number || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="e.g. +919876543210"
                  style={{
                    fontSize: '1.1rem',
                    letterSpacing: '0.03em',
                    padding: '16px',
                  }}
                />
              </label>

              <label className="search-box" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  WhatsApp Message Template
                </span>
                <textarea
                  id="whatsapp_message_template"
                  value={settings?.whatsapp_message_template || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_message_template: e.target.value })}
                  placeholder="Enter message template..."
                  rows={12}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--cream)',
                    border: '1px solid var(--border)',
                    borderRadius: '0',
                    color: 'var(--text)',
                    padding: '16px',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    lineHeight: '1.4',
                    resize: 'vertical',
                    outline: 'none',
                    marginTop: '4px',
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>Available Placeholders:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {['{{order_number}}', '{{customer_name}}', '{{customer_phone}}', '{{customer_address}}', '{{postal_code}}', '{{order_items}}', '{{order_items_with_images}}', '{{order_items_with_links}}', '{{total_amount}}', '{{order_date}}'].map(ph => (
                      <code key={ph} style={{ background: '#111827', padding: '6px 10px', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', borderRadius: '6px' }}>{ph}</code>
                    ))}
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <div className="admin-submit-row">
                <button
                  type="submit"
                  className="action-button"
                  disabled={isSaving}
                  style={{
                    minWidth: '160px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                  }}
                >
                  {isSaving ? (
                    <>
                      <div
                        className="animate-spin"
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(0,0,0,0.2)',
                          borderTopColor: '#0f1115',
                          borderRadius: '50%',
                        }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: '18px', height: '18px' }}
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Live Preview / Help panel */}
        <aside className="panel" style={{ background: 'var(--panel-strong)', borderStyle: 'dashed' }}>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Live Preview</p>
          <h2 style={{ fontSize: '1.5rem', margin: '4px 0 16px', fontWeight: 'bold' }}>Message Format</h2>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '20px' }}>
            Orders placed on your store will trigger a pre-filled WhatsApp message. Here's a sample of what you'll receive:
          </p>

          <div
            style={{
              background: '#0b141a',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              backgroundImage: 'radial-gradient(rgba(18,140,126,0.15) 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* WhatsApp Header bar mock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '10px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#128c7e',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#a8b0bf', fontWeight: 'bold' }}>
                Store Order Bot
              </span>
            </div>

            {/* Bubble */}
            <div
              style={{
                background: '#056162',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px 8px 0 8px',
                fontSize: '0.82rem',
                lineHeight: '1.4',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                marginLeft: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {renderPreview(settings?.whatsapp_message_template) || 'Enter template text to preview...'}
            </div>

            <div style={{ textAlign: 'right', marginTop: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                Just now • Delivered
              </span>
            </div>
          </div>

          <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.6' }}>
            <h4 style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '8px' }}>Setup Instructions:</h4>
            <ul style={{ paddingLeft: '16px', margin: '0', display: 'grid', gap: '8px' }}>
              <li>Enter numbers with <strong style={{ color: 'var(--accent)' }}>+</strong> and the country code (e.g. <code>+91</code> for India, <code>+1</code> for US).</li>
              <li>Do not include any spaces, hyphens, or brackets in the input.</li>
              <li>Make sure the number is active on WhatsApp to start receiving orders immediately.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default SettingsPage;
