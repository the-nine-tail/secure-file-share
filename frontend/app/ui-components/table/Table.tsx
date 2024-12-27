import React from 'react';
import { TableProps } from './types';
import {
  TableContainer,
  StyledTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  LoadingOverlay
} from './style';
import { BodySecondaryRegular } from '../typing';

function Table<T>({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'No data available',
  className 
}: TableProps<T>) {
  return (
    <TableContainer className={className}>
      <StyledTable>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHeaderCell 
                key={index}
                width={column.width}
                minWidth={column.minWidth}
              >
                {column.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <EmptyState>
                  <BodySecondaryRegular>
                    {emptyMessage}
                  </BodySecondaryRegular>
                </EmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
      {loading && (
        <LoadingOverlay>
          <BodySecondaryRegular>Loading...</BodySecondaryRegular>
        </LoadingOverlay>
      )}
    </TableContainer>
  );
}

export default Table; 