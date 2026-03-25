export interface CashFlowInput {
  grandTotalKsh: number;
  startDate: string;
  endDate: string;
  curve: 'S_CURVE' | 'LINEAR' | 'FRONT_LOADED' | 'BACK_LOADED';
}

export interface CashFlowWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  phase: string;
  plannedSpendKsh: number;
  cumulativeKsh: number;
  percentComplete: number;
  dailyBurnKsh: number;
}

const S_CURVE_WEIGHTS = [0.02, 0.05, 0.10, 0.15, 0.18, 0.16, 0.13, 0.10, 0.07, 0.04];
const LINEAR_WEIGHTS = [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10];
const FRONT_LOADED = [0.18, 0.16, 0.14, 0.12, 0.10, 0.09, 0.08, 0.06, 0.05, 0.02];
const BACK_LOADED = [0.02, 0.05, 0.06, 0.08, 0.09, 0.10, 0.12, 0.14, 0.16, 0.18];

const PHASE_NAMES = [
  'Mobilisation',
  'Substructure',
  'Superstructure',
  'Superstructure',
  'Superstructure',
  'Services',
  'Services',
  'Finishes',
  'Finishes',
  'Commissioning',
];

export function generateCashFlow(input: CashFlowInput): CashFlowWeek[] {
  const { grandTotalKsh, startDate, endDate, curve } = input;

  let weights: number[];
  switch (curve) {
    case 'FRONT_LOADED':
      weights = FRONT_LOADED;
      break;
    case 'BACK_LOADED':
      weights = BACK_LOADED;
      break;
    case 'LINEAR':
      weights = LINEAR_WEIGHTS;
      break;
    default:
      weights = S_CURVE_WEIGHTS;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const totalWeeks = Math.ceil(totalDays / 7);

  const weeksPerBand = totalWeeks / 10;
  const weeks: CashFlowWeek[] = [];
  let cumulative = 0;

  for (let w = 0; w < totalWeeks; w++) {
    const band = Math.min(Math.floor(w / weeksPerBand), 9);
    const bandShare = weights[band] / weeksPerBand;
    const weekSpend = grandTotalKsh * bandShare;
    cumulative += weekSpend;

    const weekStart = new Date(start.getTime() + w * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

    weeks.push({
      weekNumber: w + 1,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      phase: PHASE_NAMES[band],
      plannedSpendKsh: Math.round(weekSpend),
      cumulativeKsh: Math.round(cumulative),
      percentComplete: Math.round((cumulative / grandTotalKsh) * 100),
      dailyBurnKsh: Math.round(weekSpend / 7),
    });
  }

  return weeks;
}

export function getDailyBurnSummary(weeks: CashFlowWeek[]) {
  if (weeks.length === 0) {
    return {
      averageDailyBurnKsh: 0,
      peakDailyBurnKsh: 0,
      peakPhase: '',
      peakWeekNumber: 0,
    };
  }

  const avgDaily = weeks.reduce((s, w) => s + w.dailyBurnKsh, 0) / weeks.length;
  const peakWeek = weeks.reduce((a, b) => (b.dailyBurnKsh > a.dailyBurnKsh ? b : a));

  return {
    averageDailyBurnKsh: Math.round(avgDaily),
    peakDailyBurnKsh: peakWeek.dailyBurnKsh,
    peakPhase: peakWeek.phase,
    peakWeekNumber: peakWeek.weekNumber,
  };
}

export function generateCashFlowFromProject(
  grandTotalKsh: number,
  startDate: string | null,
  endDate: string | null,
  curve: string = 'S_CURVE'
): { weeks: CashFlowWeek[]; summary: ReturnType<typeof getDailyBurnSummary> } | null {
  if (!startDate || !endDate || grandTotalKsh <= 0) {
    return null;
  }

  const weeks = generateCashFlow({
    grandTotalKsh,
    startDate,
    endDate,
    curve: curve as 'S_CURVE' | 'LINEAR' | 'FRONT_LOADED' | 'BACK_LOADED',
  });

  const summary = getDailyBurnSummary(weeks);

  return { weeks, summary };
}