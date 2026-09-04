import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Starting safe database seeding pipeline...');
    // Safe table cleanup helper using raw relational checks to prevent "Table Not Found" faults
    const tables = ['ChatMessage', 'Comment', 'Task', 'BoardColumn', 'Project', 'Member', 'Organization', 'User'];
    for (const table of tables) {
        try {
            // @ts-ignore
            if (prisma[table.toLowerCase()] || prisma[table]) {
                // @ts-ignore
                await prisma[table].deleteMany({});
            }
        }
        catch (err) {
            console.log(`ℹ️ Skipping truncation for table tracking handle: ${table}`);
        }
    }
    // Generate test engineer profile credentials
    const passwordHash = await bcrypt.hash('developer_secure_pass_123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'lead-engineer@collabmesh.com',
            passwordHash,
            fullName: 'Lead Platform Engineer',
        },
    });
    // Create organization model
    const org = await prisma.organization.create({
        data: {
            name: 'CollabMesh Enterprise Solutions',
            slug: 'collabmesh-enterprise',
            members: {
                create: {
                    userId: user.id,
                    role: 'OWNER',
                },
            },
        },
    });
    // Create project core lane tracking space
    const project = await prisma.project.create({
        data: {
            name: 'Core Architecture R&D',
            description: 'Foundational tracking canvas metrics',
            organizationId: org.id,
        },
    });
    // Provision pre-loaded task metrics rows
    await prisma.boardColumn.create({
        data: {
            name: 'To Do Inbox',
            position: 1,
            projectId: project.id,
            tasks: {
                create: [
                    { title: 'Write Docker Compose configuration setups', description: 'Bundle backend node processes and redis engines together', position: 1 },
                    { title: 'Draft SQL Analytics query matrix structures', description: 'Form view frames to calculate team resolution speeds', position: 2 },
                ],
            },
        },
    });
    await prisma.boardColumn.create({
        data: {
            name: 'In Progress Sprint',
            position: 2,
            projectId: project.id,
        },
    });
    await prisma.boardColumn.create({
        data: {
            name: 'Completed Tasks',
            position: 3,
            projectId: project.id,
        },
    });
    console.log('✅ DATABASE LAYOUT SEEDED SUCCESSFULLY!');
    console.log('🔑 Credentials to Log In:');
    console.log('📧 Email: lead-engineer@collabmesh.com');
    console.log('🔒 Password: developer_secure_pass_123');
}
main()
    .catch((e) => {
    console.error('❌ Seeding fault exception:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
