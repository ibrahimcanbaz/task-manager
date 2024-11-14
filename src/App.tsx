import React, { useState, useEffect } from 'react';
import { Project, User } from './types';
import { Header } from './components/Header';
import { UserManagement } from './components/UserManagement';
import { ProjectList } from './components/ProjectList';
import { ProjectDetails } from './components/ProjectDetails';
import { UserFilter } from './components/UserFilter';
import { dbService } from './db';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Load projects based on selected user
  const loadProjects = async (userId?: number) => {
    const loadedProjects = await dbService.getProjects(userId);
    setProjects(loadedProjects);
    
    // Update selected project if it exists in the new project list
    if (selectedProject) {
      const updatedProject = loadedProjects.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedProject || null);
    }
    return loadedProjects;
  };

  // Initialize database and load initial data
  useEffect(() => {
    const initData = async () => {
      await dbService.init();
      const initialUsers = await dbService.getUsers();
      setUsers(initialUsers);
      const initialProjects = await loadProjects();
      // Select the first project if available
      if (initialProjects && initialProjects.length > 0) {
        setSelectedProject(initialProjects[0]);
      }
    };
    initData();
  }, []);

  // Reload projects when selected user changes
  useEffect(() => {
    loadProjects(selectedUserId || undefined);
  }, [selectedUserId]);

  const addUser = async (name: string) => {
    const newUser = await dbService.addUser(name);
    setUsers([...users, newUser]);
  };

  const deleteUser = async (id: number) => {
    await dbService.deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
    if (selectedUserId === id) {
      setSelectedUserId(null);
    }
    await loadProjects(selectedUserId);
  };

  const addProject = async (name: string) => {
    await dbService.addProject(name);
    await loadProjects(selectedUserId);
  };

  const addComment = async (projectId: number, text: string, percentage: number, userId: number) => {
    await dbService.addComment(projectId, userId, text, percentage);
    await loadProjects(selectedUserId);
  };

  const deleteComment = async (commentId: number) => {
    await dbService.deleteComment(commentId);
    await loadProjects(selectedUserId);
  };

  const deleteProject = async (projectId: number) => {
    await dbService.deleteProject(projectId);
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
    await loadProjects(selectedUserId);
  };

  const assignUser = async (projectId: number, userId: number) => {
    await dbService.assignUser(projectId, userId);
    await loadProjects(selectedUserId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserFilter
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
            />
            <ProjectList
              projects={projects}
              users={users}
              selectedProject={selectedProject}
              onAddProject={addProject}
              onSelectProject={setSelectedProject}
              onDeleteProject={deleteProject}
              onAssignUser={assignUser}
            />
            <UserManagement
              users={users}
              onAddUser={addUser}
              onDeleteUser={deleteUser}
            />
          </div>
          
          <div className="lg:col-span-2">
            {selectedProject ? (
              <ProjectDetails
                project={selectedProject}
                users={users}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ) : (
              <div className="bg-muted/10 rounded-lg shadow-sm p-6 text-center text-muted-foreground">
                Select a project to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}