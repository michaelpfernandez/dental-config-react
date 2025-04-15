export enum MarketSegment {
  Individual = 'Individual',
  Large = 'Large',
  Small = 'Small',
}

export enum ProductType {
  PPO = 'PPO',
  DHMO = 'DHMO',
  POS = 'POS',
}

export enum CoverageType {
  Adult = 'Adult',
  Pediatric = 'Pediatric',
  Both = 'Both',
  Family = 'Family',
}

export enum NetworkTiers {
  SingleTier = 1,
  TwoTier = 2,
  ThreeTier = 3,
}

export enum CostShareType {
  Copay = 'COPAY',
  Coinsurance = 'COINSURANCE',
  CopayThenCoinsurance = 'COPAY_THEN_COINSURANCE',
  DeductibleThenCoinsurance = 'DEDUCTIBLE_THEN_COINSURANCE',
  DeductibleThenCopay = 'DEDUCTIBLE_THEN_COPAY',
  NotCovered = 'NOT_COVERED',
}

export const COST_SHARE_CONFIG = {
  [CostShareType.Copay]: {
    hasCopay: true,
    hasCoinsurance: false,
  },
  [CostShareType.Coinsurance]: {
    hasCopay: false,
    hasCoinsurance: true,
  },
  [CostShareType.CopayThenCoinsurance]: {
    hasCopay: true,
    hasCoinsurance: true,
  },
  [CostShareType.DeductibleThenCoinsurance]: {
    hasCopay: false,
    hasCoinsurance: true,
  },
  [CostShareType.DeductibleThenCopay]: {
    hasCopay: true,
    hasCoinsurance: false,
  },
  [CostShareType.NotCovered]: {
    hasCopay: false,
    hasCoinsurance: false,
  },
} as const;

export enum LimitIntervalType {
  PerVisit = 'per_visit',
  PerYear = 'per_year',
  PerLifetime = 'per_lifetime',
}

export enum UnitType {
  PerTooth = 'per_tooth',
  PerItem = 'per_item',
  N_A = 'n/a',
}
