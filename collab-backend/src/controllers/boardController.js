import { prisma } from '../config/db.js';
// --- 1. ORGANIZATION MANAGEMENT ---
export const createOrganization = async (req, res) => {
    try {
        const { name, slug } = req.body;
        const userId = req.user?.id;
        if (!name || !slug || !userId) {
            res.status(400).json({ error: 'Missing required configuration parameters' });
            return;
        }
        const org = await prisma.organization.create({
            data: {
                name,
                slug,
                members: {
                    create: {
                        userId,
                        role: 'OWNER'
                    }
                }
            }
        });
        res.status(201).json(org);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create organization environment' });
    }
};
// --- 2. PROJECT MANAGEMENT ---
export const createProject = async (req, res) => {
    try {
        const { name, description, organizationId } = req.body;
        if (!name || !organizationId) {
            res.status(400).json({ error: 'Missing required project settings parameters' });
            return;
        }
        const project = await prisma.project.create({
            data: {
                name,
                description,
                organizationId,
                // Automatically provision foundational default columns for a Kanban board
                columns: {
                    create: [
                        { name: 'To Do', position: 1 },
                        { name: 'In Progress', position: 2 },
                        { name: 'Done', position: 3 }
                    ]
                }
            },
            include: { columns: true }
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create project matrix space' });
    }
};
export const getProjectBoard = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { position: 'asc' },
                            include: {
                                assignee: {
                                    select: { id: true, fullName: true, avatarUrl: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!project) {
            res.status(404).json({ error: 'Project space context target not found' });
            return;
        }
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve project canvas board data' });
    }
};
// --- 3. KANBAN TASK MANAGEMENT ---
export const createTask = async (req, res) => {
    try {
        const { title, description, columnId, priority } = req.body;
        if (!title || !columnId) {
            res.status(400).json({ error: 'Missing required structural task parameters' });
            return;
        }
        // Determine position index by counting existing items in column frame
        const taskCount = await prisma.task.count({ where: { columnId } });
        const task = await prisma.task.create({
            data: {
                title,
                description,
                columnId,
                priority: priority || 'MEDIUM',
                position: taskCount + 1
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to append task node element' });
    }
};
export const updateTaskPosition = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { columnId, position } = req.body;
        if (!columnId || position === undefined) {
            res.status(400).json({ error: 'Missing location metrics data coordinates' });
            return;
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { columnId, position }
        });
        res.status(200).json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to persist mutations for moved task element' });
    }
};
