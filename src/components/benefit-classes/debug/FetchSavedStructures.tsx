import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Alert, Snackbar } from '@mui/material';
import {
  useGetBenefitClassStructuresQuery,
  useGetBenefitClassStructureByIdQuery,
} from '../../../store/apis/benefitClassApi';
import { clientLogger } from '../../../utils/clientLogger';

const FetchSavedStructures: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clearingDb, setClearingDb] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const {
    data: structuresList,
    error: listError,
    isLoading: listLoading,
    refetch,
  } = useGetBenefitClassStructuresQuery();
  const {
    data: detailedStructure,
    error: detailError,
    isLoading: detailLoading,
  } = useGetBenefitClassStructureByIdQuery(selectedId || '', { skip: !selectedId });

  const clearDatabase = async () => {
    try {
      setClearingDb(true);
      const response = await fetch('/api/debug/clear-benefit-class-structures', {
        method: 'DELETE',
      });

      const result = await response.json();
      clientLogger.info('Clear database result:', result);

      if (response.ok) {
        setSnackbarMessage(`Successfully cleared ${result.count} benefit class structures`);
        setSnackbarSeverity('success');
        // Refresh the list
        refetch();
        // Clear selected ID if any
        setSelectedId(null);
      } else {
        setSnackbarMessage(`Error: ${result.error || 'Unknown error'}`);
        setSnackbarSeverity('error');
      }
    } catch (error) {
      clientLogger.error('Error clearing database:', error);
      setSnackbarMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarSeverity('error');
    } finally {
      setClearingDb(false);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (structuresList) {
      clientLogger.info('Fetched benefit class structures list:', structuresList);
    }
    if (listError) {
      clientLogger.error('Error fetching benefit class structures list:', listError);
    }
  }, [structuresList, listError]);

  useEffect(() => {
    if (detailedStructure) {
      clientLogger.info('Fetched detailed benefit class structure:', detailedStructure);
    }
    if (detailError) {
      clientLogger.error('Error fetching detailed benefit class structure:', detailError);
    }
  }, [detailedStructure, detailError]);

  if (listLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (listError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading data</Typography>
        <pre>{JSON.stringify(listError, null, 2)}</pre>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Saved Benefit Class Structures</Typography>
        <Button variant="contained" color="error" onClick={clearDatabase} disabled={clearingDb}>
          {clearingDb ? 'Clearing...' : 'Clear Database'}
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* List of structures */}
      {structuresList && structuresList.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
          {structuresList.map((structure) => (
            <Paper key={structure._id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">{structure.name}</Typography>
              <Typography variant="body2">Effective Date: {structure.effectiveDate}</Typography>
              <Typography variant="body2">Market Segment: {structure.marketSegment}</Typography>
              <Typography variant="body2">Product Type: {structure.productType}</Typography>
              <Typography variant="body2">
                Number of Classes: {structure.numberOfClasses}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setSelectedId(structure._id)}
                sx={{ mt: 2 }}
              >
                View Complete Details
              </Button>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography>No benefit class structures found</Typography>
      )}

      {/* Detailed view of selected structure */}
      {selectedId && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Detailed Structure
          </Typography>
          {detailLoading ? (
            <CircularProgress />
          ) : detailError ? (
            <Typography color="error">Error loading detailed data</Typography>
          ) : detailedStructure ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">{detailedStructure.name}</Typography>
              <Typography variant="body2">
                Effective Date: {new Date(detailedStructure.effectiveDate).toLocaleDateString()}
              </Typography>

              {/* Classes and Benefits */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Classes and Benefits:
              </Typography>
              {detailedStructure.classes && detailedStructure.classes.length > 0 ? (
                detailedStructure.classes.map((classItem, index) => (
                  <Box key={classItem.id || index} sx={{ ml: 2, mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Class {index + 1}: {classItem.name}
                    </Typography>
                    {classItem.benefits && classItem.benefits.length > 0 ? (
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Benefits:
                        </Typography>
                        <ul>
                          {classItem.benefits.map((benefit, benefitIndex) => (
                            <li key={benefit.id || benefitIndex}>
                              {benefit.name} (ID: {benefit.id})
                            </li>
                          ))}
                        </ul>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        No benefits assigned
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No classes defined</Typography>
              )}

              {/* Complete Raw Data */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">Complete Raw Data:</Typography>
                <pre
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '500px',
                  }}
                >
                  {JSON.stringify(detailedStructure, null, 2)}
                </pre>
              </Box>
            </Paper>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default FetchSavedStructures;
