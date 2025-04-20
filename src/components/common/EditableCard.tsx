import React, { useState, ReactNode } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface EditableCardProps {
  title: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  onEditClick?: () => void;
  showEditButton?: boolean;
}

const EditableCard: React.FC<EditableCardProps> = ({
  title,
  children,
  onSave,
  onCancel,
  isEditing = false,
  onEditClick,
  showEditButton = true,
}) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom style={{ marginBottom: 0 }}>
            {title}
          </Typography>
          {showEditButton && !isEditing && (
            <IconButton onClick={onEditClick} size="small">
              <EditIcon />
            </IconButton>
          )}
        </Box>
        {children}
      </CardContent>
      {isEditing && (
        <CardActions sx={{ justifyContent: 'flex-end', padding: 2 }}>
          <Button onClick={onCancel} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" color="primary" sx={{ ml: 1 }}>
            Done
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default EditableCard;
