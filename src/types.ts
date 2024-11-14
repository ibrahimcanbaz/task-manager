export interface User {
  id: number;
  name: string;
  role?: string;
}

export interface Comment {
  id: number;
  text: string;
  date: Date;
  percentage: number;
  userId: number;
}

export interface Project {
  id: number;
  name: string;
  comments: Comment[];
  percentage: number;
  assignedUsers: number[];
  userId: number;
}