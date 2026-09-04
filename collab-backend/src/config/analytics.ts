import { prisma } from './db';

export async function initializeAnalyticsViews() {
  console.log('📊 Initializing Dynamic SQL Analytics View Engine...');

  try {
    // 1. Clean the view if it already exists to avoid conflicts
    await prisma.$executeRawUnsafe(`
      DROP VIEW IF EXISTS "TaskVelocityAnalytics";
    `);

    // 2. Build the database calculation view layer
    await prisma.$executeRawUnsafe(`
      CREATE VIEW "TaskVelocityAnalytics" AS
      SELECT 
        p.id AS "projectId",
        p.name AS "projectName",
        bc.id AS "columnId",
        bc.name AS "columnName",
        COUNT(t.id)::int AS "totalTasks",
        SUM(CASE WHEN t.priority = 'URGENT' THEN 1 ELSE 0 END)::int AS "urgentTasksCount",
        SUM(CASE WHEN t.priority = 'HIGH' THEN 1 ELSE 0 END)::int AS "highTasksCount",
        SUM(CASE WHEN t.priority = 'MEDIUM' THEN 1 ELSE 0 END)::int AS "mediumTasksCount",
        SUM(CASE WHEN t.priority = 'LOW' THEN 1 ELSE 0 END)::int AS "lowTasksCount",
        COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - t."createdAt")) / 3600), 0)::NUMERIC(10,1) AS "averageAgeHours"
      FROM "Project" p
      LEFT JOIN "BoardColumn" bc ON bc."projectId" = p.id
      LEFT JOIN "Task" t ON t."columnId" = bc.id
      GROUP BY p.id, p.name, bc.id, bc.name;
    `);

    console.log('✅ SQL Analytics view [TaskVelocityAnalytics] materialized successfully!');
  } catch (error) {
    console.error('❌ Failed to construct SQL analytics metrics view:', error);
  }
}
