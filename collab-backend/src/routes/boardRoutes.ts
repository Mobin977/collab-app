import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createOrganization, 
  createProject, 
  getProjectBoard, 
  createTask, 
  updateTaskPosition 
} from '../controllers/boardController';
import { getWorkspaceMetrics } from '../controllers/analyticsController';

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

// --- 4. HIGH-PERFORMANCE SQL METRICS PATHWAYS ---
router.get('/analytics/velocity', getWorkspaceMetrics);

export default router;
