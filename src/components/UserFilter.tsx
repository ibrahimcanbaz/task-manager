import React from 'react';
import { User } from '../types';
import { Button } from './ui/button';

interface UserFilterProps {
  users: User[];
  selectedUserId: number | null;
  onSelectUser: (userId: number | null) => void;
}

export function UserFilter({ users, selectedUserId, onSelectUser }: UserFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-muted/50 rounded-full">
      <Button
        onClick={() => onSelectUser(null)}
        variant={selectedUserId === null ? "default" : "ghost"}
        size="sm"
        className="rounded-full px-4"
      >
        All 
      </Button>
      {users.map(user => (
        <Button
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          variant={selectedUserId === user.id ? "default" : "ghost"}
          size="sm"
          className="rounded-full px-4"
        >
          {user.name}
        </Button>
      ))}
    </div>
  );
}