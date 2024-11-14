import React, { useEffect } from 'react';
import { Project, User } from '../types';
import { MessageSquarePlus, Trash2, AlertCircle, Folder, User as UserIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DeleteDialog } from './DeleteDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ProjectDetailsProps {
  project: Project;
  users: User[];
  onAddComment: (projectId: number, text: string, percentage: number, userId: number) => void;
  onDeleteComment: (commentId: number) => void;
}

export function ProjectDetails({ project, users, onAddComment, onDeleteComment }: ProjectDetailsProps) {
  const [newComment, setNewComment] = React.useState('');
  const [newPercentage, setNewPercentage] = React.useState('');
  const [selectedUserId, setSelectedUserId] = React.useState<string>('');
  const [deleteCommentId, setDeleteCommentId] = React.useState<number | null>(null);

  // Get assigned users
  const assignedUsers = users.filter(user => project.assignedUsers.includes(user.id));

  // Set initial selected user when project changes or when assigned users change
  useEffect(() => {
    if (assignedUsers.length > 0) {
      setSelectedUserId(assignedUsers[0].id.toString());
    }
  }, [project.id, project.assignedUsers]);

  const handleAddComment = () => {
    if (newComment.trim() && selectedUserId) {
      onAddComment(
        project.id,
        newComment.trim(),
        newPercentage ? parseInt(newPercentage) : project.percentage,
        parseInt(selectedUserId)
      );
      setNewComment('');
      setNewPercentage('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{project.name}</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-primary/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${project.percentage}%` }}
              />
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {project.percentage}%
            </span>
          </div>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          {assignedUsers.map(user => (
            <span key={user.id} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
              {user.name}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select member">
                  {users.find(u => u.id.toString() === selectedUserId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Progress %"
              className="w-24"
              value={newPercentage}
              onChange={(e) => setNewPercentage(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button 
              onClick={handleAddComment} 
              size="icon"
              disabled={!selectedUserId || assignedUsers.length === 0}
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {project.comments.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-muted/50 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>No comments yet. Add the first comment above.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {project.comments.map(comment => {
              const user = users.find(u => u.id === comment.userId);
              return (
                <Card key={comment.id} className="bg-card hover:bg-accent/30 transition-colors group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">
                            {user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.date).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium px-2.5 py-1 bg-primary/10 rounded-full">
                          {comment.percentage}%
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => setDeleteCommentId(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-foreground mt-2">{comment.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DeleteDialog
          open={deleteCommentId !== null}
          onOpenChange={(open) => !open && setDeleteCommentId(null)}
          onConfirm={() => deleteCommentId && onDeleteComment(deleteCommentId)}
          title="Delete Comment"
          description="Are you sure you want to delete this comment? This action cannot be undone."
        />
      </CardContent>
    </Card>
  );
}