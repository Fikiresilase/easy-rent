import { useState } from 'react';

export function useFilterPanel({ setPage, fetchProps }) {
  const [filterOpen, setFilterOpen] = useState(false);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1); // Reset to page 1 on filter change
    fetchProps(); // Refetch properties with new filters
  };

  return {
    filterOpen,
    setFilterOpen,
    handleFilterChange,
  };
}