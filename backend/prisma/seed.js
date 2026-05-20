require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  console.log('Clearing old data...');
  await client.query('DELETE FROM "Notification"');
  await client.query('DELETE FROM "Comment"');
  await client.query('DELETE FROM "TaskMember"');
  await client.query('DELETE FROM "Task"');
  await client.query('DELETE FROM "ProjectMember"');
  await client.query('DELETE FROM "Project"');
  await client.query('DELETE FROM "User"');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  console.log('Creating users...');
  const adminId = uuidv4();
  await client.query(`
    INSERT INTO "User" (id, name, email, password, role, "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW())
  `, [adminId, 'Admin User', 'admin@example.com', password, 'ADMIN']);

  const member1Id = uuidv4();
  await client.query(`
    INSERT INTO "User" (id, name, email, password, role, "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW())
  `, [member1Id, 'John Doe', 'john@example.com', password, 'MEMBER']);

  const member2Id = uuidv4();
  await client.query(`
    INSERT INTO "User" (id, name, email, password, role, "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW())
  `, [member2Id, 'Jane Smith', 'jane@example.com', password, 'MEMBER']);

  console.log('Creating projects...');
  const project1Id = uuidv4();
  await client.query(`
    INSERT INTO "Project" (id, title, description, "createdBy", deadline, "createdAt")
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '14 days', NOW())
  `, [project1Id, 'Website Redesign', 'Revamping the main corporate website with the new branding guidelines.', adminId]);

  await client.query(`INSERT INTO "ProjectMember" (id, "projectId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), project1Id, adminId]);
  await client.query(`INSERT INTO "ProjectMember" (id, "projectId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), project1Id, member1Id]);

  const project2Id = uuidv4();
  await client.query(`
    INSERT INTO "Project" (id, title, description, "createdBy", deadline, "createdAt")
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days', NOW())
  `, [project2Id, 'Mobile App Launch Q3', 'Finalize features for the iOS and Android launch.', adminId]);

  await client.query(`INSERT INTO "ProjectMember" (id, "projectId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), project2Id, adminId]);
  await client.query(`INSERT INTO "ProjectMember" (id, "projectId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), project2Id, member2Id]);

  console.log('Creating tasks...');
  const task1Id = uuidv4();
  await client.query(`
    INSERT INTO "Task" (id, title, description, priority, status, "dueDate", "projectId", "createdBy", "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '2 days', $6, $7, NOW())
  `, [task1Id, 'Design new Hero section', 'Create a responsive hero section.', 'HIGH', 'COMPLETED', project1Id, adminId]);
  await client.query(`INSERT INTO "TaskMember" (id, "taskId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), task1Id, member1Id]);

  const task2Id = uuidv4();
  await client.query(`
    INSERT INTO "Task" (id, title, description, priority, status, "dueDate", "projectId", "createdBy", "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '1 day', $6, $7, NOW())
  `, [task2Id, 'Implement Dark Mode Toggle', 'Use Tailwind CSS class strategy.', 'HIGH', 'IN_PROGRESS', project1Id, adminId]);
  await client.query(`INSERT INTO "TaskMember" (id, "taskId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), task2Id, adminId]);
  await client.query(`INSERT INTO "TaskMember" (id, "taskId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), task2Id, member1Id]);

  const task3Id = uuidv4();
  await client.query(`
    INSERT INTO "Task" (id, title, description, priority, status, "dueDate", "projectId", "createdBy", "createdAt")
    VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days', $6, $7, NOW())
  `, [task3Id, 'Push Notifications Integration', 'Setup Firebase Cloud Messaging.', 'MEDIUM', 'TODO', project2Id, adminId]);
  await client.query(`INSERT INTO "TaskMember" (id, "taskId", "userId") VALUES ($1, $2, $3)`, [uuidv4(), task3Id, member2Id]);

  console.log('Creating comments and notifications...');
  await client.query(`
    INSERT INTO "Comment" (id, "taskId", "userId", message, "createdAt")
    VALUES ($1, $2, $3, $4, NOW())
  `, [uuidv4(), task1Id, member1Id, 'I have pushed the latest Figma designs.']);

  await client.query(`
    INSERT INTO "Notification" (id, "userId", message, type, "isRead", link, "createdAt")
    VALUES ($1, $2, $3, $4, false, $5, NOW())
  `, [uuidv4(), member1Id, 'You have been assigned to the "Website Redesign" project.', 'PROJECT_ASSIGNMENT', `/projects/${project1Id}`]);

  await client.query(`
    INSERT INTO "Notification" (id, "userId", message, type, "isRead", link, "createdAt")
    VALUES ($1, $2, $3, $4, false, $5, NOW())
  `, [uuidv4(), adminId, 'John Doe completed the "Design new Hero section" task.', 'TASK_COMPLETED', `/projects/${project1Id}`]);

  console.log('Database seeded successfully!');
  console.log('Demo Admin:', 'admin@example.com / password123');
  console.log('Demo Member:', 'john@example.com / password123');
  
  await client.end();
}

main().catch(console.error);
