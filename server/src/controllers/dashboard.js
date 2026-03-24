import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [totalClients, activeProjects, quotesThisMonth, monthlyRevenue] = await Promise.all([
      prisma.client.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.quote.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.quote.aggregate({
        where: { 
          status: 'ACCEPTED',
          createdAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      })
    ]);
    
    const lastMonthRevenue = await prisma.quote.aggregate({
      where: {
        status: 'ACCEPTED',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { total: true }
    });
    
    const recentQuotes = await prisma.quote.findMany({
      take: 5,
      include: { project: { include: { client: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const revenue = await prisma.quote.aggregate({
        where: {
          status: 'ACCEPTED',
          createdAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { total: true }
      });
      monthlyData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: revenue._sum.total || 0
      });
    }
    
    res.json({
      totalClients,
      activeProjects,
      quotesThisMonth,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      lastMonthRevenue: lastMonthRevenue._sum.total || 0,
      recentQuotes,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
