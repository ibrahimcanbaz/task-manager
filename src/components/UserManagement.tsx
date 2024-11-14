import React from 'react';
import { User } from '../types';
import { UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DeleteDialog } from './DeleteDialog';

interface UserManagementProps {
  users: User[];
  onAddUser: (name: string) => void;
  onDeleteUser: (id: number) => void;
}

export function UserManagement({ users, onAddUser, onDeleteUser }: UserManagementProps) {
  const [newUserName, setNewUserName] = React.useState('');
  const [deleteUserId, setDeleteUserId] = React.useState<number | null>(null);

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddUser(newUserName.trim());
      setNewUserName('');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Add new team member..."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
              className="pr-24"
            />
            <Button 
              onClick={handleAddUser}
              className="absolute right-1 top-1 bottom-1"
              size="sm"
            >
              Add Member
            </Button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-muted/50 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>Add team members to get started</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-sm group transition-colors"
              >
                <span>{user.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setDeleteUserId(user.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <DeleteDialog
          open={deleteUserId !== null}
          onOpenChange={(open) => !open && setDeleteUserId(null)}
          onConfirm={() => deleteUserId && onDeleteUser(deleteUserId)}
          title="Delete Team Member"
          description="Are you sure you want to delete this team member? This will remove them from all projects and delete their comments."
        />
      </CardContent>
    </Card>
  );
}