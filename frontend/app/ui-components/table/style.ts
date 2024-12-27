import styled from 'styled-components';
import { Theme } from '~/app/theme';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${Theme.background.primary};
  border: 1px solid ${Theme.border.primary};
  border-radius: 8px;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

export const TableHeader = styled.thead`
  background: ${Theme.background.secondary};
  border-bottom: 1px solid ${Theme.border.primary};
`;

export const TableHeaderCell = styled.th<{ width?: string; minWidth?: string }>`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: ${Theme.text.secondary};
  width: ${props => props.width || 'auto'};
  min-width: ${props => props.minWidth || 'auto'};
  white-space: nowrap;
`;

export const TableBody = styled.tbody`
  & tr:not(:last-child) {
    border-bottom: 1px solid ${Theme.border.secondary};
  }

  & tr:hover {
    background: ${Theme.background.tertiary};
  }
`;

export const TableRow = styled.tr`
  transition: background-color 0.2s ease;
`;

export const TableCell = styled.td`
  padding: 12px 16px;
  color: ${Theme.text.primary};
  vertical-align: middle;
`;

export const EmptyState = styled.div`
  padding: 32px;
  text-align: center;
  color: ${Theme.text.tertiary};
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`; 