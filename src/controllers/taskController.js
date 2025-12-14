const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware Otorisasi Task (PENTING!)
exports.checkProjectAccess = async (req, res, next) => {
  const projectId = req.params.projectId || req.task.projectId;
  
  // 1. Admin selalu boleh akses
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // 2. Cek Project
  const project = await prisma.project.findUnique({
    where: { id: parseInt(projectId) },
  });

  if (!project) {
      return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
  }

  // 3. Cek Owner
  if (project.ownerId === req.user.id) {
    return next(); 
  }

  // 4. Cek Member
  const isMember = await prisma.projectMember.findFirst({
    where: {
      projectId: parseInt(projectId),
      userId: req.user.id
    }
  });

  if (isMember) {
    return next(); 
  }

  // Jika tidak Owner, Admin, dan bukan Member
  return res.status(403).json({ success: false, message: 'Akses ditolak: Anda bukan bagian dari project ini.' });
};


// 1. GET ALL TASKS by Project ID
exports.getTasksByProject = async (req, res) => {
  const { projectId } = req.params; 

  // Jika gagal, error akan ditangkap oleh Global Error Handler
  const tasks = await prisma.task.findMany({
    where: { projectId: parseInt(projectId) },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: { tasks } });
};

// 2. CREATE TASK
exports.createTask = async (req, res) => {
  const { title, description } = req.body;
  const { projectId } = req.params; 

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      status: 'TODO', 
      projectId: parseInt(projectId)
    }
  });

  res.status(201).json({ success: true, data: { task: newTask } });
};

// 3. UPDATE TASK (Status/Title/Desc)
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
  if (!task) return res.status(404).json({ success: false, message: 'Task tidak ditemukan' });

  const project = await prisma.project.findUnique({ where: { id: task.projectId } });

  // Otorisasi BOLA (Broken Object Level Authorization)
  // Non-Admin/Owner tidak boleh mengedit Title/Description, hanya boleh menggeser status.
  if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id) {
      if ((updateData.title || updateData.description) && !updateData.status) {
            return res.status(403).json({ success: false, message: 'Akses ditolak: Hanya Owner/Admin yang boleh mengedit detail Task.' });
      }
  }

  const updatedTask = await prisma.task.update({
    where: { id: parseInt(id) },
    data: updateData
  });

  res.status(200).json({ success: true, data: { task: updatedTask } });
};

// 4. DELETE TASK
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  
  const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
  if (!task) return res.status(404).json({ success: false, message: 'Task tidak ditemukan' });

  // Otorisasi: Hanya Owner Project atau Admin yang boleh Hapus Task
  const project = await prisma.project.findUnique({ where: { id: task.projectId } });
  if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak: Hanya Owner/Admin yang boleh menghapus Task.' });
  }

  // Jika gagal delete (misal, DB error), Global Handler akan menangani
  await prisma.task.delete({ where: { id: parseInt(id) } });

  res.status(200).json({ success: true, message: 'Task berhasil dihapus' });
};