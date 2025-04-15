import { MarketSegment, ProductType, CoverageType, NetworkTiers } from '../types/enums';

export const enumDisplayNames = {
  [MarketSegment.Individual]: 'Individual',
  [MarketSegment.Large]: 'Large Group',
  [MarketSegment.Small]: 'Small Group',
  [ProductType.PPO]: 'PPO',
  [ProductType.DHMO]: 'DHMO',
  [ProductType.POS]: 'POS',
  [CoverageType.Adult]: 'Adult Only',
  [CoverageType.Pediatric]: 'Pediatric Only',
  [CoverageType.Both]: 'Both Adult & Pediatric',
  [CoverageType.Family]: 'Family',
  [NetworkTiers.SingleTier]: 'Single Tier',
  [NetworkTiers.TwoTiers]: 'Two Tiers',
  [NetworkTiers.ThreeTiers]: 'Three Tiers',
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
