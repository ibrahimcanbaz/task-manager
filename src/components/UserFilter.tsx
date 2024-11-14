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
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        onClick={() => onSelectUser(null)}
        variant={selectedUserId === null ? "default" : "secondary"}
        className="rounded-full"
      >
        All Projects
      </Button>
      {users.map(user => (
        <Button
          key={user.id}
          onClick={() => onSelectUser(user.id)}
          variant={selectedUserId === user.id ? "default" : "secondary"}
          className="rounded-full"
        >
          {user.name}
        </Button>
      ))}
    </div>
  );
}