export interface Warning {
  level: 'info' | 'warning' | 'error';
  code: string;
  message: string;
}

export interface BoqItem {
  category: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

const COASTAL_COUNTIES = ['MOMBASA', 'LAMU', 'KILIFI', 'KWALE', 'MALINDI'];
const HIGH_WIND_ZONES = ['NAKURU', 'ELDORET', 'NYERI', 'MURANG\'A'];

export function checkTechnologyRules(
  items: BoqItem[], 
  location?: string, 
  projectType?: string
): Warning[] {
  const warnings: Warning[] = [];
  
  const locationUpper = location?.toUpperCase() || '';
  const isCoastal = COASTAL_COUNTIES.some(c => locationUpper.includes(c));
  const isHighWind = HIGH_WIND_ZONES.some(c => locationUpper.includes(c));

  const hasOPC = items.some(i => i.category?.includes('cement-opc') || i.category === 'cement-bag');
  const hasSRC = items.some(i => i.category?.includes('src-cement') || i.category?.includes('sulphate'));
  const hasDPC = items.some(i => i.category?.toLowerCase().includes('dpc') || i.category?.toLowerCase().includes('damp'));
  const hasG30 = items.some(i => i.category?.toLowerCase().includes('g30') || i.category?.toLowerCase().includes('roofing-sheet'));
  const hasG28 = items.some(i => i.category?.toLowerCase().includes('g28') || i.category?.toLowerCase().includes('interlocking-tile'));
  const hasBurntBrick = items.some(i => i.category?.toLowerCase().includes('burnt-brick') || i.category?.toLowerCase().includes('brick'));
  const hasSuspendedFloor = projectType?.toLowerCase().includes('suspended') || projectType?.toLowerCase().includes('first-floor');
  const hasUPVC = items.some(i => i.category?.toLowerCase().includes('upvc') && i.category?.toLowerCase().includes('hot'));
  const hasCPVC = items.some(i => i.category?.toLowerCase().includes('cpvc'));
  const hasPPR = items.some(i => i.category?.toLowerCase().includes('ppr'));

  if (isCoastal && hasOPC && !hasSRC) {
    warnings.push({
      level: 'warning',
      code: 'COASTAL_CEMENT',
      message: 'Coastal location: Consider Sulphate Resistant Cement (SRC) to prevent corrosion in saline conditions.',
    });
  }

  if (isHighWind && hasG30 && !hasG28) {
    warnings.push({
      level: 'warning',
      code: 'HIGH_WIND_ROOFING',
      message: 'High-wind zone (Nakuru/highlands): G30 roofing may be inadequate. Consider G28 gauge or interlocking tiles.',
    });
  }

  if (hasBurntBrick && hasSuspendedFloor) {
    warnings.push({
      level: 'error',
      code: 'SUSPENDED_BRICK',
      message: 'Burnt bricks are not rated for suspended slabs. Specify hollow blocks or precast planks.',
    });
  }

  if (hasUPVC && !hasCPVC && !hasPPR) {
    warnings.push({
      level: 'warning',
      code: 'HOT_WATER_UPVC',
      message: 'uPVC is for cold water only. Specify CPVC or PPR for hot water distribution.',
    });
  }

  if (!hasDPC) {
    warnings.push({
      level: 'info',
      code: 'MISSING_DPC',
      message: 'No damp-proof course in estimate. Required by NCA standards for all masonry buildings.',
    });
  }

  return warnings;
}

export const STATUTORY_FEES = [
  { name: 'NCA Contractor Registration', basis: 'FIXED', fixedKsh: 25000, notes: 'Grade 1-8 annual fee' },
  { name: 'County Building Permit', basis: 'PERCENTAGE', rate: 1.0, notes: '1% of construction cost' },
  { name: 'NEMA EIA Fee', basis: 'RANGE', minKsh: 50000, maxKsh: 500000, notes: 'For projects >5,000 sqm' },
  { name: 'Water Connection', basis: 'FIXED', fixedKsh: 35000, notes: 'Standard connection' },
  { name: 'Sewerage Connection', basis: 'FIXED', fixedKsh: 25000, notes: 'Standard connection' },
  { name: 'Kenya Power Connection', basis: 'FIXED', fixedKsh: 45000, notes: 'Standard residential' },
  { name: "Engineer's Fee", basis: 'PERCENTAGE', rate: 2.0, notes: '2% of structural cost >2 storeys' },
  { name: "Architect's Fee", basis: 'PERCENTAGE', rate: 6.0, notes: '6% of construction cost' },
  { name: "QS Fee", basis: 'PERCENTAGE', rate: 2.0, notes: '2% of project cost >KSh 5M' },
];

export function calculateStatutoryFees(constructionCost: number): { name: string; amount: number }[] {
  return STATUTORY_FEES.map(fee => {
    let amount = 0;
    
    switch (fee.basis) {
      case 'PERCENTAGE':
        amount = constructionCost * ((fee.rate || 0) / 100);
        break;
      case 'FIXED':
        amount = fee.fixedKsh || 0;
        break;
      case 'RANGE':
        amount = (fee.minKsh || 0) + (fee.maxKsh || 0) / 2;
        break;
    }
    
    return {
      name: fee.name,
      amount: Math.round(amount),
      notes: fee.notes,
    };
  });
}