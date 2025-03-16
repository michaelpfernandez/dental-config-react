import fetch, { Response } from 'node-fetch';
import { MarketSegment, CustomizationLevel, ProductType, CoverageType } from '../models/DentalPlan';
import { Document } from 'mongoose';
import { serverLogger } from '../utils/serverLogger';

interface IDentalPlanResponse extends Document {
  header: {
    effectiveDate: Date;
    marketSegment: string;
    customizationLevel: string;
    productType: string;
    innTiers: number;
    oonCoverage: boolean;
    coverageType: string;
    createdBy?: string;
    createdAt?: Date;
    lastModifiedBy?: string;
    lastModifiedAt?: Date;
  };
  permissions?: {
    roles: string[];
    actionRights: Record<string, string[]>;
  };
}

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

const BASE_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = '1'; // Admin user ID from auth.json

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  if (response.status === 204) {
    return {};
  }
  const data = (await response.json()) as T;
  return { data };
}

async function testEndpoints() {
  const headers = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Create a new dental plan
    serverLogger.info('Testing POST /api/plans');
    const createResponse = await fetch(`${BASE_URL}/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        header: {
          effectiveDate: new Date(),
          marketSegment: MarketSegment.Small,
          customizationLevel: CustomizationLevel.Standard,
          productType: ProductType.PPO,
          innTiers: 2,
          oonCoverage: true,
          coverageType: CoverageType.Both,
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
                        unit: 'visit',
                        period: 'year',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        options: {},
      }),
    });
    const { data: newPlan } = await handleResponse<IDentalPlanResponse>(createResponse);
    serverLogger.info('Created plan:', { id: newPlan?._id });

    // 2. List all plans
    serverLogger.info('Testing GET /api/plans');
    const listResponse = await fetch(`${BASE_URL}/plans`, { headers });
    const { data: plans } = await handleResponse<IDentalPlanResponse[]>(listResponse);
    serverLogger.info('Found plans:', { count: plans?.length || 0 });

    // 3. Get the created plan
    serverLogger.info('Testing GET /api/plans/:id');
    if (newPlan?._id) {
      const getResponse = await fetch(`${BASE_URL}/plans/${newPlan._id}`, { headers });
      const { data: plan } = await handleResponse<IDentalPlanResponse>(getResponse);
      serverLogger.info('Retrieved plan:', { header: plan?.header });

      // 4. Update the plan
      serverLogger.info('Testing PUT /api/plans/:id');
      const updateResponse = await fetch(`${BASE_URL}/plans/${newPlan._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          header: {
            ...plan?.header,
            marketSegment: MarketSegment.Large,
          },
        }),
      });
      const { data: updatedPlan } = await handleResponse<IDentalPlanResponse>(updateResponse);
      serverLogger.info('Updated plan market segment:', {
        marketSegment: updatedPlan?.header.marketSegment,
      });

      // 5. Delete the plan
      serverLogger.info('Testing DELETE /api/plans/:id');
      const deleteResponse = await fetch(`${BASE_URL}/plans/${newPlan._id}`, {
        method: 'DELETE',
        headers,
      });
      await handleResponse(deleteResponse);
      serverLogger.info('Delete status:', { success: deleteResponse.status === 204 });

      // 6. Verify deletion
      serverLogger.info('Verifying deletion');
      const verifyResponse = await fetch(`${BASE_URL}/plans/${newPlan._id}`, { headers });
      serverLogger.info('Verify status:', {
        success: verifyResponse.status === 404,
        message: verifyResponse.status === 404 ? 'Plan successfully deleted' : 'Plan still exists',
      });
    }
  } catch (error) {
    serverLogger.error('Test failed:', error);
  }
}

// Wait for servers to start
setTimeout(testEndpoints, 3000);
