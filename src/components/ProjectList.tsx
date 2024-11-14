import React from 'react';
import { Project, User } from '../types';
import { Plus, Trash2, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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

interface ProjectListProps {
  projects: Project[];
  users: User[];
  selectedProject: Project | null;
  onAddProject: (name: string, ownerId: number) => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: number) => void;
  onAssignUser: (projectId: number, userId: number) => void;
  currentUserId: number | null;
}

export function ProjectList({
  projects,
  users,
  selectedProject,
  onAddProject,
  onSelectProject,
  onDeleteProject,
  onAssignUser,
  currentUserId,
}: ProjectListProps) {
  const [newProject, setNewProject] = React.useState('');
  const [newProjectOwner, setNewProjectOwner] = React.useState<string>('');
  const [showAssignUsers, setShowAssignUsers] = React.useState<number | null>(null);
  const [deleteProjectId, setDeleteProjectId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (currentUserId && !newProjectOwner) {
      setNewProjectOwner(currentUserId.toString());
    }
  }, [currentUserId]);

  const handleAddProject = () => {
    if (newProject.trim() && newProjectOwner && users.length > 0) {
      onAddProject(newProject.trim(), parseInt(newProjectOwner));
      setNewProject('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-6">
          <div className="space-y-3">
            <Select 
              value={newProjectOwner} 
              onValueChange={setNewProjectOwner}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project owner" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                placeholder="Create new project..."
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                disabled={users.length === 0 || !newProjectOwner}
              />
              <Button 
                onClick={handleAddProject}
                disabled={users.length === 0 || !newProjectOwner || !newProject.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-muted/50 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>Add team members before creating projects</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm bg-muted/50 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>No projects yet. Create your first project above.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="relative">
                <div
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedProject?.id === project.id
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'hover:bg-accent border-transparent'
                  } border`}
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{project.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Owner: {users.find(u => u.id === project.userId)?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                      {project.percentage}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteProjectId(project.id);
                      }}
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAssignUsers(showAssignUsers === project.id ? null : project.id);
                      }}
                      size="icon"
                      variant="ghost"
                      className="relative"
                    >
                      <Users className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center">
                        {project.assignedUsers.length}
                      </span>
                    </Button>
                  </div>
                </div>
                
                {showAssignUsers === project.id && (
                  <Card className="absolute right-0 mt-2 w-56 z-10">
                    <CardContent className="p-2">
                      <div className="text-sm font-medium text-muted-foreground mb-2 px-2 py-1">
                        Assign Members
                      </div>
                      {users.map(user => (
                        <div
                          key={user.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignUser(project.id, user.id);
                          }}
                          className={`px-2 py-1.5 rounded cursor-pointer hover:bg-accent flex items-center justify-between ${
                            project.assignedUsers.includes(user.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <span>{user.name}</span>
                          {project.assignedUsers.includes(user.id) && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}

        <DeleteDialog
          open={deleteProjectId !== null}
          onOpenChange={(open) => !open && setDeleteProjectId(null)}
          onConfirm={() => deleteProjectId && onDeleteProject(deleteProjectId)}
          title="Delete Project"
          description="Are you sure you want to delete this project? This action cannot be undone."
        />
      </CardContent>
    </Card>
  );
}