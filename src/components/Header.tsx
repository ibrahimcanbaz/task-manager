import React, { useRef } from 'react';
import { Users, Download, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { dbService } from '../db';

export function Header() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      dbService.importDb(file);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
              <p className="mt-1 text-slate-300">Track your team's progress efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => dbService.exportDb()}
            >
              <Download className="h-4 w-4" />
              Export DB
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Import DB
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".db"
              onChange={handleImport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}