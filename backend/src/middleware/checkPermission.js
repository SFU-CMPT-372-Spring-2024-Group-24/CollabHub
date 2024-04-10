// Middleware to check if a user has permission to perform an action
const { UserProject, Role, User } = require('../db');

const rolePermissions = {
  Viewer: [
    'read',
  ],
  Editor: [
    "read",
    "manageTasks",
    "manageFiles",
  ],
  Owner: [
    "read",
    "manageTasks",
    "manageFiles",
    "manageProject",
    "manageMembers",
  ],
};

const checkPermission = (permission) => async (req, res, next) => {
  const userId = req.session.userId;
  const projectId = req.params.projectId || req.body.projectId;

  try {
    const user = await User.findByPk(userId);
    if (user.isAdmin) {
      next();
      return;
    }

    const userProject = await UserProject.findOne({
      where: {
        UserId: userId,
        ProjectId: projectId,
      },
      include: Role,
    });

    if (userProject && rolePermissions[userProject.Role.name].includes(permission)) {
      next();
    } else {
      res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = checkPermission;