const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET ALL PROJECTS (FIXED: Dengan Pagination, Search, & Filter Akses)
exports.getAllProjects = async (req, res) => {
    // 1. Ambil Query Parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // 2. Filter Search
    const searchFilter = search ? {
        OR: [
            { name: { contains: search } }, 
            { description: { contains: search } }
        ]
    } : {};

    // 3. Filter Hak Akses (Owner atau Member)
    let accessFilter = {};
    if (req.user.role !== 'ADMIN') {
        accessFilter = {
            OR: [
                { ownerId: req.user.id }, // Milik sendiri
                { members: { some: { userId: req.user.id } } } // Diundang sebagai member
            ]
        };
    }

    const whereCondition = { AND: [searchFilter, accessFilter] };

    // 4. Query Database (Mengambil data owner dan member untuk Frontend)
    const projects = await prisma.project.findMany({
        where: whereCondition,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            members: { include: { user: { select: { email: true } } } }
        }
    });

    // 5. Hitung Total Data
    const totalRecords = await prisma.project.count({ where: whereCondition });

    // 6. Kirim Response (Format yang Diharapkan Frontend)
    res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data project',
        data: { projects: projects },
        pagination: {
            current_page: page,
            total_pages: Math.ceil(totalRecords / limit),
            total_records: totalRecords,
            limit: limit
        }
    });
};

exports.createProject = async (req, res) => {
    // ATURAN KRITIS 3: Periksa Role di Backend.
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya Admin yang dapat membuat Project baru.' 
        });
    }

    const { name, description } = req.body;
    const ownerId = req.user.id; // Owner adalah Admin yang sedang login

    // Jika ada error (misal, DB down) akan ditangkap Global Handler
    const newProject = await prisma.project.create({
        data: { name, description, ownerId }
    });

    res.status(201).json({ success: true, message: 'Project berhasil dibuat', data: { project: newProject } });
};

// 3. DELETE PROJECT (Cleaned)
exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });

    if (!project) return res.status(404).json({ success: false, message: 'Project tidak ditemukan' });

    // Validasi Kepemilikan (Kecuali Admin)
    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Anda bukan pemilik project ini' });
    }

    // Jika delete gagal, error Prisma akan ditangkap
    await prisma.project.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Project berhasil dihapus' });
};

// 4. INVITE MEMBER (Cleaned)
exports.inviteMember = async (req, res) => {
    const { id } = req.params; 
    const { email } = req.body; 

    // 1. Cek Project
    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!project) return res.status(404).json({ success: false, message: 'Project tidak ditemukan' });

    // 2. Cek Owner/Admin
    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Hanya pemilik project yang bisa mengundang member' });
    }

    // 3. Cari User & Cek Status Member
    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) return res.status(404).json({ success: false, message: 'Email user tidak ditemukan di sistem' });
    const existingMember = await prisma.projectMember.findFirst({
        where: { projectId: parseInt(id), userId: userToInvite.id }
    });
    if (existingMember) return res.status(400).json({ success: false, message: 'User ini sudah menjadi member' });

    // 4. Create ProjectMember
    await prisma.projectMember.create({
        data: { projectId: parseInt(id), userId: userToInvite.id }
    });

    res.status(200).json({ success: true, message: `Berhasil mengundang ${email}` });
};