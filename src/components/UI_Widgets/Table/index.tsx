import React, { FC } from "react";
//import { useTable } from "react-table";

type CustomCellRendererProps<D = {}, V> = {
  cellValue: D[keyof D];
  cellValueAsFormatted: V;
  rowData: D;
};

type ColumnOptions<T = {}, R extends string | number | unknown> = {
  headerRender: () => ;
  field: keyof T;
  valueFormatter: (value: T[keyof T]) => R;
  cellRenderer: (cellDetails: CustomCellRendererProps<T, R>) => React.ReactNode;
};

const Table: FC<> = ({ columns, data,  ...props }) => {
  return <table {...props}>
  
  </table>
};
