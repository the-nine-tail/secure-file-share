import styled from 'styled-components';
import { Theme } from '~/app/theme';

export const TableContainer = styled.div`
  width: 100%;
  height: calc(100vh - 140px);
  background: ${Theme.background.primary};
  border: 1px solid ${Theme.border.primary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const TableWrapper = styled.div`
  overflow: auto;
  flex: 1;
  position: relative;

  /* Hide scrollbar for Chrome, Safari and Opera */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: ${Theme.background.secondary};
    border-radius: 4px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${Theme.border.primary};
    border-radius: 4px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${Theme.text.tertiary};
  }
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 600px;
  table-layout: fixed;
`;

export const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${Theme.background.secondary};
`;

export const TableHeaderCell = styled.th<{ width?: string; minWidth?: string }>`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: ${Theme.text.secondary};
  width: ${props => props.width || 'auto'};
  min-width: ${props => props.minWidth || 'auto'};
  white-space: nowrap;
  background: ${Theme.background.secondary};
  border-bottom: 1px solid ${Theme.border.primary};
`;

export const TableBody = styled.tbody`
  position: relative;
`;

export const TableRow = styled.tr`
  transition: background-color 0.2s ease;

  &:hover {
    background: ${Theme.background.tertiary};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${Theme.border.secondary};
  }
`;

export const TableCell = styled.td`
  padding: 16px;
  color: ${Theme.text.primary};
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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