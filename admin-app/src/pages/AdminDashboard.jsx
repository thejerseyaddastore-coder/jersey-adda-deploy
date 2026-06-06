import { useEffect, useMemo, useState } from 'react';

import { createAdminJersey, deleteAdminJersey, listAdminJerseys, updateAdminJersey } from '../api/admin';
import { getJerseyImages } from '../utils/image';

const defaultForm = {
  slug: '',
  name: '',
  team_name: '',
  league_name: 'International',
  description: '',
  price: '0',
  is_national_team: true,
  has_shorts: false,
  sleeve_type: 'HALF',
  version_type: 'PLAYER',
  featured_club: '',
  available_sizes: 'S,M,L,XL,2XL'
};

const featuredClubOptions = [
  { label: 'None', value: '' },
  { label: 'Barcelona', value: 'BARCELONA' },
  { label: 'Real Madrid', value: 'REAL_MADRID' },
  { label: 'Manchester United', value: 'MAN_UNITED' },
  { label: 'AC Milan', value: 'AC_MILAN' }
];

function toBooleanString(value) {
  return value ? 'true' : 'false';
}

function createFormData(form, files) {
  const formData = new FormData();

  const normalizeSize = (size) => {
    const normalized = String(size || '').trim().toUpperCase();
    if (normalized === 'ZXL' || normalized === 'XXL') {
      return '2XL';
    }

    return normalized;
  };

  Object.entries(form).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    if (key === 'available_sizes') {
      const sizes = String(value)
        .split(',')
        .map((size) => normalizeSize(size))
        .filter(Boolean);

      if (sizes.length > 0) {
        formData.append(key, JSON.stringify(sizes));
      }

      return;
    }

    formData.append(key, typeof value === 'boolean' ? toBooleanString(value) : String(value));
  });

  files.slice(0, 5).forEach((file, index) => {
    formData.append(`image_${index + 1}`, file);
  });

  return formData;
}

function mapJerseyToForm(jersey) {
  if (!jersey) return defaultForm;

  return {
    slug: jersey.slug || '',
    name: jersey.name || '',
    team_name: jersey.team_name || '',
    league_name: jersey.league_name || 'International',
    description: jersey.description || '',
    price: String(jersey.price ?? '0'),
    is_national_team: Boolean(jersey.is_national_team),
    has_shorts: Boolean(jersey.has_shorts),
    sleeve_type: jersey.sleeve_type || 'HALF',
    version_type: jersey.version_type || 'PLAYER',
    featured_club: jersey.featured_club || '',
    available_sizes: Array.isArray(jersey.available_sizes) ? jersey.available_sizes.join(',') : 'S,M,L,XL,2XL'
  };
}

