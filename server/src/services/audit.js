import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAuditLog = async (userId, action, entityType, entityId, details = null, ipAddress = null) => {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
    },
  });
};

export const getAuditLogs = async (filters = {}) => {
  const where = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.action) where.action = filters.action;

  return prisma.auditLog.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: filters.limit || 100,
    skip: filters.offset || 0,
  });
};

export const getAuditLogsForEntity = async (entityType, entityId) => {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAuditStats = async (companyId, startDate, endDate) => {
  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { user: { select: { id: true, name: true } } },
  });

  const byAction = {};
  const byUser = {};
  const byEntity = {};

  logs.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byUser[log.user.name] = (byUser[log.user.name] || 0) + 1;
    byEntity[log.entityType] = (byEntity[log.entityType] || 0) + 1;
  });

  return { total: logs.length, byAction, byUser, byEntity };
};

export default { createAuditLog, getAuditLogs, getAuditLogsForEntity, getAuditStats };
