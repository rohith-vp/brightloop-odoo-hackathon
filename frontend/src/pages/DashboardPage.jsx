import React, { useState } from 'react';
import {
  Calendar,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const monthlyBarData = [
  { label: 'Jan', revenue: 48000, payments: 44500 },
  { label: 'Feb', revenue: 52000, payments: 49200 },
  { label: 'Mar', revenue: 59000, payments: 56000 },
  { label: 'Apr', revenue: 64000, payments: 61200 },
  { label: 'May', revenue: 68400, payments: 65100 },
  { label: 'Jun', revenue: 79200, payments: 74800 },
  { label: 'Jul', revenue: 84500, payments: 80200 },
  { label: 'Aug', revenue: 98100, payments: 91400 },
  { label: 'Sep', revenue: 112000, payments: 104500 },
  { label: 'Oct', revenue: 124580, payments: 112150 },
  { label: 'Nov', revenue: 118000, payments: 109000 },
  { label: 'Dec', revenue: 132000, payments: 125000 },
];

const quarterlyBarData = [
  { label: 'Q1', revenue: 159000, payments: 149700 },
  { label: 'Q2', revenue: 211600, payments: 201100 },
  { label: 'Q3', revenue: 294600, payments: 276100 },
  { label: 'Q4', revenue: 374580, payments: 346150 },
];

const yearlyBarData = [
  { label: '2024', revenue: 580000, payments: 542000 },
  { label: '2025', revenue: 820000, payments: 775000 },
  { label: '2026', revenue: 1039780, payments: 973050 },
];

const recentActivities = [
  {
    id: 1,
    activity: 'Annual Enterprise Renewal',
    customer: 'Apex Logistics Ltd',
    customerEmail: 'billing@apexlogistics.io',
    reference: 'SUB-8942',
    date: '31 Oct 2026',
    amount: '₹24,999',
    status: 'Active',
    statusType: 'success',
  },
  {
    id: 2,
    activity: 'Monthly Pro Subscription',
    customer: 'CloudScale Inc',
    customerEmail: 'ops@cloudscale.net',
    reference: 'SUB-8939',
    date: '31 Oct 2026',
    amount: '₹4,999',
    status: 'Active',
    statusType: 'success',
  },
  {
    id: 3,
    activity: 'Quarterly Cloud Plan Invoice',
    customer: 'Nexus Tech Works',
    customerEmail: 'finance@nexustech.in',
    reference: 'INV-2041',
    date: '30 Oct 2026',
    amount: '₹12,500',
    status: 'Pending',
    statusType: 'pending',
  },
  {
    id: 4,
    activity: 'Overdue Notice - 5 Seat Addon',
    customer: 'Orbit Creative Studios',
    customerEmail: 'accounts@orbitstudio.co',
    reference: 'INV-1988',
    date: '28 Oct 2026',
    amount: '₹3,200',
    status: 'Overdue',
    statusType: 'overdue',
  },
  {
    id: 5,
    activity: 'Plan Upgrade to Team Tier',
    customer: 'Zenith Retail Corp',
    customerEmail: 'team@zenithretail.com',
    reference: 'SUB-8810',
    date: '27 Oct 2026',
    amount: '₹8,999',
    status: 'Active',
    statusType: 'success',
  },
  {
    id: 6,
    activity: 'New Subscription Signup',
    customer: 'Aero Dynamics Lab',
    customerEmail: 'contact@aerodynamics.org',
    reference: 'SUB-8802',
    date: '26 Oct 2026',
    amount: '₹15,000',
    status: 'Active',
    statusType: 'success',
  },
];

const upcomingRenewals = [
  {
    customer: 'Hyperion Bio Systems',
    plan: 'Enterprise Tier',
    renewalDate: '02 Nov 2026',
    amount: '₹18,500',
    autoRenew: true,
  },
  {
    customer: 'Quantum Stream Labs',
    plan: 'Pro Annual',
    renewalDate: '04 Nov 2026',
    amount: '₹9,999',
    autoRenew: true,
  },
  {
    customer: 'Solaris Media Group',
    plan: 'Starter Plan (10 seats)',
    renewalDate: '05 Nov 2026',
    amount: '₹3,499',
    autoRenew: false,
  },
];

const customerEvents = [
  {
    title: 'Apex Logistics upgraded to Enterprise Plan',
    time: '2 hours ago',
    type: 'upgrade',
  },
  {
    title: 'CloudScale updated primary payment card (HDFC •••• 4012)',
    time: '5 hours ago',
    type: 'payment',
  },
  {
    title: 'Nexus Tech Works generated Quotation #QT-109 for review',
    time: 'Yesterday at 4:30 PM',
    type: 'quotation',
  },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [chartFilter, setChartFilter] = useState('monthly');

  const activeChartData =
    chartFilter === 'quarterly'
      ? quarterlyBarData
      : chartFilter === 'yearly'
      ? yearlyBarData
      : monthlyBarData;

  const handleResetFilter = () => {
    setDateRange('30d');
    setChartFilter('monthly');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* 1. Header Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Overview
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Here is the summary of your subscription business.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-main)',
            }}
          >
            <Calendar size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-main)',
                cursor: 'pointer',
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetFilter}
            className="btn btn-secondary"
            title="Reset filters to default"
          >
            <RotateCcw size={15} style={{ color: 'var(--color-text-secondary)' }} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Financial Summary - 4 Compact Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Panel 1: Total Revenue */}
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 'var(--font-size-metric-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Total Revenue
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--font-size-badge)',
                fontWeight: 'var(--font-weight-semibold)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <TrendingUp size={13} />
              +14.2%
            </span>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-metric-value)',
                fontWeight: 'var(--font-weight-bold)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              ₹1,24,580
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-helper)',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '6px',
              }}
            >
              vs. ₹1,09,120 last cycle
            </div>
          </div>
        </div>

        {/* Panel 2: Active Subscriptions */}
        <div
          className="card-surface"
          style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 'var(--font-size-metric-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Active Subscriptions
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: 'var(--font-size-badge)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-surface-green)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              +18 this month
            </span>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-metric-value)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              248
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-helper)',
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
              }}
            >
              Across 4 billing tiers
            </div>
          </div>
        </div>

        {/* Panel 3: Outstanding Amount */}
        <div
          className="card-surface"
          style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 'var(--font-size-metric-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Outstanding Amount
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-badge)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-secondary)',
                backgroundColor: '#F1F3F2',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              5 invoices pending
            </span>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-metric-value)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              ₹12,430
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-helper)',
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
              }}
            >
              Due within next 10 business days
            </div>
          </div>
        </div>

        {/* Panel 4: Overdue Invoices */}
        <div
          className="card-surface"
          style={{
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 'var(--font-size-metric-label)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Overdue Invoices
            </span>
            <span
              style={{
                fontSize: 'var(--font-size-badge)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--status-overdue-text)',
                backgroundColor: 'var(--status-overdue-bg)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              Action required
            </span>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <div
              style={{
                fontSize: 'var(--font-size-metric-value)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-secondary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              32
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-helper)',
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
              }}
            >
              Automated reminders dispatched
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Content: Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Subscription Overview Card */}
          <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 'var(--font-size-heading-card)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Subscription Health
                </h2>
                <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                  Monthly Recurring Revenue (MRR) & retention
                </span>
              </div>
              <span
                style={{
                  fontSize: 'var(--font-size-badge)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-surface-green)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                98.2% Active
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>MRR</div>
                <div style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  ₹94,200
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Avg ARPU</div>
                <div style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
                  ₹502
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Churn Rate</div>
                <div style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                  1.8%
                </div>
              </div>
            </div>

            {/* Visual breakdown progress bar */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--font-size-helper)',
                  marginBottom: '8px',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Distribution</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Active (84%) • Paused (10%) • Grace (6%)
                </span>
              </div>
              <div
                style={{
                  height: '10px',
                  display: 'flex',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  backgroundColor: '#E7EAE8',
                }}
              >
                <div style={{ width: '84%', backgroundColor: 'var(--color-primary)' }} />
                <div style={{ width: '10%', backgroundColor: '#D1D5DB' }} />
                <div style={{ width: '6%', backgroundColor: 'var(--status-pending-text)' }} />
              </div>
            </div>
          </div>

          {/* Upcoming Renewals Card */}
          <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
              }}
            >
              <h2
                style={{
                  fontSize: 'var(--font-size-heading-card)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-secondary)',
                }}
              >
                Upcoming Renewals (7 Days)
              </h2>
              <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                3 pending
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {upcomingRenewals.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FAFCFB',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span
                      style={{
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-main)',
                      }}
                    >
                      {item.customer}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                      {item.plan} • Due {item.renewalDate}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      {item.amount}
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--font-size-badge)',
                        color: item.autoRenew ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {item.autoRenew ? 'Auto-renew on' : 'Manual invoice'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Customer Activity */}
          <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
            <h2
              style={{
                fontSize: 'var(--font-size-heading-card)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Recent Customer Activity
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {customerEvents.map((evt, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      marginTop: '7px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text-main)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-body)' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {evt.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Monthly Revenue Bar Chart */}
          <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 'var(--font-size-heading-card)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  Revenue Overview
                </h2>
                <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                  Revenue vs Payments Received comparison
                </span>
              </div>

              {/* Monthly, Quarterly and Yearly Filter Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#F3F5F4',
                  padding: '3px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {[
                  { key: 'monthly', label: 'Monthly' },
                  { key: 'quarterly', label: 'Quarterly' },
                  { key: 'yearly', label: 'Yearly' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setChartFilter(tab.key)}
                    style={{
                      padding: '5px 12px',
                      fontSize: 'var(--font-size-helper)',
                      fontWeight:
                        chartFilter === tab.key
                          ? 'var(--font-weight-semibold)'
                          : 'var(--font-weight-medium)',
                      color:
                        chartFilter === tab.key
                          ? 'var(--color-secondary)'
                          : 'var(--color-text-secondary)',
                      backgroundColor: chartFilter === tab.key ? '#FFFFFF' : 'transparent',
                      borderRadius: 'var(--radius-xs)',
                      boxShadow:
                        chartFilter === tab.key ? '0 1px 2px rgba(23, 25, 24, 0.06)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Legend */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-3)',
                fontSize: 'var(--font-size-helper)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    backgroundColor: '#087A4B',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-main)' }}>
                  Revenue
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    backgroundColor: '#52B788',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-main)' }}>
                  Payments Received
                </span>
              </div>
            </div>

            {/* Recharts Vertical BarChart Visualization */}
            <div style={{ height: '250px', width: '100%', marginTop: 'var(--space-2)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  barGap={4}
                  barCategoryGap={chartFilter === 'monthly' ? '18%' : '28%'}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E7EAE8"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: '#E7EAE8' }}
                    tick={{ fill: '#858B87', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#858B87', fontSize: 12 }}
                    tickFormatter={(val) =>
                      val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${val / 1000}k`
                    }
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(23, 25, 24, 0.04)' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7EAE8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      padding: '10px 14px',
                    }}
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name === 'revenue' ? 'Revenue' : 'Payments Received',
                    ]}
                    labelFormatter={(label) =>
                      chartFilter === 'monthly'
                        ? `Month: ${label}`
                        : chartFilter === 'quarterly'
                        ? `Quarter: ${label}`
                        : `Year: ${label}`
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="revenue"
                    fill="#087A4B"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={16}
                  />
                  <Bar
                    dataKey="payments"
                    name="payments"
                    fill="#52B788"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Collection Summary */}
          <div className="card-surface" style={{ padding: 'var(--space-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 'var(--font-size-heading-card)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  Payment Collections
                </h2>
                <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                  Settlement & collection pipeline
                </span>
              </div>
              <span className="status-badge success">96.4% Success</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Collected vs Outstanding bar */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--font-size-helper)',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Collected: <strong style={{ color: 'var(--color-text-main)' }}>₹1,12,150</strong>
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Pending: <strong style={{ color: 'var(--color-text-main)' }}>₹12,430</strong>
                  </span>
                </div>
                <div
                  style={{
                    height: '10px',
                    display: 'flex',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    backgroundColor: '#E7EAE8',
                  }}
                >
                  <div style={{ width: '90%', backgroundColor: 'var(--color-primary)' }} />
                  <div style={{ width: '10%', backgroundColor: 'var(--status-pending-text)' }} />
                </div>
              </div>

              {/* Methods Distribution */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-3)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>UPI AutoPay</div>
                  <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    52%
                  </div>
                  <div style={{ fontSize: 'var(--font-size-badge)', color: 'var(--color-text-secondary)' }}>₹64,780</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Cards (Recurring)</div>
                  <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    36%
                  </div>
                  <div style={{ fontSize: 'var(--font-size-badge)', color: 'var(--color-text-secondary)' }}>₹44,850</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>Net Banking / NACH</div>
                  <div style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    12%
                  </div>
                  <div style={{ fontSize: 'var(--font-size-badge)', color: 'var(--color-text-secondary)' }}>₹14,950</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Activities Table */}
      <div className="card-surface" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-heading-card)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-secondary)',
              }}
            >
              Recent Subscription Activities
            </h2>
            <span style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
              Real-time activity log of subscription orders, renewals, and invoice statuses.
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 'var(--font-size-button)', padding: '7px 14px' }}
          >
            <Download size={15} style={{ color: 'var(--color-text-secondary)' }} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Customer</th>
                <th>Reference ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {row.activity}
                  </td>
                  <td>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.customer}</div>
                    <div style={{ fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                      {row.customerEmail}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-helper)', color: 'var(--color-text-secondary)' }}>
                    {row.reference}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-helper)' }}>
                    {row.date}
                  </td>
                  <td style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-secondary)' }}>
                    {row.amount}
                  </td>
                  <td>
                    <span className={`status-badge ${row.statusType}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
