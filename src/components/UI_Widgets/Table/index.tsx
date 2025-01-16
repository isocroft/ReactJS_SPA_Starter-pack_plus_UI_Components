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
  className,
  ...props
}: React.ComponentPropsWithRef<"table"> & { columns: ColumnOptions<D, R>, data: Array<D> }) => {
  const renderChildren = () => {
    /* More code later... */
  };

  useEffect(() => {  
    const styleSheetsOnly = [].slice.call<StyleSheetList, [], StyleSheet[]>(
      window.document.styleSheets
    ).filter(
      (sheet) => {
        if (sheet.ownerNode) {
          return sheet.ownerNode.nodeName === "STYLE"
        }
        return false
    }).map(
      (sheet) => {
        if (sheet.ownerNode
          && sheet.ownerNode instanceof Element) {
          return sheet.ownerNode.id
        }
        return "";
    }).filter(
      (id) => id !== ""
    );

    if (styleSheetsOnly.length > 0
      && styleSheetsOnly.includes("react-busser-headless-ui_table")) {
      return;
    }

    const tableStyle = window.document.createElement('style');
    tableStyle.id = "react-busser-headless-ui_table";

    tableStyle.innerHTML = `  
      @media screen and (min-width: 400px) {
        .data-box-table .table-sticky-col {
          position: sticky;
          left: 0;
        }
      
        .data-box-table .table-sticky-col-right {
          right: 0;
        }
      }
      
      @media screen and (max-width: 560px) {
        .data-box-table td::before {
          content: attr(data-label);
          display: table-cell; 
        }
        
        .data-box-table td {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: none;
        }
      
        .data-box-table td:first-child {
          display: none;
        }
        
        /*.data-box-table td:nth-child(2) {
          background: #f9fafb;
        }*/

        .data-box-table thead tr > th {
          display: none;
        }
        
        .data-box-table > :not(thead:first-child) tr:first-child > th + :not(td),
        .data-box-table > :not(thead:first-child) tr:first-child > th[scope='col'] {
          display: none;
        }
      }
    `;  
    window.document.head.appendChild(tableStyle);  
 
    return () => {  
      window.document.head.removeChild(tableStyle);  
    };  
  }, []);

  return <table {...props} className={`data-box-table ${className}`} role="table">
    {children}
  </table>
};

const TableCaption: FC<Omit<React.ComponentPropsWithRef<"caption">, "children"> & { captionText: string }> = ({ captionText, ...props }) => {
  return <caption {...props}>{captionText}</caption>
};

const TableHeader: FC<React.ComponentPropsWithRef<"thead">> = ({ children, ...props }) => {
  return <thead {...props} role="rowgroup">
    {children}
  </thead>
};

const TableBody: FC<React.ComponentPropsWithRef<"tbody">> = ({ children, ...props }) => {
  return <tbody {...props} role="rowgroup">
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
