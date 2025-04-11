import { MarketSegment, ProductType, LimitIntervalType } from './enums';

export const marketSegmentDisplayNames: Record<MarketSegment, string> = {
  [MarketSegment.Individual]: 'Individual',
  [MarketSegment.Large]: 'Large Group',
  [MarketSegment.Small]: 'Small Group',
};

export const productTypeDisplayNames: Record<ProductType, string> = {
  [ProductType.PPO]: 'PPO',
  [ProductType.DHMO]: 'DHMO',
  [ProductType.POS]: 'POS',
};

export const limitIntervalDisplayNames: Record<LimitIntervalType, string> = {
  [LimitIntervalType.PerYear]: 'Per Year',
  [LimitIntervalType.PerVisit]: 'Per Visit',
  [LimitIntervalType.PerLifetime]: 'Per Lifetime',
};

export const getDisplayName = {
  marketSegment: (segment: MarketSegment) => marketSegmentDisplayNames[segment],
  productType: (type: ProductType) => productTypeDisplayNames[type],
  limitInterval: (interval: LimitIntervalType) => limitIntervalDisplayNames[interval],
};
