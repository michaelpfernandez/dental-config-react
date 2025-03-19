import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
} from '@mui/material';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import {
  useGetBenefitClassStructuresQuery,
  useDeleteBenefitClassStructureMutation,
} from '../store/apis/benefitClassApi';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setSelectedStructure } from '../store/slices/benefitClassSlice';

const BenefitClassStructureList: React.FC = () => {
  const { data: structures, isLoading, error, refetch } = useGetBenefitClassStructuresQuery();
  const [deleteStructure, { isLoading: isDeleting }] = useDeleteBenefitClassStructureMutation();
  const dispatch = useAppDispatch();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this benefit class structure?')) {
      try {
        await deleteStructure(id).unwrap();
        alert('Benefit class structure deleted successfully');
      } catch (err) {
        alert('Failed to delete benefit class structure');
      }
    }
  };

  const handleViewDetails = (id: string) => {
    dispatch(setSelectedStructure(id));
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Typography mt={4}>Loading benefit class structures...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Typography color="error">Error loading benefit class structures</Typography>
        <Button mt={4} onClick={() => refetch()}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Typography variant="h4">Benefit Class Structures</Typography>
        <Button component={Link} to="/benefit-class-structures/create" color="primary">
          Create New
        </Button>
      </Box>

      {structures && structures.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Market Segment</TableCell>
                <TableCell>Product Type</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Number of Classes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structures.map((structure) => (
                <TableRow key={structure._id}>
                  <TableCell>{structure.name}</TableCell>
                  <TableCell>{structure.marketSegment}</TableCell>
                  <TableCell>{structure.productType}</TableCell>
                  <TableCell>{new Date(structure.effectiveDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Typography color="primary">{structure.numberOfClasses}</Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      aria-label="View details"
                      size="small"
                      component={Link}
                      to={`/benefit-class-structures/${structure._id}`}
                      onClick={() => handleViewDetails(structure._id)}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      aria-label="Edit"
                      size="small"
                      component={Link}
                      to={`/benefit-class-structures/${structure._id}/edit`}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      aria-label="Delete"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(structure._id)}
                      disabled={isDeleting}
                    >
                      <FaTrash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" py={10}>
          <Typography mb={4}>No benefit class structures found</Typography>
          <Button component={Link} to="/benefit-class-structures/create" color="primary">
            Create Your First Benefit Class Structure
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BenefitClassStructureList;
