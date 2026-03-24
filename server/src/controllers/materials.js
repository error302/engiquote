import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMaterial = async (req, res) => {
  try {
    const material = await prisma.material.create({
      data: req.body
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const material = await prisma.material.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
