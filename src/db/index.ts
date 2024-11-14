import initSqlJs from 'sql.js';
import { User, Project, Comment } from '../types';

let db: any = null;
const DB_KEY = 'project_management_db';

const initDb = async () => {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem(DB_KEY);
  if (savedDb) {
    const uint8Array = new Uint8Array(savedDb.split(',').map(Number));
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();
    // Create tables
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        percentage INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE project_users (
        project_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        PRIMARY KEY (project_id, user_id)
      );

      CREATE TABLE comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        user_id INTEGER,
        text TEXT NOT NULL,
        percentage INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
  }

  // Save database to localStorage whenever it changes
  const saveDb = () => {
    const data = db.export();
    const array = Array.from(data);
    localStorage.setItem(DB_KEY, array.toString());
  };

  // Wrap all database operations to auto-save
  const originalRun = db.run.bind(db);
  db.run = (...args: any[]) => {
    const result = originalRun(...args);
    saveDb();
    return result;
  };

  return db;
};

export const dbService = {
  init: initDb,

  getUsers: async (): Promise<User[]> => {
    await initDb();
    const result = db.exec('SELECT * FROM users ORDER BY created_at DESC');
    return result[0]?.values.map((row: any) => ({
      id: row[0],
      name: row[1],
    })) || [];
  },

  addUser: async (name: string): Promise<User> => {
    await initDb();
    db.run('INSERT INTO users (name) VALUES (?)', [name]);
    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];
    return { id, name };
  },

  deleteUser: async (id: number): Promise<void> => {
    await initDb();
    db.run('DELETE FROM users WHERE id = ?', [id]);
  },

  getProjects: async (userId?: number): Promise<Project[]> => {
    await initDb();
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.percentage,
        p.user_id,
        GROUP_CONCAT(DISTINCT pu.user_id) as assigned_users,
        GROUP_CONCAT(
          c.id || '---SEPARATOR---' || 
          c.text || '---SEPARATOR---' || 
          c.percentage || '---SEPARATOR---' || 
          c.user_id || '---SEPARATOR---' || 
          c.created_at,
          '---RECORD---'
        ) as comments
      FROM projects p
      LEFT JOIN project_users pu ON p.id = pu.project_id
      LEFT JOIN comments c ON p.id = c.project_id
    `;

    const params = [];
    if (userId !== undefined) {
      query += ' WHERE p.user_id = ? OR pu.user_id = ?';
      params.push(userId, userId);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';
    
    const projects = db.exec(query, params);
    
    return projects[0]?.values.map((row: any) => ({
      id: row[0],
      name: row[1],
      percentage: row[2],
      userId: row[3],
      assignedUsers: row[4] ? row[4].split(',').map(Number) : [],
      comments: row[5]
        ? row[5].split('---RECORD---').reduce((acc: Comment[], commentGroup: string) => {
            if (!commentGroup) return acc;
            const [id, text, percentage, userId, date] = commentGroup.split('---SEPARATOR---');
            if (id) {
              acc.push({
                id: Number(id),
                text,
                percentage: Number(percentage),
                userId: Number(userId),
                date: new Date(date),
              });
            }
            return acc;
          }, [])
        : [],
    })) || [];
  },

  addProject: async (name: string, userId: number): Promise<Project> => {
    await initDb();
    db.run('INSERT INTO projects (name, user_id) VALUES (?, ?)', [name, userId]);
    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];

    // Assign the owner as the first assigned user
    await dbService.assignUser(id, userId);

    return {
      id,
      name,
      percentage: 0,
      comments: [],
      assignedUsers: [userId],
      userId,
    };
  },

  deleteProject: async (id: number): Promise<void> => {
    await initDb();
    db.run('DELETE FROM projects WHERE id = ?', [id]);
  },

  assignUser: async (projectId: number, userId: number): Promise<void> => {
    await initDb();
    const exists = db.exec(
      'SELECT 1 FROM project_users WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    
    if (!exists[0]?.values.length) {
      db.run('INSERT INTO project_users (project_id, user_id) VALUES (?, ?)', [projectId, userId]);
    } else {
      // Only allow unassigning if there will still be at least one user assigned
      const assignedUsers = db.exec(
        'SELECT COUNT(*) FROM project_users WHERE project_id = ?',
        [projectId]
      );
      if (assignedUsers[0]?.values[0][0] > 1) {
        db.run('DELETE FROM project_users WHERE project_id = ? AND user_id = ?', [projectId, userId]);
      }
    }
  },

  addComment: async (projectId: number, userId: number, text: string, percentage: number): Promise<Comment> => {
    await initDb();
    const date = new Date().toISOString();
    
    db.run(`
      INSERT INTO comments (project_id, user_id, text, percentage, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [projectId, userId, text, percentage, date]);

    db.run('UPDATE projects SET percentage = ? WHERE id = ?', [percentage, projectId]);

    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];

    return {
      id,
      text,
      percentage,
      userId,
      date: new Date(date),
    };
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await initDb();
    db.run('DELETE FROM comments WHERE id = ?', [commentId]);
  },

  exportDb: async (): Promise<void> => {
    await initDb();
    const data = db.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_management.db';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importDb: async (file: File): Promise<void> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    
    db = new SQL.Database(uint8Array);
    const saveDb = () => {
      const data = db.export();
      const array = Array.from(data);
      localStorage.setItem(DB_KEY, array.toString());
    };
    saveDb();
    
    // Refresh the page to load the new database
    window.location.reload();
  },
};