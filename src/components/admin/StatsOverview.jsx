import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

const StatsOverview = ({ requests }) => {
    // 1. Calculate Stats
    const total = requests.length;
    const active = requests.filter(r => r.subscription_status === 'active').length;
    const disabled = requests.filter(r => r.subscription_status === 'disabled').length;
    const pending = requests.filter(r => r.subscription_status === 'pending').length;
    const rejected = requests.filter(r => r.subscription_status === 'rejected').length;

    // 2. Prepare Data for Pie Chart
    const data = [
        { name: 'Active', value: active, color: '#10b981' },   // emerald-500
        { name: 'Pending', value: pending, color: '#f59e0b' }, // amber-500
        { name: 'Disabled', value: disabled, color: '#ef4444' }, // red-500
        { name: 'Rejected', value: rejected, color: '#9ca3af' }, // slate-400
    ].filter(d => d.value > 0);

    // 3. Prepare Data for Bar Chart (Simple distribution)
    const barData = [
        { name: 'Active', count: active },
        { name: 'Disabled', count: disabled },
        { name: 'Pending', count: pending },
    ];

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={total} icon={Users} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
                <StatCard title="Active Now" value={active} icon={UserCheck} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
                <StatCard title="Pending" value={pending} icon={Clock} colorClass="text-amber-400" bgClass="bg-amber-500/10" />
                <StatCard title="Disabled" value={disabled} icon={UserX} colorClass="text-red-400" bgClass="bg-red-500/10" />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart */}
                <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Status Distribution</h3>
                    <div className="w-full h-[200px] min-h-[200px] min-w-[200px]">
                        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart (Activity) */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px]">
                    <h3 className="text-lg font-semibold text-white mb-6">User Activity</h3>
                    <div className="w-full h-[200px] mt-4 min-h-[200px] min-w-[200px]">
                        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'Active' ? '#10b981' :
                                                entry.name === 'Pending' ? '#f59e0b' :
                                                    '#ef4444'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* Pricing Plans Reference */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Pricing Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: 'Monthly', price: '₹125,000', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { name: 'Quarterly', price: '₹300,000', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        { name: 'Half Yearly', price: '₹500,000', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { name: 'Yearly', price: '₹900,000', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
                    ].map((plan) => (
                        <div key={plan.name} className={`p-4 rounded-xl border border-white/5 ${plan.bg}`}>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">{plan.name}</p>
                            <p className={`text-xl font-bold ${plan.color}`}>{plan.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
