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
    <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[40rem] h-[40rem] bg-primary/30 rounded-full blur-[128px] opacity-20" />
      </div>
      <div className="container relative py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm ring-1 ring-white/20">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Project Management
              </h1>
              <p className="mt-2 text-lg text-slate-300/90">
                Track your team's progress efficiently
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-white hover:text-white hover:bg-white/10"
              onClick={() => dbService.exportDb()}
            >
              <Download className="h-4 w-4" />
              Export DB
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-white hover:text-white hover:bg-white/10"
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