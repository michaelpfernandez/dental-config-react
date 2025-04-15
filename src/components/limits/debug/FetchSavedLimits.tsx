import React, { useState } from 'react';
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
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useGetLimitStructuresQuery } from '../../../store/apis/limitApi';
import { clientLogger } from '../../../utils/clientLogger';

interface LimitStructure {
  _id: string;
  name: string;
  effectiveDate: string;
  marketSegment: string;
  productType: string;
  limits: any[];
  createdBy: string;
  lastModifiedAt: string;
}

const FetchSavedLimits: React.FC = () => {
  const [clearingDb, setClearingDb] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { data: limitStructures, error, isLoading, refetch } = useGetLimitStructuresQuery();

  const [selectedStructure, setSelectedStructure] = useState<LimitStructure | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(false);

  const handleRowClick = async (structure: LimitStructure) => {
    setSelectedStructure(structure);
  };

  const clearDatabase = async () => {
    try {
      setClearingDb(true);
      const response = await fetch('/api/debug/clear-limit-structures', {
        method: 'DELETE',
      });

      const result = await response.json();
      clientLogger.info('Clear database result:', result);

      if (response.ok) {
        setSnackbarMessage(`Successfully cleared ${result.count} limit structures`);
        setSnackbarSeverity('success');
        // Refresh the list
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading data</Typography>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </Box>
    );
  }

  if (!limitStructures || limitStructures.length === 0) {
    return <Typography>No limit structures found</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Dialog
        open={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedStructure && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedStructure.name}</Typography>
                <IconButton onClick={() => setSelectedStructure(null)}>
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
                {JSON.stringify(selectedStructure, null, 2)}
              </pre>
            </DialogContent>
          </>
        )}
      </Dialog>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Saved Limit Structures</Typography>
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

      <Typography variant="h6" gutterBottom>
        Saved Limit Structures
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell>Market Segment</TableCell>
              <TableCell>Product Type</TableCell>
              <TableCell>Limits Count</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Last Modified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {limitStructures.map((structure) => (
              <TableRow
                key={structure._id}
                onClick={() => handleRowClick(structure)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{structure.name}</TableCell>
                <TableCell>{structure.effectiveDate}</TableCell>
                <TableCell>{structure.marketSegment}</TableCell>
                <TableCell>{structure.productType}</TableCell>
                <TableCell>{structure.limits.length}</TableCell>
                <TableCell>{structure.createdBy}</TableCell>
                <TableCell>{new Date(structure.lastModifiedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FetchSavedLimits;
