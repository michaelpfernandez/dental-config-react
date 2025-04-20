import {
  MarketSegment,
  ProductType,
  CoverageType,
  NetworkTiers,
  CostShareType,
} from '../types/enums';

export const enumDisplayNames = {
  // Market Segments
  [MarketSegment.Individual]: 'Individual',
  [MarketSegment.Large]: 'Large Group',
  [MarketSegment.Small]: 'Small Group',

  // Product Types
  [ProductType.PPO]: 'PPO',
  [ProductType.DHMO]: 'DHMO',
  [ProductType.POS]: 'POS',

  // Coverage Types
  [CoverageType.Adult]: 'Adult Only',
  [CoverageType.Pediatric]: 'Pediatric Only',
  [CoverageType.Both]: 'Both Adult & Pediatric',
  [CoverageType.Family]: 'Family',

  // Network Tiers
  [NetworkTiers.SingleTier]: 'Single Tier',
  [NetworkTiers.TwoTiers]: 'Two Tiers',
  [NetworkTiers.ThreeTiers]: 'Three Tiers',

  // Cost Share Types
  [CostShareType.Copay]: 'Copay Only',
  [CostShareType.Coinsurance]: 'Coinsurance Only',
  [CostShareType.CopayThenCoinsurance]: 'Copay Then Coinsurance',
  [CostShareType.DeductibleThenCoinsurance]: 'Deductible Then Coinsurance',
  [CostShareType.DeductibleThenCopay]: 'Deductible Then Copay',
  [CostShareType.NotCovered]: 'Not Covered',
};

export const getEnumDisplayName = (enumValue: string | number) => {
  return enumDisplayNames[enumValue as keyof typeof enumDisplayNames] || enumValue.toString();
};

export const getEnumOptions = <T extends string | number>(enumObj: Record<T, string | number>) => {
  return Object.values(enumObj).map((value) => ({
    value: value,
    label: getEnumDisplayName(value),
  }));
};
