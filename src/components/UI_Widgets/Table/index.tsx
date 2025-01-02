import React, { FC } from "react";
//import { useTable } from "react-table";

type CustomCellRendererProps<D, V> = {
  cellValue: D[keyof D];
  cellValueAsFormatted: V;
  rowData: D;
};

type ColumnOptions<D = {}, R extends string | number> = {
  headerRender: string | (() => React.ReactNode);
  sort?: "asc" | "desc";
  field: keyof D;
  valueFormatter?: "defaultFormatter" | ((value: D[keyof D]) => R);
  cellRenderer?: "defaultRenderer" | ((cellDetails: CustomCellRendererProps<D, R>) => React.ReactNode);
};

function Table<D extends object, R>({
  columns,
  data,
  children,
  ...props
}: React.ComponentPropsWithRef<"table"> & { columns: ColumnOptions<D, R>, data: Array<D> }) => {
  const renderChildren = () => {
    /* More code later... */
  };

  return <table {...props}>
    {children}
  </table>
};

const TableCaption: FC<Omit<React.ComponentPropsWithRef<"caption">, "children"> & { captionText: string }> = ({ captionText, ...props }) => {
  return <caption {...props}>{captionText}</caption>
};

const TableHeader: FC<React.ComponentPropsWithRef<"thead">> = ({ children, ...props }) => {
  return <thead {...props}>
    {children}
  </thead>
};

const TableBody: FC<React.ComponentPropsWithRef<"tbody">> = ({ children, ...props }) => {
  return <tbody {...props}>
    {children}
  </tbody>
};

const TableFooter: FC<React.ComponentPropsWithRef<"tfoot">> = ({ children, ...props }) => {
  return <tfoot {...props}>
    {children}
  </tfoot>
};

/*
  <Table data={...} columns={} usingTanstackTable>
    <Table.Caption>Services</Table.Caption>
    <Table.Heading>
      <Table.TitleRow RowItem={"th"} />
    </Table.Heading>
    <Table.Content>
      <Table.ContentRow RowItem={MyRowItem} />
    </Table.Content>
    <Table.Footing>
      <Table.TitleRow RowItem={"th"} />
    </Table.Footing>
  </Table>
*/

Table.Caption = TableCaption;
Table.Heading = TableHeader;
Table.Content = TableBody;
Table.Footing = TableFooter;

export default Table;
