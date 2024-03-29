import { useState, useEffect } from 'react';
import './Adminpage.scss';

import { api } from '../../api';
import AdminMenu from '../../components/Admin/AdminMenu';
import AdminLogout from '../../components/Admin/AdminLogout';
import AdminUsers from '../../components/Admin/AdminUsers';
import AdminProjects from '../../components/Admin/AdminProjects';

const AdminPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userIDArray, setUserIDArray] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        const userData = response.data;
        setUsers(userData);
        const ids = userData.map((user: any) => user.id);
        setUserIDArray(ids);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    const fetchUserProjects = async (userId: string) => {
      try {
        const response = await api.get(`/projects?userId=${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching user projects", error);
        return [];
      }
    };

    const fetchProjectsForAllUsers = async () => {
      try {
        const allProjects: { [key: string]: { id: string, name: string, description: string } } = {};
        await Promise.all(userIDArray.map(async (userId) => {
          const projectsForUser = await fetchUserProjects(userId);
          projectsForUser.forEach((project: any) => {
            allProjects[project.id] = project;
          });
        }));
        const projectsArray = Object.values(allProjects);
        setProjects(projectsArray);
      } catch (error) {
        console.error('Error fetching projects', error);
      }
    };

    fetchUsers();
    fetchProjectsForAllUsers();
  }, [userIDArray]);

  const deleteUser = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
      setUserIDArray(userIDArray.filter((id) => id !== userId));
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-menu-container">
        <AdminMenu />
      </div>
      <div className="admin-content-container">
        <div className="admin-logout-container">
          <AdminLogout />
        </div>
        <div className="admin-content">
          <h2>All Users In Database</h2>
          <AdminUsers />
          <AdminProjects />
      
        </div>
      </div>
    </div>
  );
};

export default AdminPage;