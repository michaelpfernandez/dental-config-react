import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { fetchBenefitClasses, fetchBenefitsList } from '../services/api';
import { clientLogger } from '../utils/clientLogger';

export interface BenefitClass {
  id: string;
  name: string;
}

export interface Benefit {
  id: string;
  name: string;
}

export interface BenefitClassTableProps {
  numberOfClasses: number;
}

const BenefitClassTable: React.FC<BenefitClassTableProps> = ({ numberOfClasses }) => {
  const [availableClasses, setAvailableClasses] = useState<BenefitClass[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [classBenefits, setClassBenefits] = useState<Map<number, string[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredBenefits = useMemo(() => {
    if (!searchQuery) return benefits;
    const query = searchQuery.toLowerCase();
    return benefits.filter(
      (benefit) =>
        benefit.name.toLowerCase().includes(query) || benefit.id.toString().includes(query)
    );
  }, [benefits, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleSelectBenefit = (benefit: Benefit) => {
    setSearchQuery(benefit.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    const loadBenefitClasses = async () => {
      try {
        const fetchedClasses = await fetchBenefitClasses();
        console.log('Fetched Classes:', fetchedClasses.benefitClasses);
        setAvailableClasses(fetchedClasses.benefitClasses);
      } catch (error) {
        clientLogger.info('Error fetching benefit classes:', error);
      }
    };

    const loadBenefits = async () => {
      try {
        const fetchedBenefits = await fetchBenefitsList();
        console.log('Fetched Benefits:', fetchedBenefits);
        setBenefits(fetchedBenefits.benefits);
      } catch (error) {
        clientLogger.info('Error fetching benefits:', error);
      }
    };

    loadBenefitClasses();
    loadBenefits();
  }, []);

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleEdit = (classId: string, rowIndex: number) => {
    setSelectedClassId(classId);
    setSelectedRow(rowIndex);
    const currentBenefits = classBenefits.get(rowIndex) || [];
    setSelectedBenefits(currentBenefits);
    setSearchQuery('');
    setSelectedSuggestionIndex(-1);
    setShowSuggestions(false);
    setOpen(true);
    searchInputRef.current?.focus();
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBenefits([]);
    setSelectedRow(null);
  };

  const handleSave = () => {
    if (selectedRow !== null) {
      setClassBenefits((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectedRow, [...selectedBenefits]);
        return newMap;
      });
    }
    handleClose();
  };

  const formatBenefits = (benefitIds: string[]): string => {
    if (!benefitIds || benefitIds.length === 0) return '';
    return benefits
      .filter((benefit) => benefitIds.includes(benefit.id.toString()))
      .map((benefit) => benefit.name)
      .join(', ');
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Benefit Class</TableCell>
              <TableCell>Assigned Benefits</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: numberOfClasses }).map((_, index) => {
              const classId = availableClasses[index]?.id || '';
              const benefitsForClass = classBenefits.get(index) || [];

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Select Benefit Class</InputLabel>
                      <Select
                        label="Select Benefit Class"
                        defaultValue=""
                        onChange={(e) => handleClassSelect(e.target.value)}
                      >
                        <MenuItem value="">Select Benefit Class</MenuItem>
                        {availableClasses.map((benefitClass) => (
                          <MenuItem value={benefitClass.id} key={benefitClass.id}>
                            {benefitClass.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {formatBenefits(benefitsForClass)}
                      </div>
                      {classId && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(classId, index)}
                          style={{ marginLeft: '8px' }}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Benefits to Row {selectedRow + 1}</DialogTitle>
        <DialogContent>
          <div style={{ position: 'relative', marginBottom: '24px', paddingTop: '16px' }}>
            <TextField
              fullWidth
              label="Search Benefits"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearch}
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
                          {isLoading ? (
                            <div style={{ padding: '8px', textAlign: 'center' }}>
                              <CircularProgress size={20} />
                            </div>
                          ) : filteredBenefits.length === 0 ? (
                            <div style={{ padding: '8px' }}>No benefits found</div>
                          ) : (
                            filteredBenefits.map((benefit, index) => (
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
            filteredBenefits.map((benefit) => (
              <div key={benefit.id} style={{ marginBottom: '8px' }}>
                <label>
                  <input
                    type="checkbox"
                    value={benefit.id.toString()}
                    checked={selectedBenefits.includes(benefit.id.toString())}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedBenefits((prev) =>
                        prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BenefitClassTable;
