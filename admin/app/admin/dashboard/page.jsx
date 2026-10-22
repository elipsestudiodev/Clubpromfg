'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, ShoppingCart, DollarSign, Package, PackageX, XCircle,
  Clock, RefreshCw, AlertTriangle, Building2, ShieldCheck, Receipt,
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import DashboardCard from '@/components/DashboardCard/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const REVENUE_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'];
const LOW_STOCK_THRESHOLD = 5;
const TREND_DAYS = 14;

const STATUS_META = {
  PENDING: { label: 'Pending', color: '#f59e0b', badge: 'secondary' },
  PAID: { label: 'Paid', color: '#3b82f6', badge: 'default' },
  SHIPPED: { label: 'Shipped', color: '#8b5cf6', badge: 'default' },
  DELIVERED: { label: 'Delivered', color: '#22c55e', badge: 'default' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', badge: 'destructive' },
};

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const numberFmt = new Intl.NumberFormat('en-US');
const currency = (n) => currencyFmt.format(Number(n) || 0);
const number = (n) => numberFmt.format(Number(n) || 0);

async function fetchCount(endpoint, params = {}) {
  try {
    const res = await api.get(endpoint, { params: { ...params, page: 1, limit: 1 } });
    return res.data?.pagination?.totalItems ?? (res.data?.data?.length || 0);
  } catch {
    return 0;
  }
}

async function fetchAllPages(endpoint, params = {}, { pageSize = 100, maxPages = 50 } = {}) {
  let page = 1;
  let totalPages = 1;
  let items = [];
  try {
    do {
      const res = await api.get(endpoint, { params: { ...params, page, limit: pageSize } });
      items = items.concat(res.data?.data || []);
      totalPages = res.data?.pagination?.totalPages || 1;
      page += 1;
    } while (page <= totalPages && page <= maxPages);
  } catch {
    return { items, truncated: false, failed: true };
  }
  return { items, truncated: totalPages > maxPages, failed: false };
}

function buildDailySeries(orders, days) {
  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }

  orders.forEach((o) => {
    if (!o.createdAt) return;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.orders += 1;
    if (REVENUE_STATUSES.includes(o.status)) {
      bucket.revenue += Number(o.totalAmount) || 0;
    }
  });

  return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }));
}

