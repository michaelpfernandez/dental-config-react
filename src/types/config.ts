// Benefit Class Types
export interface BenefitClass {
  id: string;
  name: string;
  description: string;
  defaultCostShare: number;
}

export interface BenefitClassConfig {
  [key: string]: BenefitClass;
}

// Benefit Types
export interface BenefitLimit {
  quantity: number;
  unit: string;
  period: string;
}

export interface Benefit {
  code: string;
  name: string;
  classId: string;
  defaultLimits: BenefitLimit[];
}

export interface BenefitsByClass {
  [key: string]: {
    [key: string]: Benefit;
  };
}

// Plan Attribute Types
export interface ValidationRule {
  min?: number;
  max?: number;
}

export interface AttributeOption<T> {
  options: T[];
  default: T;
  validation?: ValidationRule;
  unit?: string;
  period?: string;
}

export interface DefaultLimits {
  annual_maximum: {
    adult: AttributeOption<number | string>;
    pediatric: AttributeOption<string>;
  };
  deductible: {
    individual: AttributeOption<number>;
    family: AttributeOption<number>;
  };
  waiting_periods: {
    basic: AttributeOption<number>;
    major: AttributeOption<number>;
  };
}

export interface PlanAttributes {
  marketSegment: AttributeOption<string>;
  customizationLevel: AttributeOption<string>;
  productType: AttributeOption<string>;
  coverageType: AttributeOption<string>;
  innTiers: AttributeOption<number>;
  oonCoverage: AttributeOption<boolean>;
  defaultLimits: DefaultLimits;
}

// Config validation functions
export const validateBenefitClass = (config: BenefitClassConfig): boolean => {
  return Object.values(config).every(
    (bc) =>
      typeof bc.id === 'string' &&
      typeof bc.name === 'string' &&
      typeof bc.description === 'string' &&
      typeof bc.defaultCostShare === 'number' &&
      bc.defaultCostShare >= 0 &&
      bc.defaultCostShare <= 100,
  );
};

export const validateBenefits = (config: BenefitsByClass): boolean => {
  return Object.values(config).every((classGroup) =>
    Object.values(classGroup).every(
      (benefit) =>
        typeof benefit.code === 'string' &&
        typeof benefit.name === 'string' &&
        typeof benefit.classId === 'string' &&
        Array.isArray(benefit.defaultLimits) &&
        benefit.defaultLimits.every(
          (limit) =>
            typeof limit.quantity === 'number' &&
            typeof limit.unit === 'string' &&
            typeof limit.period === 'string',
        ),
    ),
  );
};

// Helper function to load and validate configs
export const loadConfig = async <T>(
  path: string,
  validator: (config: T) => boolean,
): Promise<T> => {
  try {
    const config = await import(path);
    if (!validator(config)) {
      throw new Error(`Invalid configuration in ${path}`);
    }
    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration from ${path}: ${error}`);
  }
};