function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.scope === 'NATIONAL') params.set('national_team', 'true');
  if (filters.scope === 'CLUBS') params.set('national_team', 'false');
  if (filters.shorts === 'INCLUDED') params.set('has_shorts', 'true');
  if (filters.shorts === 'NOT_INCLUDED') params.set('has_shorts', 'false');
  if (filters.sleeve !== 'ALL') params.set('sleeve_type', filters.sleeve);
  if (filters.version !== 'ALL') params.set('version_type', filters.version);
  if (filters.team) params.set('team', filters.team);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export default function AdminDashboard({ adminPassword, onLogout, onOpenPublic }) {
  const [jerseys, setJerseys] = useState([]);
  const [selectedJerseyId, setSelectedJerseyId] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');
  const [form, setForm] = useState(defaultForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    scope: 'ALL',
    shorts: 'ALL',
    sleeve: 'ALL',
    version: 'ALL',
    team: ''
  });

  const selectedJersey = useMemo(
    () => jerseys.find((jersey) => jersey.id === selectedJerseyId) || null,
    [jerseys, selectedJerseyId]
  );

  const teams = useMemo(
    () => ['All', ...new Set(jerseys.map((jersey) => jersey.team_name).filter(Boolean))],
    [jerseys]
  );

  const filteredJerseys = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return jerseys.filter((jersey) => {
      const matchesSearch =
        searchValue.length === 0 ||
        [jersey.name, jersey.team_name, jersey.league_name, jersey.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchValue);

      const matchesScope =
        filters.scope === 'ALL' ||
        (filters.scope === 'NATIONAL' && jersey.is_national_team) ||
        (filters.scope === 'CLUBS' && !jersey.is_national_team);

      const matchesShorts =
        filters.shorts === 'ALL' ||
        (filters.shorts === 'INCLUDED' && jersey.has_shorts) ||
        (filters.shorts === 'NOT_INCLUDED' && !jersey.has_shorts);

      const matchesSleeve = filters.sleeve === 'ALL' || jersey.sleeve_type === filters.sleeve;
      const matchesVersion = filters.version === 'ALL' || jersey.version_type === filters.version;
      const matchesTeam = filters.team === '' || filters.team === 'All' || jersey.team_name === filters.team;

      return matchesSearch && matchesScope && matchesShorts && matchesSleeve && matchesVersion && matchesTeam;
    });
  }, [filters, jerseys]);

  useEffect(() => {
    if (selectedJersey) {
      setForm(mapJerseyToForm(selectedJersey));
      setFiles([]);
    }
  }, [selectedJersey]);

  useEffect(() => {
    let active = true;

    async function loadJerseys() {
      setLoading(true);
      setError('');

      try {
        const response = await listAdminJerseys(adminPassword, buildQuery(filters));
        if (!active) return;

        const items = response.data?.items || [];
        setJerseys(items);
        setSelectedJerseyId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id || ''));
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Failed to load jerseys');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadJerseys();

    return () => {
      active = false;
    };
  }, [adminPassword, filters]);

  const resetForm = () => {
    setSelectedJerseyId('');
    setForm(defaultForm);
    setFiles([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!adminPassword) {
      setError('Admin password is required');
      return;
    }

    if (files.length === 0 && !selectedJersey) {
      setError('At least one image is required for new jerseys');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = createFormData(form, files);
      const isNew = !selectedJersey;
      const response = selectedJersey
        ? await updateAdminJersey(adminPassword, selectedJersey.id, payload)
        : await createAdminJersey(adminPassword, payload);

      setMessage(isNew ? 'Jersey created' : 'Jersey updated');
      const updatedJerseys = await listAdminJerseys(adminPassword, buildQuery(filters));
      setJerseys(updatedJerseys.data?.items || []);

      if (response.data?.id) {
        setSelectedJerseyId(response.data.id);
      }
      setFiles([]);
      if (isNew) {
        setActiveTab('catalog'); // Automatically switch to catalog tab on new jersey creation
      }
    } catch (submitError) {
      setError(submitError.message || 'Failed to save jersey');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJersey || !adminPassword) return;

    const confirmed = window.confirm(`Delete ${selectedJersey.name}?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await deleteAdminJersey(adminPassword, selectedJersey.id);
      const updatedJerseys = await listAdminJerseys(adminPassword, buildQuery(filters));
      setJerseys(updatedJerseys.data?.items || []);
      resetForm();
      setMessage('Jersey deleted');
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete jersey');
    } finally {
      setSaving(false);
    }
  };

  const currentImages = selectedJersey ? getJerseyImages(selectedJersey) : [];

  return (
    <main className="page admin-page">
      <section className="hero hero--compact admin-hero">
        <p className="eyebrow">Admin</p>
        <h1>Manage jerseys and filters</h1>
        <p className="lede">Use the same filter set as the storefront to find jerseys by team type, shorts, sleeve, and version.</p>

        <div className="filters">
          <div className="admin-actions">
            <button type="button" className="action-button action-button--ghost" onClick={onOpenPublic}>Public site</button>
            <button type="button" className="action-button action-button--danger" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'catalog' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTab('catalog');
          }}
        >
          Catalog
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'new_jersey' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTab('new_jersey');
            resetForm();
          }}
        >
          New Jersey
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <section className="admin-layout">
          <aside className="panel admin-list">
            <div className="section-head">
              <div>
                <p className="eyebrow">Filters</p>
                <h2>Find jerseys faster</h2>
              </div>
            </div>

            <div className="admin-filter-grid">
              <label className="search-box">
                <span>Search</span>
                <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Team, description, league..." />
              </label>

              <label className="search-box">
                <span>Nation teams / clubs</span>
                <select value={filters.scope} onChange={(event) => setFilters({ ...filters, scope: event.target.value })}>
                  <option value="ALL">All jerseys</option>
                  <option value="NATIONAL">National teams</option>
                  <option value="CLUBS">Clubs</option>
                </select>
              </label>

              <label className="search-box">
                <span>Shorts</span>
                <select value={filters.shorts} onChange={(event) => setFilters({ ...filters, shorts: event.target.value })}>
                  <option value="ALL">All</option>
                  <option value="INCLUDED">Included</option>
                  <option value="NOT_INCLUDED">Not included</option>
                </select>
              </label>

              <label className="search-box">
                <span>Sleeve</span>
                <select value={filters.sleeve} onChange={(event) => setFilters({ ...filters, sleeve: event.target.value })}>
                  <option value="ALL">All</option>
                  <option value="HALF">Half</option>
                  <option value="FULL">Full</option>
                </select>
              </label>

              <label className="search-box">
                <span>Version</span>
                <select value={filters.version} onChange={(event) => setFilters({ ...filters, version: event.target.value })}>
                  <option value="ALL">All</option>
                  <option value="PLAYER">Player</option>
                  <option value="FAN">Fan</option>
                </select>
              </label>

              <label className="search-box">
                <span>Team</span>
                <select value={filters.team} onChange={(event) => setFilters({ ...filters, team: event.target.value })}>
                  {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </label>
            </div>

            {error && activeTab === 'catalog' && !selectedJersey ? <p className="state state--error">{error}</p> : null}
            {message && activeTab === 'catalog' && !selectedJersey ? <p className="state">{message}</p> : null}

            <div className="section-head admin-list__header">
              <div>
                <p className="eyebrow">Results</p>
                <h2>{loading ? 'Loading...' : `${filteredJerseys.length} saved jerseys`}</h2>
              </div>
            </div>

            <div className="admin-list__items">
              {filteredJerseys.map((jersey) => (
                <button key={jersey.id} type="button" className={`admin-list__item ${selectedJerseyId === jersey.id ? 'is-active' : ''}`} onClick={() => setSelectedJerseyId(jersey.id)}>
                  <span>{jersey.name}</span>
                  <small>{jersey.team_name}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="panel admin-form-panel">
            {selectedJersey ? (
              <>
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Edit jersey</p>
                    <h2>{selectedJersey.name}</h2>
                  </div>
                  <button type="button" className="action-button action-button--danger" onClick={handleDelete}>Delete jersey</button>
                </div>

                {error ? <p className="state state--error">{error}</p> : null}
                {message ? <p className="state">{message}</p> : null}

                <form className="admin-form" onSubmit={handleSubmit}>
                  <div className="admin-grid">
                    <label className="search-box"><span>Slug</span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
                    <label className="search-box"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
                    <label className="search-box"><span>Team</span><input value={form.team_name} onChange={(event) => setForm({ ...form, team_name: event.target.value })} /></label>
                    <label className="search-box"><span>League</span><input value={form.league_name} onChange={(event) => setForm({ ...form, league_name: event.target.value })} /></label>
                    <label className="search-box"><span>Price</span><input type="number" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
                    <label className="search-box"><span>Featured club</span><select value={form.featured_club} onChange={(event) => setForm({ ...form, featured_club: event.target.value })}>{featuredClubOptions.map((option) => (<option key={option.value || 'none'} value={option.value}>{option.label}</option>))}</select></label>
                    <label className="search-box"><span>Sleeve</span><select value={form.sleeve_type} onChange={(event) => setForm({ ...form, sleeve_type: event.target.value })}><option value="HALF">HALF</option><option value="FULL">FULL</option></select></label>
                    <label className="search-box"><span>Version</span><select value={form.version_type} onChange={(event) => setForm({ ...form, version_type: event.target.value })}><option value="PLAYER">PLAYER</option><option value="FAN">FAN</option></select></label>
                    <label className="search-box"><span>National team</span><select value={toBooleanString(form.is_national_team)} onChange={(event) => setForm({ ...form, is_national_team: event.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></label>
                    <label className="search-box"><span>Has shorts</span><select value={toBooleanString(form.has_shorts)} onChange={(event) => setForm({ ...form, has_shorts: event.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></label>
                    <label className="search-box"><span>Available sizes</span><input value={form.available_sizes} onChange={(event) => setForm({ ...form, available_sizes: event.target.value })} placeholder="S,M,L,XL,2XL (XXL/ZXL accepted)" /></label>
                  </div>

                  <label className="search-box admin-textarea">
                    <span>Description</span>
                    <textarea rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                  </label>

                  <div className="search-box">
                    <span>Images (1-5)</span>
                    <div 
                      style={{
                        border: '1px solid var(--border)',
                        padding: '24px',
                        textAlign: 'center',
                        background: 'var(--panel-strong)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => document.getElementById('admin_file_input').click()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)', marginBottom: '4px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Tap to upload new photos
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        Supports PNG, JPG, JPEG (Max 8MB per image)
                      </span>
                      <input
                        id="admin_file_input"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(event) => {
                          const selected = Array.from(event.target.files || []);
                          if (selected.length > 5) {
                            setError('Maximum 5 images are allowed');
                            setFiles(selected.slice(0, 5));
                          } else {
                            setError('');
                            setFiles(selected);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text)' }}>
                        Selected Files for Upload ({files.length}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {files.map((file, idx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div 
                              key={`${file.name}-${idx}`} 
                              style={{
                                position: 'relative',
                                width: '80px',
                                height: '80px',
                                overflow: 'hidden',
                                border: '1px solid var(--border)'
                              }}
                            >
                              <img src={url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFiles(files.filter((_, i) => i !== idx));
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: '#fff',
                                  border: 0,
                                  width: '20px',
                                  height: '20px',
                                  display: 'grid',
                                  placeItems: 'center',
                                  cursor: 'pointer',
                                  fontSize: '10px',
                                  lineHeight: 1
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="admin-hint">
                    <strong>Current images:</strong>
                    <div className="admin-preview-grid">
                      {currentImages.map((image, index) => (
                        <img key={`${image}-${index}`} src={image} alt={`Current jersey ${index + 1}`} />
                      ))}
                    </div>
                    <p>Uploading new files replaces the current image set.</p>
                  </div>

                  <div className="admin-submit-row">
                    <button type="submit" className="action-button" disabled={saving}>{saving ? 'Saving...' : 'Update jersey'}</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-24 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-charcoal/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-heading font-extrabold uppercase tracking-wider text-charcoal/60">No jersey selected</p>
                <p className="text-sm text-charcoal/40 font-sans mt-2">Select a jersey from the catalog list on the left to edit its details.</p>
              </div>
            )}
          </section>
        </section>
      ) : (
        /* New Jersey Tab Form */
        <section className="admin-layout single-panel">
          <section className="panel admin-form-panel w-full">
            <div className="section-head">
              <div>
                <p className="eyebrow">New jersey</p>
                <h2>Start a new product</h2>
              </div>
            </div>

            {error ? <p className="state state--error">{error}</p> : null}
            {message ? <p className="state">{message}</p> : null}

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-grid">
                <label className="search-box"><span>Slug (Optional)</span><input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Auto-generated if empty" /></label>
                <label className="search-box"><span>Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Real Madrid 26-27 Home" /></label>
                <label className="search-box"><span>Team</span><input value={form.team_name} onChange={(event) => setForm({ ...form, team_name: event.target.value })} placeholder="Real Madrid" /></label>
                <label className="search-box"><span>League</span><input value={form.league_name} onChange={(event) => setForm({ ...form, league_name: event.target.value })} placeholder="La Liga" /></label>
                <label className="search-box"><span>Price (INR)</span><input type="number" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
                <label className="search-box"><span>Featured club</span><select value={form.featured_club} onChange={(event) => setForm({ ...form, featured_club: event.target.value })}>{featuredClubOptions.map((option) => (<option key={option.value || 'none'} value={option.value}>{option.label}</option>))}</select></label>
                <label className="search-box"><span>Sleeve</span><select value={form.sleeve_type} onChange={(event) => setForm({ ...form, sleeve_type: event.target.value })}><option value="HALF">HALF</option><option value="FULL">FULL</option></select></label>
                <label className="search-box"><span>Version</span><select value={form.version_type} onChange={(event) => setForm({ ...form, version_type: event.target.value })}><option value="PLAYER">PLAYER</option><option value="FAN">FAN</option></select></label>
                <label className="search-box"><span>National team</span><select value={toBooleanString(form.is_national_team)} onChange={(event) => setForm({ ...form, is_national_team: event.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></label>
                <label className="search-box"><span>Has shorts</span><select value={toBooleanString(form.has_shorts)} onChange={(event) => setForm({ ...form, has_shorts: event.target.value === 'true' })}><option value="true">Yes</option><option value="false">No</option></select></label>
                <label className="search-box"><span>Available sizes</span><input value={form.available_sizes} onChange={(event) => setForm({ ...form, available_sizes: event.target.value })} placeholder="S,M,L,XL,2XL (XXL/ZXL accepted)" /></label>
              </div>

              <label className="search-box admin-textarea">
                <span>Description</span>
                <textarea rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Experience the game with this premium quality football jersey..." />
              </label>

              <div className="search-box">
                <span>Images (1-5)</span>
                <div 
                  style={{
                    border: '1px solid var(--border)',
                    padding: '24px',
                    textAlign: 'center',
                    background: 'var(--panel-strong)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => document.getElementById('admin_file_input_new').click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)', marginBottom: '4px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Tap to upload photos
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Supports PNG, JPG, JPEG (Max 8MB per image)
                  </span>
                  <input
                    id="admin_file_input_new"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      const selected = Array.from(event.target.files || []);
                      if (selected.length > 5) {
                        setError('Maximum 5 images are allowed');
                        setFiles(selected.slice(0, 5));
                      } else {
                        setError('');
                        setFiles(selected);
                      }
                    }}
                  />
                </div>
              </div>

              {files.length > 0 && (
                <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text)' }}>
                    Selected Files for Upload ({files.length}):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {files.map((file, idx) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div 
                          key={`${file.name}-${idx}`} 
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <img src={url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles(files.filter((_, i) => i !== idx));
                            }}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0,0,0,0.6)',
                              color: '#fff',
                              border: 0,
                              width: '20px',
                              height: '20px',
                              display: 'grid',
                              placeItems: 'center',
                              cursor: 'pointer',
                              fontSize: '10px',
                              lineHeight: 1
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="admin-hint">
                <p>Add up to 5 images before saving the jersey.</p>
              </div>

              <div className="admin-submit-row">
                <button type="submit" className="action-button" disabled={saving}>{saving ? 'Saving...' : 'Create jersey'}</button>
              </div>
            </form>
          </section>
        </section>
      )}
    </main>
  );
}
