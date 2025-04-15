import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  useGetBenefitClassStructuresQuery,
  useGetBenefitClassStructureByIdQuery,
} from '../../../store/apis/benefitClassApi';
import { clientLogger } from '../../../utils/clientLogger';

interface BenefitClassStructure {
  _id: string;
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  numberOfClasses: number;
  classes: Array<{
    id: string;
    name: string;
    benefits: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

const FetchSavedStructures: React.FC = () => {
  const [selectedStructure, setSelectedStructure] = useState<BenefitClassStructure | null>(null);
  const [detailedStructure, setDetailedStructure] = useState<BenefitClassStructure | null>(null);
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

  const handleRowClick = (structure: BenefitClassStructure) => {
    setSelectedStructure(structure);
    setSelectedId(structure._id);
  };

  const detailedQuery = useGetBenefitClassStructureByIdQuery(selectedId || '');

  useEffect(() => {
    if (detailedQuery.data) {
      setDetailedStructure(detailedQuery.data);
    }
  }, [detailedQuery.data]);

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
        refetch();
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell>Market Segment</TableCell>
              <TableCell>Product Type</TableCell>
              <TableCell>Number of Classes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {structuresList.map((structure) => (
              <TableRow
                key={structure._id}
                onClick={() => handleRowClick(structure)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{structure.name}</TableCell>
                <TableCell>{structure.effectiveDate}</TableCell>
                <TableCell>{structure.marketSegment}</TableCell>
                <TableCell>{structure.productType}</TableCell>
                <TableCell>{structure.numberOfClasses}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedStructure}
        onClose={() => {
          setSelectedStructure(null);
          setDetailedStructure(null);
        }}
        maxWidth="md"
        fullWidth
      >
        {detailedStructure && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{detailedStructure.name}</Typography>
                <IconButton
                  onClick={() => {
                    setSelectedStructure(null);
                    setDetailedStructure(null);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  height: '60vh',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {JSON.stringify(detailedStructure, null, 2)}
              </pre>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default FetchSavedStructures;
