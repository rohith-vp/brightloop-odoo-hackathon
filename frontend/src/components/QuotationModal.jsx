import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, Building2, User, Mail, Phone, MapPin, Calculator } from 'lucide-react';
import { productService } from '../services/productService';
import { planService } from '../services/planService';
import { customerService } from '../services/customerService';
import { quotationService } from '../services/quotationService';

export default function QuotationModal({ isOpen, onClose, onSave, quotationToEdit = null }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);

  // Customer selection mode: 'existing' | 'custom'
  const [customerMode, setCustomerMode] = useState('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Form Fields
  const [customerData, setCustomerData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    company: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Draft');

  // Line items
  const [lineItems, setLineItems] = useState([
    {
      id: `item_${Date.now()}`,
      productId: '',
      productName: '',
      planId: '',
      planName: '',
      billingFrequency: 'Monthly',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    },
  ]);

  // Pricing calculations
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(18); // 18% GST

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const custList = customerService.getCustomers();
      const prodList = productService.getProducts();
      const planList = planService.getPlans();

      setCustomers(custList);
      setProducts(prodList);
      setPlans(planList);

      if (quotationToEdit) {
        // Editing mode
        setQuotationNumber(quotationToEdit.quotationNumber || '');
        setQuotationDate(quotationToEdit.quotationDate || '');
        setExpiryDate(quotationToEdit.expiryDate || '');
        setNotes(quotationToEdit.notes || '');
        setStatus(quotationToEdit.status || 'Draft');
        setCustomerData(quotationToEdit.customer || { billingAddress: {} });
        setSelectedCustomerId(quotationToEdit.customer?.id || '');
        setCustomerMode(quotationToEdit.customer?.id ? 'existing' : 'custom');

        if (quotationToEdit.lineItems && quotationToEdit.lineItems.length > 0) {
          setLineItems(quotationToEdit.lineItems);
        }

        setDiscountType(quotationToEdit.discountType || 'percentage');
        setDiscountValue(quotationToEdit.discountValue || 0);
        setTaxRate(quotationToEdit.taxRate !== undefined ? quotationToEdit.taxRate : 18);
      } else {
        // Creating new mode
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const expiry = nextMonth.toISOString().split('T')[0];

        setQuotationNumber(quotationService.generateQuotationNumber());
        setQuotationDate(today);
        setExpiryDate(expiry);
        setNotes('');
        setStatus('Draft');
        setDiscountType('percentage');
        setDiscountValue(0);
        setTaxRate(18);

        // Default to first customer
        if (custList.length > 0) {
          setSelectedCustomerId(custList[0].id);
          setCustomerData(custList[0]);
          setCustomerMode('existing');
        }

        // Default first line item
        if (prodList.length > 0) {
          const firstProd = prodList[0];
          const matchedPlans = planList.filter((p) => p.productId === firstProd.id);
          const firstPlan = matchedPlans[0] || null;

          const unitPrice = firstPlan ? firstPlan.price : firstProd.salesPrice || 0;
          setLineItems([
            {
              id: `item_${Date.now()}`,
              productId: firstProd.id,
              productName: firstProd.name,
              planId: firstPlan ? firstPlan.id : '',
              planName: firstPlan ? firstPlan.name : 'Standard Unit',
              billingFrequency: firstPlan ? firstPlan.billingFrequency : 'Monthly',
              quantity: 1,
              unitPrice: unitPrice,
              lineTotal: unitPrice,
            },
          ]);
        }
      }
      setErrors({});
    }
  }, [isOpen, quotationToEdit]);

  if (!isOpen) return null;

  // Handle Customer Selection
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerData(found);
    }
  };

  // Line item changes
  const handleProductChange = (index, productId) => {
    const selectedProd = products.find((p) => p.id === productId);
    if (!selectedProd) return;

    const matchedPlans = plans.filter((p) => p.productId === productId);
    const defaultPlan = matchedPlans[0] || null;
    const unitPrice = defaultPlan ? defaultPlan.price : selectedProd.salesPrice || 0;

    const updated = [...lineItems];
    const qty = updated[index].quantity || 1;
    updated[index] = {
      ...updated[index],
      productId: selectedProd.id,
      productName: selectedProd.name,
      planId: defaultPlan ? defaultPlan.id : '',
      planName: defaultPlan ? defaultPlan.name : 'Standard Item',
      billingFrequency: defaultPlan ? defaultPlan.billingFrequency : 'Monthly',
      unitPrice,
      lineTotal: qty * unitPrice,
    };
    setLineItems(updated);
  };

  const handlePlanChange = (index, planId) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    const updated = [...lineItems];
    const qty = updated[index].quantity || 1;
    updated[index] = {
      ...updated[index],
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      billingFrequency: selectedPlan.billingFrequency,
      unitPrice: selectedPlan.price,
      lineTotal: qty * selectedPlan.price,
    };
    setLineItems(updated);
  };

  const handleQuantityChange = (index, qty) => {
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    const updated = [...lineItems];
    const unitPrice = updated[index].unitPrice || 0;
    updated[index] = {
      ...updated[index],
      quantity,
      lineTotal: quantity * unitPrice,
    };
    setLineItems(updated);
  };

  const handleUnitPriceChange = (index, price) => {
    const unitPrice = Math.max(0, parseFloat(price) || 0);
    const updated = [...lineItems];
    const qty = updated[index].quantity || 1;
    updated[index] = {
      ...updated[index],
      unitPrice,
      lineTotal: qty * unitPrice,
    };
    setLineItems(updated);
  };

  const handleAddLineItem = () => {
    const firstProd = products[0] || null;
    let prodId = '';
    let prodName = '';
    let planId = '';
    let planName = '';
    let billingFrequency = 'Monthly';
    let unitPrice = 0;

    if (firstProd) {
      prodId = firstProd.id;
      prodName = firstProd.name;
      const matched = plans.filter((p) => p.productId === firstProd.id);
      if (matched.length > 0) {
        planId = matched[0].id;
        planName = matched[0].name;
        billingFrequency = matched[0].billingFrequency;
        unitPrice = matched[0].price;
      } else {
        unitPrice = firstProd.salesPrice || 0;
      }
    }

    setLineItems([
      ...lineItems,
      {
        id: `item_${Date.now()}`,
        productId: prodId,
        productName: prodName,
        planId: planId,
        planName: planName,
        billingFrequency,
        quantity: 1,
        unitPrice,
        lineTotal: unitPrice,
      },
    ]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length <= 1) {
      setErrors((prev) => ({ ...prev, lineItems: 'At least one line item is required.' }));
      return;
    }
    const updated = lineItems.filter((_, idx) => idx !== index);
    setLineItems(updated);
  };

  // Calculations
  const totals = quotationService.calculateTotals(
    lineItems,
    discountType,
    discountValue,
    taxRate
  );

  const validate = () => {
    const errs = {};
    if (!customerData.name || !customerData.name.trim()) {
      errs.customerName = 'Customer or company name is required.';
    }
    if (!customerData.email || !customerData.email.trim()) {
      errs.customerEmail = 'Customer email is required.';
    }
    if (!quotationDate) {
      errs.quotationDate = 'Quotation date is required.';
    }
    if (!expiryDate) {
      errs.expiryDate = 'Expiry date is required.';
    } else if (expiryDate < quotationDate) {
      errs.expiryDate = 'Expiry date cannot precede quotation date.';
    }
    if (lineItems.length === 0) {
      errs.lineItems = 'At least one product line item is required.';
    }
    for (let i = 0; i < lineItems.length; i++) {
      if (!lineItems[i].productId) {
        errs.lineItems = `Line item #${i + 1} must have a product selected.`;
        break;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (targetStatus = status) => {
    if (!validate()) return;

    const payload = {
      quotationNumber,
      quotationDate,
      expiryDate,
      notes,
      status: targetStatus,
      customer: customerData,
      lineItems,
      discountType,
      discountValue: Number(discountValue) || 0,
      taxRate: Number(taxRate) || 0,
    };

    onSave(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 25, 24, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--color-surface-white)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-white)',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-heading-section)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.01em',
              }}
            >
              {quotationToEdit ? `Edit Quotation (${quotationToEdit.quotationNumber})` : 'Create New Quotation'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Configure customer details, itemized subscription plans, pricing concessions, and GST breakdown.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          {/* Section 1: Customer Information */}
          <div
            style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: 'var(--font-size-heading-card)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                  Customer Information
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--font-size-helper)' }}>
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid',
                    borderColor: customerMode === 'existing' ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: customerMode === 'existing' ? 'var(--color-surface-green)' : 'var(--color-surface-white)',
                    color: customerMode === 'existing' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer',
                  }}
                >
                  Select Existing Directory
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('custom')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid',
                    borderColor: customerMode === 'custom' ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: customerMode === 'custom' ? 'var(--color-surface-green)' : 'var(--color-surface-white)',
                    color: customerMode === 'custom' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer',
                  }}
                >
                  Custom Entry
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Choose Customer <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="input-field"
                  style={{ height: '46px', fontSize: 'var(--font-size-input)' }}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contactPerson}) - {c.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Company / Organization Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value, company: e.target.value })}
                  placeholder="e.g. Acme Cloud Corp"
                  className="input-field"
                  style={{ height: '44px', fontSize: 'var(--font-size-input)' }}
                />
                {errors.customerName && (
                  <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Billing Email <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="billing@company.com"
                  className="input-field"
                  style={{ height: '44px', fontSize: 'var(--font-size-input)' }}
                />
                {errors.customerEmail && (
                  <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                    {errors.customerEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Phone / Contact
                </label>
                <input
                  type="text"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+91 98000 00000"
                  className="input-field"
                  style={{ height: '44px', fontSize: 'var(--font-size-input)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                  Street / Address
                </label>
                <input
                  type="text"
                  value={customerData.billingAddress?.street || ''}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      billingAddress: { ...(customerData.billingAddress || {}), street: e.target.value },
                    })
                  }
                  placeholder="Street, Tower, City"
                  className="input-field"
                  style={{ height: '44px', fontSize: 'var(--font-size-input)' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Quotation Metadata */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-white)',
            }}
          >
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Quotation Number
              </label>
              <input
                type="text"
                value={quotationNumber}
                readOnly
                className="input-field"
                style={{
                  height: '44px',
                  backgroundColor: 'var(--color-background)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Quotation Date <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="input-field"
                style={{ height: '44px', fontSize: 'var(--font-size-input)' }}
              />
              {errors.quotationDate && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.quotationDate}
                </p>
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Expiry Date <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-field"
                style={{ height: '44px', fontSize: 'var(--font-size-input)' }}
              />
              {errors.expiryDate && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-helper)', marginTop: '4px' }}>
                  {errors.expiryDate}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Product and Plan Selection */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-heading-card)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                  Products & Subscription Plans
                </h3>
                <p style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                  Add products and select associated billing plans to compute dynamic line totals.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: 'var(--font-size-helper)',
                }}
              >
                <Plus size={16} /> Add Line Item
              </button>
            </div>

            {errors.lineItems && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#FDE8E8',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-helper)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <AlertCircle size={16} /> {errors.lineItems}
              </div>
            )}

            <div
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
              }}
            >
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 'var(--font-size-table-header)', width: '32%' }}>
                      Product
                    </th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 'var(--font-size-table-header)', width: '28%' }}>
                      Associated Plan
                    </th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 'var(--font-size-table-header)', width: '12%' }}>
                      Qty
                    </th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 'var(--font-size-table-header)', width: '14%' }}>
                      Unit Price (₹)
                    </th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 'var(--font-size-table-header)', width: '14%' }}>
                      Line Total
                    </th>
                    <th style={{ padding: '10px 10px', textAlign: 'center', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => {
                    const matchedPlans = plans.filter((p) => p.productId === item.productId);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="input-field"
                            style={{ height: '38px', fontSize: '14px' }}
                          >
                            <option value="">Select Product</option>
                            {products.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <select
                            value={item.planId}
                            onChange={(e) => handlePlanChange(index, e.target.value)}
                            className="input-field"
                            style={{ height: '38px', fontSize: '14px' }}
                          >
                            <option value="">Select Plan</option>
                            {matchedPlans.map((pl) => (
                              <option key={pl.id} value={pl.id}>
                                {pl.name} ({pl.billingFrequency}) - ₹{pl.price.toLocaleString('en-IN')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="input-field"
                            style={{ height: '38px', textAlign: 'center', fontSize: '14px' }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                            className="input-field"
                            style={{ height: '38px', textAlign: 'right', fontSize: '14px' }}
                          />
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                          ₹{item.lineTotal.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(index)}
                            className="btn-icon"
                            style={{ color: 'var(--color-text-secondary)', padding: '6px' }}
                            title="Remove line"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Pricing Summary & Calculation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
              padding: 'var(--space-5)',
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Notes & Terms */}
            <div>
              <label className="form-label" style={{ fontSize: 'var(--font-size-form-label)' }}>
                Quotation Notes & Terms
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special contractual terms, delivery schedule, or payment guidelines..."
                className="input-field"
                style={{ fontSize: 'var(--font-size-input)', resize: 'vertical' }}
              />
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal ({lineItems.length} items):</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                  ₹{totals.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Discount Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  <span>Discount:</span>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₹ (Fixed)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={{
                      width: '65px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  />
                </div>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>
                  -₹{totals.discountAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Tax GST Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Tax (GST):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    style={{
                      width: '50px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  />
                  <span>%</span>
                </div>
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-secondary)' }}>
                  +₹{totals.taxAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--color-border)',
                  margin: 'var(--space-1) 0',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '17px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  Grand Total:
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-primary)',
                  }}
                >
                  ₹{totals.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-white)',
          }}
        >
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '10px 18px' }}>
            Cancel
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => handleSubmit('Draft')}
              className="btn-secondary"
              style={{ padding: '10px 18px', fontWeight: 'var(--font-weight-medium)' }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Confirmed')}
              className="btn-primary"
              style={{ padding: '10px 22px', fontWeight: 'var(--font-weight-medium)' }}
            >
              Confirm Quotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

