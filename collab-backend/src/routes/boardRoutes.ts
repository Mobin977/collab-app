import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createOrganization, 
  createProject, 
  getProjectBoard, 
  createTask, 
  updateTaskPosition 
} from '../controllers/boardController.js';
import { getWorkspaceMetrics } from '../controllers/analyticsController.js';

const router = Router();

// 🔒 Secure all downstream paths using the token interception guard layer
router.use(authenticateToken);

// --- 1. ORGANIZATION PATHWAYS ---
router.post('/organizations', createOrganization);

// --- 2. PROJECT MANIFEST PATHWAYS ---
router.post('/projects', createProject);
router.get('/projects/:projectId/board', getProjectBoard);

// --- 3. INTERACTIVE KANBAN ACTIONS ---
router.post('/tasks', createTask);
router.patch('/tasks/:taskId/position', updateTaskPosition);

// 🛠️ FIXED: Appended the project ID parameter suffix variable to cleanly match frontend tracking fetch loops!
router.get('/analytics/velocity/:projectId', getWorkspaceMetrics);

export default router;
