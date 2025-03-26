import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography } from '@mui/material';

interface BenefitClass {
  name: string;
  description: string;
  // Add other fields as necessary
}

const EditableBenefitClassCard: React.FC<{
  benefitClass: BenefitClass;
  onSave: (updatedClass: BenefitClass) => void;
}> = ({ benefitClass, onSave }) => {
  const [formData, setFormData] = useState<BenefitClass>(benefitClass);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5">Edit Benefit Class</Typography>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {/* Add other fields as necessary */}
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
};

export default EditableBenefitClassCard;
