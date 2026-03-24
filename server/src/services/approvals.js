import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createApprovalWorkflow = async (data) => {
  return prisma.approvalWorkflow.create({
    data: {
      name: data.name,
      threshold: data.threshold,
      approvers: {
        create: data.approvers.map((approverId, index) => ({
          stepNumber: index + 1,
          approverId,
        })),
      },
    },
    include: { approvers: true },
  });
};

export const getApprovalWorkflows = async () => {
  return prisma.approvalWorkflow.findMany({
    include: {
      approvers: {
        include: { approver: { select: { id: true, name: true, email: true } } },
        orderBy: { stepNumber: 'asc' },
      },
    },
  });
};

export const checkQuoteApproval = async (quoteId) => {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { approval: true },
  });

  if (!quote) return null;

  const workflows = await prisma.approvalWorkflow.findMany({
    where: {
      active: true,
      threshold: { lte: quote.total },
    },
    orderBy: { threshold: 'desc' },
    take: 1,
    include: {
      approvers: {
        orderBy: { stepNumber: 'asc' },
      },
    },
  });

  if (workflows.length === 0) {
    return { requiresApproval: false };
  }

  const workflow = workflows[0];

  if (quote.approval) {
    const approval = await prisma.quoteApproval.findUnique({
      where: { id: quote.approval.id },
      include: {
        workflow: {
          include: {
            approvers: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        },
      },
    });

    const currentStep = approval.workflow.approvers[approval.currentStep - 1];
    return {
      requiresApproval: true,
      workflowId: approval.workflowId,
      currentStep: approval.currentStep,
      status: approval.status,
      approverId: currentStep?.approverId,
    };
  }

  return {
    requiresApproval: true,
    workflowId: workflow.id,
    threshold: workflow.threshold,
    totalSteps: workflow.approvers.length,
  };
};

export const approveQuote = async (quoteId, approverId, comments = null) => {
  const approval = await prisma.quoteApproval.findFirst({
    where: { quoteId },
    include: {
      workflow: {
        include: {
          approvers: { orderBy: { stepNumber: 'asc' } },
        },
      },
    },
  });

  if (!approval) {
    throw new Error('No approval workflow found for this quote');
  }

  const currentStep = approval.workflow.approvers[approval.currentStep - 1];
  if (!currentStep || currentStep.approverId !== approverId) {
    throw new Error('You are not the current approver');
  }

  await prisma.approvalStep.update({
    where: { id: currentStep.id },
    data: { status: 'APPROVED', comments },
  });

  const isLastStep = approval.currentStep >= approval.workflow.approvers.length;
  if (isLastStep) {
    await prisma.quoteApproval.update({
      where: { id: approval.id },
      data: { status: 'APPROVED' },
    });

    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'SENT' },
    });

    return { status: 'APPROVED', finalApproval: true };
  }

  await prisma.quoteApproval.update({
    where: { id: approval.id },
    data: { currentStep: approval.currentStep + 1 },
  });

  const nextStep = approval.workflow.approvers[approval.currentStep];
  return {
    status: 'PENDING_NEXT_STEP',
    nextStep: approval.currentStep + 1,
    nextApproverId: nextStep?.approverId,
  };
};

export const rejectQuote = async (quoteId, approverId, comments = null) => {
  const approval = await prisma.quoteApproval.findFirst({
    where: { quoteId },
    include: {
      workflow: {
        include: {
          approvers: { orderBy: { stepNumber: 'asc' } },
        },
      },
    },
  });

  if (!approval) {
    throw new Error('No approval workflow found for this quote');
  }

  const currentStep = approval.workflow.approvers[approval.currentStep - 1];
  if (!currentStep || currentStep.approverId !== approverId) {
    throw new Error('You are not the current approver');
  }

  await prisma.approvalStep.update({
    where: { id: currentStep.id },
    data: { status: 'REJECTED', comments },
  });

  await prisma.quoteApproval.update({
    where: { id: approval.id },
    data: { status: 'REJECTED' },
  });

  return { status: 'REJECTED' };
};

export const getPendingApprovals = async (userId) => {
  return prisma.quoteApproval.findMany({
    where: {
      status: 'PENDING',
      workflow: {
        approvers: {
          some: {
            approverId: userId,
            status: 'PENDING',
          },
        },
      },
    },
    include: {
      quote: {
        include: {
          project: { include: { client: true } },
        },
      },
      workflow: {
        include: {
          approvers: {
            include: { approver: { select: { id: true, name: true } } },
            orderBy: { stepNumber: 'asc' },
          },
        },
      },
    },
  });
};

export default {
  createApprovalWorkflow,
  getApprovalWorkflows,
  checkQuoteApproval,
  approveQuote,
  rejectQuote,
  getPendingApprovals,
};