const dayLabel = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [
        statusCountsArr,
        ordersResult,
        productsResult,
        totalCustomers,
        dealersResult,
        totalWarranties,
        totalBrands,
        totalModels,
      ] = await Promise.all([
        Promise.all(ORDER_STATUSES.map((s) => fetchCount('/orders', { status: s }))),
        fetchAllPages('/orders', { sort: 'createdAt', order: 'desc' }, { pageSize: 100, maxPages: 50 }),
        fetchAllPages('/products', { sort: 'id', order: 'desc' }, { pageSize: 100, maxPages: 50 }),
        fetchCount('/customer-pagination'),
        fetchAllPages('/dealer-registrations', { sort: 'createdAt', order: 'desc' }, { pageSize: 100, maxPages: 20 }),
        fetchCount('/registered-warranties'),
        fetchCount('/brands'),
        fetchCount('/models'),
      ]);

      const statusCounts = ORDER_STATUSES.reduce(
        (acc, s, i) => ({ ...acc, [s]: statusCountsArr[i] }),
        {}
      );

      const allOrders = ordersResult.items;
      const totalOrders = ORDER_STATUSES.reduce((sum, s) => sum + (statusCounts[s] || 0), 0);
      const revenueOrders = allOrders.filter((o) => REVENUE_STATUSES.includes(o.status));
      const totalRevenue = revenueOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const avgOrderValue = revenueOrders.length ? totalRevenue / revenueOrders.length : 0;

      const allProducts = productsResult.items;
      const totalProducts = allProducts.length;
      const outOfStock = allProducts.filter((p) => Number(p.stock) <= 0).length;
      const lowStock = allProducts
        .filter((p) => Number(p.stock) > 0 && Number(p.stock) <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => Number(a.stock) - Number(b.stock));

      const allDealers = dealersResult.items;
      const pendingDealers = allDealers.filter((d) => d.status !== 'approved' && d.status !== 'rejected');

      setStats({
        statusCounts,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        recentOrders: allOrders.slice(0, 6),
        dailySeries: buildDailySeries(allOrders, TREND_DAYS),
        totalProducts,
        outOfStock,
        lowStock,
        totalCustomers,
        totalDealers: allDealers.length,
        pendingDealers,
        totalWarranties,
        totalBrands,
        totalModels,
        ordersTruncated: ordersResult.truncated,
        productsTruncated: productsResult.truncated,
        partialData: ordersResult.failed || productsResult.failed || dealersResult.failed,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const s = stats;

  const revenueChartData = {
    labels: s ? s.dailySeries.map((d) => dayLabel(d.date)) : [],
    datasets: [
      {
        label: 'Revenue',
        data: s ? s.dailySeries.map((d) => d.revenue) : [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Revenue: ${currency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => currency(v) },
        grid: { color: '#f1f5f9' },
      },
      x: { grid: { display: false } },
    },
  };

  const statusChartData = {
    labels: ORDER_STATUSES.map((st) => STATUS_META[st].label),
    datasets: [
      {
        data: ORDER_STATUSES.map((st) => (s ? s.statusCounts[st] || 0 : 0)),
        backgroundColor: ORDER_STATUSES.map((st) => STATUS_META[st].color),
        borderWidth: 0,
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } },
    },
    cutout: '65%',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome To ClubPro Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString()}`
              : 'Loading live store data...'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Revenue"
          value={s ? currency(s.totalRevenue) : ''}
          icon={DollarSign}
          accent="green"
          loading={loading}
          description={s ? `From ${number(REVENUE_STATUSES.reduce((n, st) => n + s.statusCounts[st], 0))} completed orders` : ''}
        />
        <DashboardCard
          title="Total Orders"
          value={s ? number(s.totalOrders) : ''}
          icon={ShoppingCart}
          accent="blue"
          loading={loading}
          description={s ? `${number(s.statusCounts.PENDING)} awaiting action` : ''}
        />
        <DashboardCard
          title="Total Products"
          value={s ? number(s.totalProducts) : ''}
          icon={Package}
          accent="purple"
          loading={loading}
          description={s ? `${number(s.totalBrands)} brands · ${number(s.totalModels)} models` : ''}
        />
        <DashboardCard
          title="Total Customers"
          value={s ? number(s.totalCustomers) : ''}
          icon={Users}
          accent="indigo"
          loading={loading}
          description={s ? `${number(s.totalDealers)} dealer accounts` : ''}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Pending Orders"
          value={s ? number(s.statusCounts.PENDING) : ''}
          icon={Clock}
          accent="amber"
          loading={loading}
          description="Needs processing"
        />
        <DashboardCard
          title="Cancelled Orders"
          value={s ? number(s.statusCounts.CANCELLED) : ''}
          icon={XCircle}
          accent="red"
          loading={loading}
          description="All time"
        />
        <DashboardCard
          title="Low Stock Products"
          value={s ? number(s.lowStock.length) : ''}
          icon={PackageX}
          accent="orange"
          loading={loading}
          description={s ? `${number(s.outOfStock)} out of stock` : ''}
        />
        <DashboardCard
          title="Pending Dealer Requests"
          value={s ? number(s.pendingDealers.length) : ''}
          icon={Building2}
          accent="teal"
          loading={loading}
          description={s ? `${number(s.totalWarranties)} registered warranties` : ''}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Last {TREND_DAYS} days, from paid, shipped &amp; delivered orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {loading ? (
                <div className="h-full w-full rounded bg-gray-100 animate-pulse" />
              ) : (
                <Line data={revenueChartData} options={revenueChartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
            <CardDescription>Breakdown of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {loading ? (
                <div className="h-full w-full rounded bg-gray-100 animate-pulse" />
              ) : s && s.totalOrders > 0 ? (
                <Doughnut data={statusChartData} options={statusChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No orders yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Latest activity across the store</CardDescription>
            </div>
            <Link href="/admin/orders/list" className="text-xs font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {loading ? (
              <div className="space-y-2 px-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : s && s.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.recentOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">#{o.id}</TableCell>
                        <TableCell>
                          {o.customer?.fullName || o.customer?.email || '—'}
                        </TableCell>
                        <TableCell>{currency(o.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_META[o.status]?.badge || 'secondary'}>
                            {STATUS_META[o.status]?.label || o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">No orders yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Needs Attention
            </CardTitle>
            <CardDescription>Low stock &amp; pending dealer requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Low Stock</span>
                    <Link href="/admin/products/list" className="text-xs font-medium text-blue-600 hover:underline">
                      View all
                    </Link>
                  </div>
                  {s.lowStock.length > 0 ? (
                    <ul className="space-y-2">
                      {s.lowStock.slice(0, 4).map((p) => (
                        <li key={p.id} className="flex items-center justify-between text-sm">
                          <span className="truncate pr-2">{p.name}</span>
                          <Badge variant="destructive" className="shrink-0">
                            {number(p.stock)} left
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">All products well stocked</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Dealer Requests</span>
                    <Link href="/admin/dealership-requests/list" className="text-xs font-medium text-blue-600 hover:underline">
                      View all
                    </Link>
                  </div>
                  {s.pendingDealers.length > 0 ? (
                    <ul className="space-y-2">
                      {s.pendingDealers.slice(0, 4).map((d) => (
                        <li key={d.id} className="flex items-center justify-between text-sm">
                          <span className="truncate pr-2">{d.companyName || d.email}</span>
                          <Badge variant="secondary" className="shrink-0">Pending</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending requests</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {number(s.totalWarranties)} registered warranties on file
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {(s?.ordersTruncated || s?.productsTruncated || s?.partialData) && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Receipt className="h-3.5 w-3.5" />
          {s?.partialData
            ? 'Some data sources failed to load fully — figures below may be incomplete. Try refreshing.'
            : 'Figures above are based on the most recent records fetched; totals may be partial for very large datasets.'}
        </p>
      )}
    </div>
  );
}
