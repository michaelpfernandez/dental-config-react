import React, { useState, useRef, KeyboardEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

interface Benefit {
  id: string;
  name: string;
}

interface BenefitAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  benefits: Benefit[];
  selectedBenefits: string[];
  onBenefitSelect: (benefitIds: string[]) => void;
  onSave: () => void;
  rowIndex: number;
}

const BenefitAssignmentDialog: React.FC<BenefitAssignmentDialogProps> = ({
  open,
  onClose,
  benefits,
  selectedBenefits,
  onBenefitSelect,
  onSave,
  rowIndex,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredBenefits = benefits.filter(
    (benefit) =>
      benefit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      benefit.id.toString().includes(searchQuery)
  );

  const handleSelectBenefit = (benefit: Benefit) => {
    setSearchQuery(benefit.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const filtered = filteredBenefits;

    if (e.key === 'ArrowDown' && showSuggestions && filtered.length > 0) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp' && showSuggestions && filtered.length > 0) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && showSuggestions && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectBenefit(filtered[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const highlightText = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const handleSave = () => {
    onBenefitSelect(selectedBenefits);
    onSave();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Benefits to Row {rowIndex + 1}</DialogTitle>
      <DialogContent>
        <div style={{ position: 'relative', marginBottom: '24px', paddingTop: '16px' }}>
          <TextField
            fullWidth
            label="Search Benefits"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search..."
            inputRef={searchInputRef}
            InputProps={{
              endAdornment: (
                <>
                  {showSuggestions && searchQuery.length > 0 && (
                    <div
                      style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1 }}
                    >
                      <Paper
                        elevation={1}
                        style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'white',
                          width: '100%',
                          marginTop: '4px',
                        }}
                      >
                        {filteredBenefits.length === 0 ? (
                          <div style={{ padding: '8px' }}>No benefits found</div>
                        ) : (
                          filteredBenefits.map((benefit: Benefit, index: number) => (
                            <div
                              key={benefit.id}
                              style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                backgroundColor:
                                  index === selectedSuggestionIndex ? '#f5f5f5' : 'white',
                              }}
                              onClick={() => handleSelectBenefit(benefit)}
                              role="option"
                              aria-selected={index === selectedSuggestionIndex}
                            >
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(benefit.name, searchQuery.toLowerCase()),
                                }}
                              />
                            </div>
                          ))
                        )}
                      </Paper>
                    </div>
                  )}
                  {searchQuery && (
                    <IconButton
                      onClick={handleClear}
                      size="small"
                      style={{
                        marginRight: '8px',
                        color: 'rgba(0, 0, 0, 0.54)',
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </>
              ),
            }}
          />
        </div>
        {filteredBenefits.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'gray' }}>
            No benefits found matching "{searchQuery}"
          </div>
        ) : (
          filteredBenefits.map((benefit: Benefit) => (
            <div key={benefit.id} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="checkbox"
                  value={benefit.id.toString()}
                  checked={selectedBenefits.includes(benefit.id.toString())}
                  onChange={(e) => {
                    const value = e.target.value;
                    onBenefitSelect(
                      selectedBenefits.includes(value)
                        ? selectedBenefits.filter((id) => id !== value)
                        : [...selectedBenefits, value]
                    );
                  }}
                />
                {benefit.name}
              </label>
            </div>
          ))
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BenefitAssignmentDialog;
