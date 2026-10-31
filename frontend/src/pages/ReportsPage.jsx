import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Layers,
  Calendar,
  Download,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { subscriptionService } from '../services/subscriptionService';
import { invoiceService } from '../services/invoiceService';
import { paymentService } from '../services/paymentService';
import { customerService } from '../services/customerService';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('ALL'); // '30D' | 'Q3' | 'Q4' | 'YTD' | 'ALL'

  // Load real-time mock data
  const subscriptions = useMemo(() => subscriptionService.getSubscriptions(), []);
  const invoices = useMemo(() => invoiceService.getInvoices(), []);
  const payments = useMemo(() => paymentService.getPayments(), []);
  const customers = useMemo(() => customerService.getCustomers(), []);

  // Compute Core SaaS Financial Metrics
  const metrics = useMemo(() => {
    // Active subscriptions
    const activeSubs = subscriptions.filter((s) => s.status === 'active');

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubs.reduce((acc, sub) => {
      const amt = sub.pricing?.recurringAmount || 0;
      const freq = (sub.billingFrequency || '').toLowerCase();
      if (freq === 'monthly') return acc + amt;
      if (freq === 'quarterly') return acc + amt / 3;
      if (freq === 'semi-annual' || freq === 'half-yearly') return acc + amt / 6;
      if (freq === 'annual' || freq === 'yearly') return acc + amt / 12;
      return acc + amt;
    }, 0);

    const arr = mrr * 12;

    // Invoices and Collections
    const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const outstandingReceivables = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
    const collectionRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : 0;

    // Subscription status breakdown
    const subStatuses = {
      active: subscriptions.filter((s) => s.status === 'active').length,
      paused: subscriptions.filter((s) => s.status === 'paused').length,
      expired: subscriptions.filter((s) => s.status === 'expired').length,
      cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
      closed: subscriptions.filter((s) => s.status === 'closed').length,
    };

    // Frequency breakdown
    const frequencies = {
      Monthly: subscriptions.filter((s) => (s.billingFrequency || '').toLowerCase() === 'monthly').length,
      Quarterly: subscriptions.filter((s) => (s.billingFrequency || '').toLowerCase() === 'quarterly').length,
      Annual: subscriptions.filter((s) => (s.billingFrequency || '').toLowerCase().includes('annual') || (s.billingFrequency || '').toLowerCase().includes('year')).length,
    };

    return {
      mrr,
      arr,
      totalInvoiced,
      totalCollected,
      outstandingReceivables,
      collectionRate,
      activeSubsCount: activeSubs.length,
      totalSubsCount: subscriptions.length,
      subStatuses,
      frequencies,
    };
  }, [subscriptions, invoices, payments]);

  // Monthly Revenue and Invoicing Trends Chart Data
  const monthlyTrendsData = [
    { month: 'Jun 2026', Invoiced: 64000, Collected: 58000 },
    { month: 'Jul 2026', Invoiced: 78500, Collected: 72000 },
    { month: 'Aug 2026', Invoiced: 89000, Collected: 84000 },
    { month: 'Sep 2026', Invoiced: 104500, Collected: 98000 },
    { month: 'Oct 2026', Invoiced: Math.round(metrics.totalInvoiced * 0.45) || 118000, Collected: Math.round(metrics.totalCollected * 0.48) || 108000 },
    { month: 'Nov 2026', Invoiced: Math.round(metrics.totalInvoiced * 0.55) || 126000, Collected: Math.round(metrics.totalCollected * 0.52) || 116000 },
  ];

  // Product revenue share
  const productShareData = useMemo(() => {
    const prodMap = {};
    subscriptions.forEach((s) => {
      const name = s.productName || 'Other Cloud Services';
      const rev = s.pricing?.recurringAmount || 0;
      prodMap[name] = (prodMap[name] || 0) + rev;
    });

    return Object.entries(prodMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [subscriptions]);

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Monthly Recurring Revenue (MRR)', `₹${Math.round(metrics.mrr)}`],
      ['Annual Recurring Revenue (ARR)', `₹${Math.round(metrics.arr)}`],
      ['Total Cumulative Invoiced', `₹${metrics.totalInvoiced}`],
      ['Total Cumulative Collected', `₹${metrics.totalCollected}`],
      ['Total Outstanding Receivables', `₹${metrics.outstandingReceivables}`],
      ['Collection Efficiency Rate', `${metrics.collectionRate}%`],
      ['Total Active Subscriptions', metrics.activeSubsCount],
      ['Total Registered Customers', customers.length],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Brightloop_Financial_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-heading-main)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-secondary)',
              marginBottom: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            Financial & Subscription Analytics
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
            Real-time MRR, ARR, invoice cash flow, collection velocity, and subscription retention metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">All Time</option>
            <option value="YTD">Year-to-Date (2026)</option>
            <option value="Q4">Q4 2026</option>
            <option value="30D">Last 30 Days</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-secondary)',
              border: '1px solid var(--color-border)',
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* MRR */}
        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Monthly Recurring (MRR)</span>
            <TrendingUp size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            ₹{Math.round(metrics.mrr).toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', marginTop: '6px' }}>
            <ArrowUpRight size={14} />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        {/* ARR */}
        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Annual Run-Rate (ARR)</span>
            <DollarSign size={18} color="#4F46E5" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#4F46E5' }}>
            ₹{Math.round(metrics.arr).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            Normalized from {metrics.activeSubsCount} active plans
          </div>
        </div>

        {/* Total Invoiced */}
        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Total Invoiced</span>
            <BarChart3 size={18} color="#0D9488" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-secondary)' }}>
            ₹{metrics.totalInvoiced.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            Across {invoices.length} billing cycles
          </div>
        </div>

        {/* Total Collected */}
        <div className="card-surface" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Total Cash Collected</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#059669' }}>
            ₹{metrics.totalCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
            {metrics.collectionRate}% Collection Efficiency
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Chart 1: Revenue vs Collection Trends */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-secondary)', margin: 0 }}>
                Invoiced vs. Collected Trends
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                Monthly comparison of billed amounts and settled payments
              </p>
            </div>
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                <YAxis
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Legend />
                <Bar dataKey="Invoiced" fill="#0E9F6E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Collected" fill="#3F83F8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Product Revenue Share */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-secondary)', margin: 0 }}>
                Top Products by Contract Value
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                Recurring revenue contribution per software solution
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {productShareData.map((item, idx) => {
              const maxRev = productShareData[0]?.revenue || 1;
              const pct = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {idx + 1}. {item.name}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: idx === 0 ? 'var(--color-primary)' : idx === 1 ? '#4F46E5' : '#0D9488',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & Aging Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Subscription Status Health */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '14px' }}>
            Subscription Portfolio Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#ECFDF5', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#065F46' }}>Active & Live</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#065F46' }}>{metrics.subStatuses.active}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>Temporarily Paused</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#92400E' }}>{metrics.subStatuses.paused}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#991B1B' }}>Expired / Lapsed</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B' }}>{metrics.subStatuses.expired}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Closed / Churned</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#4B5563' }}>{metrics.subStatuses.closed + metrics.subStatuses.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Frequency Breakdown */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '14px' }}>
            Billing Frequency Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Monthly Subscriptions</span>
                <span style={{ fontWeight: 600 }}>{metrics.frequencies.Monthly}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '3px' }}>
                <div style={{ width: `${(metrics.frequencies.Monthly / (metrics.totalSubsCount || 1)) * 100}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Quarterly Subscriptions</span>
                <span style={{ fontWeight: 600 }}>{metrics.frequencies.Quarterly}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '3px' }}>
                <div style={{ width: `${(metrics.frequencies.Quarterly / (metrics.totalSubsCount || 1)) * 100}%`, height: '100%', backgroundColor: '#4F46E5', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Annual Subscriptions</span>
                <span style={{ fontWeight: 600 }}>{metrics.frequencies.Annual}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '3px' }}>
                <div style={{ width: `${(metrics.frequencies.Annual / (metrics.totalSubsCount || 1)) * 100}%`, height: '100%', backgroundColor: '#0D9488', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Receivables Aging Summary */}
        <div className="card-surface" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '14px' }}>
            Receivables & Balance Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Outstanding Receivables</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: metrics.outstandingReceivables > 0 ? '#DC2626' : '#059669', marginTop: '2px' }}>
                ₹{metrics.outstandingReceivables.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Payment Realization Rate</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-secondary)', marginTop: '2px' }}>
                {metrics.collectionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

