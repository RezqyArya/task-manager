require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Memulai Seeding Database...');

    // 1. HASH PASSWORD
    const hashedPassword = await bcrypt.hash('123456', 12);
    const password = hashedPassword; // Gunakan hash untuk semua user

    // 2. HAPUS DATA LAMA (Memastikan Idempotency: Child -> Parent)
    console.log('🗑️ Menghapus data lama...');
    await prisma.projectMember.deleteMany(); // Hapus relasi M:N
    await prisma.task.deleteMany();          // Hapus Task (Child dari Project)
    await prisma.project.deleteMany();       // Hapus Project (Child dari User)
    await prisma.user.deleteMany();          // Hapus User (Parent)
    console.log('🗑️ Penghapusan selesai.');

    // 3. BUAT USER (Parent)

    // 3A. Admin (1 akun)
    const admin = await prisma.user.create({
        data: { email: 'admin@gmail.com', name: 'Admin Utama', password, role: 'ADMIN' },
    });
    
    // 3B. Regular Users (Minimal 4 akun: User + 3 tambahan)
    const user1 = await prisma.user.create({
        data: { email: 'user@gmail.com', name: 'Karyawan Rajin', password, role: 'USER' },
    });
    const user2 = await prisma.user.create({
        data: { email: 'john.doe@gmail.com', name: 'John Doe', password, role: 'USER' },
    });
    const user3 = await prisma.user.create({
        data: { email: 'jane.doe@gmail.com', name: 'Jane Doe', password, role: 'USER' },
    });
    const user4 = await prisma.user.create({
        data: { email: 'mark.lee@gmail.com', name: 'Mark Lee', password, role: 'USER' },
    });
    
    console.log(`✅ ${5} User berhasil dibuat.`);
    const users = [admin, user1, user2, user3, user4];

    // 4. BUAT PROJECT (Minimal 5 Project: Parent dari Task)
    const project1 = await prisma.project.create({
        data: {
            name: 'Project Web Development',
            description: 'Pembangunan website utama perusahaan.',
            ownerId: admin.id
        }
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'Project Mobile App V2',
            description: 'Pengembangan versi 2 aplikasi mobile.',
            ownerId: user1.id
        }
    });
    
    const project3 = await prisma.project.create({
        data: { name: 'Project Marketing Campaign', description: 'Peluncuran kampanye media sosial Q4.', ownerId: admin.id }
    });

    const project4 = await prisma.project.create({
        data: { name: 'Project Internal Tools', description: 'Membuat tools internal untuk HR.', ownerId: user2.id }
    });

    const project5 = await prisma.project.create({
        data: { name: 'Project Documentation', description: 'Merapikan semua dokumen teknis.', ownerId: user3.id }
    });
    
    console.log(`✅ ${5} Project berhasil dibuat.`);

    // 5. BUAT TASK (Mengganti createMany dengan loop create)
    const tasksData = [
        // Task Project 1 (Web Dev)
        { title: 'Setup database PostgreSQL', description: 'Migrasi dari MySQL ke Postgre.', status: 'TODO', projectId: project1.id },
        { title: 'Desain halaman Login', description: 'Buat UI/UX halaman login.', status: 'IN_PROGRESS', projectId: project1.id },
        { title: 'Integrasi Global Error Handler', description: 'Implementasi middleware error handling.', status: 'DONE', projectId: project1.id },
        
        // Task Project 2 (Mobile App)
        { title: 'Desain Splash Screen', description: 'Buat aset untuk splash screen V2.', status: 'TODO', projectId: project2.id },
        { title: 'Implementasi Fitur Dark Mode', description: 'Ubah tema UI ke dark mode.', status: 'IN_PROGRESS', projectId: project2.id },
        
        // Task Project 3 (Marketing)
        { title: 'Buat konten Instagram', description: 'Buat 5 post untuk 1 minggu.', status: 'DONE', projectId: project3.id },
        { title: 'Jadwalkan Webinar', description: 'Cari tanggal dan pembicara.', status: 'TODO', projectId: project3.id },
    ];

    // Lakukan loop create untuk setiap task
    for (const task of tasksData) {
        await prisma.task.create({ data: task });
    }
    
    console.log(`✅ ${tasksData.length} Task berhasil dibuat.`);

    // 6. BUAT PROJECT MEMBER (Mengganti createMany dengan loop create)
    const membersData = [
        // Admin mengundang John, Jane, Mark ke Project Web Dev
        { projectId: project1.id, userId: user2.id }, // John Doe
        { projectId: project1.id, userId: user3.id }, // Jane Smith
        
        // Admin mengundang User1 ke Project Marketing (milik Admin)
        { projectId: project3.id, userId: user1.id },
        
        { projectId: project2.id, userId: admin.id },
        
        { projectId: project4.id, userId: user3.id },
    ];

    // Lakukan loop create untuk setiap relasi ProjectMember
    for (const member of membersData) {
        await prisma.projectMember.create({ data: member });
    }
    
    console.log(`✅ ${membersData.length} Relasi Project Member berhasil dibuat.`);

main()
    .catch((e) => {
        console.error('❌ Terjadi kesalahan saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
}