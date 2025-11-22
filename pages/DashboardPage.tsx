
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { getPatients, getPairs } from '../services/backendService';
import { Users, Activity, CheckCircle, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Card className="relative overflow-hidden">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                {trend && <p className="text-xs text-emerald-600 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> {trend}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-current`}>
                {React.cloneElement(icon, { className: `w-6 h-6 text-${color.split('-')[1]}-600` })}
            </div>
        </CardContent>
    </Card>
);

const DashboardPage: React.FC = () => {
  const patients = getPatients();
  const pairs = getPairs();
  const activePairs = pairs.filter(p => p.status === 'Active').length;

  // Mock funnel data
  const funnelData = [
      { label: 'Phase 1', count: 12, color: 'bg-blue-500' },
      { label: 'Phase 2', count: 8, color: 'bg-blue-400' },
      { label: 'Phase 3', count: 6, color: 'bg-indigo-500' },
      { label: 'MDT Review', count: 4, color: 'bg-purple-500' },
      { label: 'Surgery', count: 2, color: 'bg-emerald-500' },
  ];
  const maxCount = Math.max(...funnelData.map(d => d.count));

  return (
    <div className="space-y-8">
      <div>
          <h1 className="text-2xl font-bold text-slate-900">TransplantFlow Dashboard</h1>
          <p className="text-slate-500">Welcome back, Dr. Smith. Here's your evaluation overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={patients.length} icon={<Users />} color="bg-blue-100" trend="+2 this week" />
        <StatCard title="Active Pairs" value={activePairs} icon={<Activity />} color="bg-purple-100" />
        <StatCard title="Completed" value="12" icon={<CheckCircle />} color="bg-emerald-100" trend="Success rate 98%" />
        <StatCard title="Avg Time" value="45d" icon={<Clock />} color="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Chart */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Evaluation Funnel</CardTitle>
                <CardDescription>Active patients by highest completed phase</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-2">
                    {funnelData.map((item, i) => (
                        <div key={i} className="flex items-center">
                            <div className="w-24 text-sm font-medium text-slate-600 text-right mr-4">{item.label}</div>
                            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`} 
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                />
                            </div>
                            <div className="w-12 text-sm font-bold text-slate-800 text-right ml-4">{item.count}</div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-slate-900">24</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Pending Labs</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">8</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">MDT Review</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">3</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Scheduled Surgery</div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="divide-y divide-slate-100">
                    {patients.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex items-start p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className={`w-2 h-2 mt-2 rounded-full mr-3 flex-shrink-0 ${p.type === 'DONOR' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {p.name} <span className="text-slate-400 font-normal">registered as</span> {p.type.toLowerCase()}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(p.registeredDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                    <div className="p-4 text-center">
                        <button className="text-sm text-primary-600 hover:underline font-medium flex items-center justify-center w-full">
                            View All Activity <ArrowRight className="w-4 h-4 ml-1"/>
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
