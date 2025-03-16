import connectToDatabase from '../config/database';
import {
  DentalPlan,
  MarketSegment,
  CustomizationLevel,
  ProductType,
  CoverageType,
} from '../models/DentalPlan';

async function testConnection() {
  try {
    await connectToDatabase();
    console.log('Successfully connected to MongoDB Atlas!');

    // Create a sample dental plan with admin user context
    const testPlan = new DentalPlan({
      header: {
        effectiveDate: new Date(),
        marketSegment: MarketSegment.Small,
        customizationLevel: CustomizationLevel.Standard,
        productType: ProductType.PPO,
        innTiers: 2,
        oonCoverage: true,
        coverageType: CoverageType.Both,
        createdBy: 'admin', // Track who created the plan
        createdAt: new Date(),
        lastModifiedBy: 'admin',
        lastModifiedAt: new Date(),
      },
      networks: {
        inn: [
          {
            tier: 1,
            adult: {
              benefitClasses: [
                {
                  name: 'Preventive',
                  defaultCostShare: 0,
                  description: 'Preventive and diagnostic services',
                  actionRights: ['view', 'edit', 'delete'], // Example action rights
                },
              ],
              benefits: [
                {
                  name: 'Routine Cleaning',
                  code: 'D1110',
                  classId: 'preventive',
                  costShare: 0,
                  limits: [
                    {
                      quantity: 2,
                      unit: 'visits',
                      period: 'year',
                    },
                  ],
                  actionRights: ['view', 'edit'], // Example action rights
                },
              ],
            },
          },
        ],
      },
      options: {
        allowCustomization: true,
      },
      // Track permissions at the plan level
      permissions: {
        roles: ['admin', 'dentist'],
        actionRights: {
          admin: ['view', 'edit', 'delete', 'approve'],
          dentist: ['view'],
        },
      },
    });

    await testPlan.save();
    console.log('Successfully created test dental plan!');
    console.log('Plan ID:', testPlan._id);

    // Retrieve the plan to verify
    const retrievedPlan = await DentalPlan.findById(testPlan._id);
    console.log('Retrieved plan:', JSON.stringify(retrievedPlan?.header, null, 2));
    console.log('Plan permissions:', JSON.stringify(retrievedPlan?.permissions, null, 2));
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    process.exit();
  }
}

testConnection();
