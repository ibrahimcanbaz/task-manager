import React from 'react';
import { Users } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="container py-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            <p className="mt-1 text-slate-300">Track your team's progress efficiently</p>
          </div>
        </div>
      </div>
    </div>
  );
}