// hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentData: T[];
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  // Obtenir les données de la page actuelle
  const currentData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, currentPage, itemsPerPage]);

  // Fonctions de navigation
  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    const pageToGo = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(pageToGo);
  };

  return {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToPage
  };
}