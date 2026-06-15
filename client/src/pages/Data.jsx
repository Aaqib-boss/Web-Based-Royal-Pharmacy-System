import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, X, Loader2, Hospital, Package, Search, HelpCircle } from 'lucide-react';

const Data = () => {
  const [activeTab, setActiveTab] = useState('pharmacies'); // 'pharmacies', 'products', or 'reasons'

  // Data states
  const [pharmacies, setPharmacies] = useState([]);
  const [products, setProducts] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search states
  const [pharmaSearch, setPharmaSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [reasonSearch, setReasonSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [editItem, setEditItem] = useState(null);

  // Form states - Pharmacy
  const [companyName, setCompanyName] = useState('');
  const [refName, setRefName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');

  // Form states - Product
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');

  // Form states - Reason
  const [reasonName, setReasonName] = useState('');

  // Delete Confirm states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Combined data fetching effect with debounce only for search inputs
  useEffect(() => {
    const isSearchActive =
      activeTab === 'pharmacies'
        ? pharmaSearch
        : activeTab === 'products'
        ? prodSearch
        : reasonSearch;

    if (!isSearchActive || isSearchActive.trim() === '') {
      fetchData();
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [activeTab, pharmaSearch, prodSearch, reasonSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pharmacies') {
        const { data } = await api.get(`/pharmacies?search=${pharmaSearch}`);
        setPharmacies(data);
      } else if (activeTab === 'products') {
        const { data } = await api.get(`/products?search=${prodSearch}`);
        setProducts(data);
      } else {
        const { data } = await api.get(`/reasons?search=${reasonSearch}`);
        setReasons(data);
      }
    } catch (error) {
      toast.error('Error fetching data master records');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on typing
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };



  const resetForm = () => {
    setCompanyName('');
    setRefName('');
    setAddress('');
    setContactNumber('');
    setCity('');
    setProductName('');
    setPrice('');
    setReasonName('');
    setEditItem(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalType('add');
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    resetForm();
    setModalType('edit');
    setEditItem(item);

    if (activeTab === 'pharmacies') {
      setCompanyName(item.companyName);
      setRefName(item.refName || '');
      setAddress(item.address);
      setContactNumber(item.contactNumber);
      setCity(item.city);
    } else if (activeTab === 'products') {
      setProductName(item.productName);
      setPrice(item.price);
    } else {
      setReasonName(item.reasonName);
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (activeTab === 'pharmacies') {
        if (!companyName || !refName || !address || !contactNumber || !city) {
          toast.warning('Please fill in all fields');
          setLoading(false);
          return;
        }

        if (contactNumber.length !== 10) {
          toast.error('Contact number must be exactly 10 digits');
          setLoading(false);
          return;
        }

        const payload = { companyName, refName, address, contactNumber, city };

        if (modalType === 'add') {
          const { data } = await api.post('/pharmacies', payload);
          setPharmacies([data, ...pharmacies]);
          toast.success('Pharmacy added successfully!');
        } else {
          const { data } = await api.put(`/pharmacies/${editItem._id}`, payload);
          setPharmacies(pharmacies.map((p) => (p._id === editItem._id ? data : p)));
          toast.success('Pharmacy updated successfully!');
        }
      } else if (activeTab === 'products') {
        if (!productName || !price) {
          toast.warning('Please fill in all fields');
          setLoading(false);
          return;
        }

        const payload = { productName, price: Number(price) };

        if (modalType === 'add') {
          const { data } = await api.post('/products', payload);
          setProducts([data, ...products]);
          toast.success('Product added successfully!');
        } else {
          const { data } = await api.put(`/products/${editItem._id}`, payload);
          setProducts(products.map((p) => (p._id === editItem._id ? data : p)));
          toast.success('Product updated successfully!');
        }
      } else {
        if (!reasonName) {
          toast.warning('Please fill in all fields');
          setLoading(false);
          return;
        }

        const payload = { reasonName };

        if (modalType === 'add') {
          const { data } = await api.post('/reasons', payload);
          setReasons([data, ...reasons]);
          toast.success('Reason added successfully!');
        } else {
          const { data } = await api.put(`/reasons/${editItem._id}`, payload);
          setReasons(reasons.map((r) => (r._id === editItem._id ? data : r)));
          toast.success('Reason updated successfully!');
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const triggerDeleteConfirm = (item) => {
    setDeleteTarget(item);
    setShowConfirmDelete(true);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;

    setLoading(true);
    try {
      if (activeTab === 'pharmacies') {
        await api.delete(`/pharmacies/${deleteTarget._id}`);
        setPharmacies(pharmacies.filter((p) => p._id !== deleteTarget._id));
        toast.success('Pharmacy master record removed');
      } else if (activeTab === 'products') {
        await api.delete(`/products/${deleteTarget._id}`);
        setProducts(products.filter((p) => p._id !== deleteTarget._id));
        toast.success('Product master record removed');
      } else {
        await api.delete(`/reasons/${deleteTarget._id}`);
        setReasons(reasons.filter((r) => r._id !== deleteTarget._id));
        toast.success('Reason master record removed');
      }
      setShowConfirmDelete(false);
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-16 relative"
      style={{ backgroundImage: "url('/dashboard_bg.png')" }}
    >
      <div className="absolute inset-0 bg-lightBg/96 dark:bg-darkBg/96 backdrop-blur-[1px] z-0"></div>
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary-emerald bg-clip-text text-transparent">
              Master Data Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 font-medium">
              Configure system pharmacies and products directories
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-emerald text-white rounded-xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          >
            <Plus className="w-5 h-5" />
            <span>Add New {activeTab === 'pharmacies' ? 'Pharmacy' : activeTab === 'products' ? 'Product' : 'Reason'}</span>
          </button>
        </div>

        {/* Tab Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-3xl mb-6 card-hover">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('pharmacies')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === 'pharmacies'
                  ? 'bg-primary/10 text-primary dark:text-primary-emerald'
                  : 'text-slate-500 hover:bg-lightBg dark:hover:bg-darkBg-input dark:text-slate-400'
              }`}
            >
              <Hospital className="w-4.5 h-4.5" />
              <span>Pharmacy Master</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === 'products'
                  ? 'bg-primary/10 text-primary dark:text-primary-emerald'
                  : 'text-slate-500 hover:bg-lightBg dark:hover:bg-darkBg-input dark:text-slate-400'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              <span>Products Master</span>
            </button>
            <button
              onClick={() => setActiveTab('reasons')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === 'reasons'
                  ? 'bg-primary/10 text-primary dark:text-primary-emerald'
                  : 'text-slate-500 hover:bg-lightBg dark:hover:bg-darkBg-input dark:text-slate-400'
              }`}
            >
              <HelpCircle className="w-4.5 h-4.5" />
              <span>Reasons Master</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder={`Search by name...`}
              value={activeTab === 'pharmacies' ? pharmaSearch : activeTab === 'products' ? prodSearch : reasonSearch}
              onChange={(e) =>
                activeTab === 'pharmacies'
                  ? setPharmaSearch(e.target.value)
                  : activeTab === 'products'
                  ? setProdSearch(e.target.value)
                  : setReasonSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 placeholder-slate-400 focus-glow transition-all duration-200 text-sm"
            />
            <Search className="w-4.5 h-4.5 absolute left-3 top-2.5 text-slate-400" />
          </form>
        </div>

        {/* Master Tables */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {!loading && activeTab === 'pharmacies' && (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xl w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-primary/10 dark:bg-primary-emerald/10 text-primary dark:text-primary-emerald text-xs font-extrabold uppercase tracking-wider border-b border-primary/20 dark:border-primary-emerald/20">
                    <th>Company Name</th>
                    <th>Ref Name</th>
                    <th>Address</th>
                    <th>Contact Number</th>
                    <th>City</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {pharmacies.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                        No pharmacy data found.
                      </td>
                    </tr>
                  ) : (
                    pharmacies.map((pharma) => (
                      <tr key={pharma._id} className="hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors duration-150">
                        <td className="text-slate-800 dark:text-slate-200">
                          {pharma.companyName}
                        </td>
                        <td className="text-slate-800 dark:text-slate-200">
                          {pharma.refName || '-'}
                        </td>
                        <td className="text-sm text-slate-500 dark:text-slate-400 multiline-cell">
                          {pharma.address}
                        </td>
                        <td className="text-sm text-slate-600 dark:text-slate-300">
                          {pharma.contactNumber}
                        </td>
                        <td>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:text-primary-emerald border border-primary/10 dark:border-white/5">
                            {pharma.city}
                          </span>
                        </td>
                        <td className="space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(pharma)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-darkBg-input transition-all duration-150"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(pharma)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all duration-150"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'products' && (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xl w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse product-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-primary/10 dark:bg-primary-emerald/10 text-primary dark:text-primary-emerald text-xs font-extrabold uppercase tracking-wider border-b border-primary/20 dark:border-primary-emerald/20">
                    <th style={{ width: '37.5%' }}>Product Name</th>
                    <th style={{ width: '25%' }}>Unit Price</th>
                    <th style={{ width: '37.5%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                        No product data found.
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors duration-150">
                        <td className="text-slate-800 dark:text-slate-200 multiline-cell" style={{ width: '37.5%' }}>
                          {prod.productName}
                        </td>
                        <td className="text-slate-700 dark:text-slate-300" style={{ width: '25%' }}>
                          RS {prod.price.toFixed(2)}
                        </td>
                        <td className="space-x-2" style={{ width: '37.5%' }}>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-darkBg-input transition-all duration-150"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all duration-150"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'reasons' && (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xl w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse reason-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-primary/10 dark:bg-primary-emerald/10 text-primary dark:text-primary-emerald text-xs font-extrabold uppercase tracking-wider border-b border-primary/20 dark:border-primary-emerald/20">
                    <th style={{ width: '75%' }}>Reason</th>
                    <th style={{ width: '25%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {reasons.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                        No reason data found.
                      </td>
                    </tr>
                  ) : (
                    reasons.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors duration-150">
                        <td className="text-slate-800 dark:text-slate-200 multiline-cell" style={{ width: '75%' }}>
                          {r.reasonName}
                        </td>
                        <td className="space-x-2" style={{ width: '25%' }}>
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-darkBg-input transition-all duration-150"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(r)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all duration-150"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
              {modalType === 'add' ? 'Add New' : 'Edit'}{' '}
              {activeTab === 'pharmacies' ? 'Pharmacy' : activeTab === 'products' ? 'Product' : 'Reason'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {activeTab === 'pharmacies' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apollo Pharmacy"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Reference Name
                    </label>
                    <input
                      type="text"
                      required
                      value={refName}
                      onChange={(e) => setRefName(e.target.value)}
                      placeholder="e.g. Cisco-NY, Google-CA"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Pharmacy Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Main St"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        Contact Number
                      </label>
                       <input
                        type="text"
                        required
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New York"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'products' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Paracetamol 500mg"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Unit Price (RS)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 4.99"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Reason Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reasonName}
                      onChange={(e) => setReasonName(e.target.value)}
                      placeholder="e.g. Near expiry date, Damaged"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 focus-glow transition-all duration-200 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-emerald-950/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-darkBg-input transition-colors duration-150 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-emerald text-white rounded-xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Are you sure?
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              You are about to delete{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {deleteTarget?.companyName || deleteTarget?.productName || deleteTarget?.reasonName}
              </span>
              . This action cannot be undone.
            </p>

            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-950/20 text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-darkBg-input transition-colors duration-150 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all duration-150 disabled:opacity-50 text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Data;
