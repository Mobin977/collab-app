import { prisma } from '../config/db.js';
export const getWorkspaceMetrics = async (req, res) => {
    try {
        const reportData = await prisma.$queryRaw `
      SELECT * FROM "TaskVelocityAnalytics";
    `;
        res.status(200).json({
            success: true,
            generatedAt: new Date(),
            metrics: reportData
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to extract performance metrics from view layer'
        });
    }
};
