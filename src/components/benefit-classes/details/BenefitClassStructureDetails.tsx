import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
} from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import {
  useGetBenefitClassStructureByIdQuery,
  useDeleteBenefitClassStructureMutation,
} from '../../../store/apis/benefitClassApi';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setLocalStructure, setSelectedStructure } from '../../../store/slices/benefitClassSlice';

const BenefitClassStructureDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: structure, isLoading, error } = useGetBenefitClassStructureByIdQuery(id || '');
  const [deleteStructure, { isLoading: isDeleting }] = useDeleteBenefitClassStructureMutation();

  useEffect(() => {
    if (id) {
      dispatch(setSelectedStructure(id));
    }
    return () => {
      dispatch(setSelectedStructure(null));
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (structure) {
      dispatch(setLocalStructure(structure));
    }
  }, [structure, dispatch]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this benefit class structure?')) {
      try {
        await deleteStructure(id || '').unwrap();
        navigate('/benefit-class-structures');
      } catch (err) {}
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !structure) {
    return (
      <Box textAlign="center" py={10}>
        <Typography color="error">Error loading benefit class structure details</Typography>
        <Button component={Link} to="/benefit-class-structures" variant="contained">
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container justifyContent="space-between" alignItems="center" mb={6}>
        <Grid item>
          <IconButton
            aria-label="Back to list"
            sx={{ mr: 4 }}
            component={Link}
            to="/benefit-class-structures"
          >
            <FaArrowLeft />
          </IconButton>
          <Typography variant="h4">{structure.name}</Typography>
        </Grid>
        <Grid item>
          <Button
            component={Link}
            to={`/benefit-class-structures/${id}/edit`}
            variant="contained"
            sx={{ mr: 2, textTransform: 'none' }}
          >
            Edit
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </Grid>
      </Grid>

      <Card sx={{ mb: 6 }}>
        <CardHeader title="General Information" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>Market Segment: {structure.marketSegment}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>Product Type: {structure.productType}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>Effective Date: {structure.effectiveDate}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>Number of Classes: {structure.numberOfClasses}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" mb={4}>
        Benefit Classes
      </Typography>

      <Grid container spacing={2}>
        {structure.classes.map((classItem) => (
          <Grid item key={classItem.id} xs={12} md={4}>
            <Card>
              <CardHeader
                title={classItem.name || `Class ${classItem.id}`}
                subheader={`${classItem.benefits.length} Benefits`}
              />
              <CardContent>
                {classItem.benefits.length > 0 ? (
                  <Box>
                    {classItem.benefits.map((benefit) => (
                      <Typography key={benefit.code} fontSize="small">
                        {benefit.name} ({benefit.code})
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography fontSize="small" color="text.secondary">
                    No benefits assigned
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={6}>
        <Typography fontSize="small" color="text.secondary">
          Created: {structure.createdAt ? new Date(structure.createdAt).toLocaleString() : 'N/A'}
          {structure.createdBy ? ` by ${structure.createdBy}` : ''}
        </Typography>
        <Typography fontSize="small" color="text.secondary">
          Last Modified:{' '}
          {structure.lastModifiedAt ? new Date(structure.lastModifiedAt).toLocaleString() : 'N/A'}
          {structure.lastModifiedBy ? ` by ${structure.lastModifiedBy}` : ''}
        </Typography>
      </Box>
    </Box>
  );
};

export default BenefitClassStructureDetails;
