import { useMemo } from "react";
import { useTable, Column } from "react-table";

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  year_start: number;
  year_end: number | null;
  doors: number;
  type: string;
  quantity: number;
  description: string;
  mold_number: string;
}

interface InventoryTableProps {
  data: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export default function InventoryTable({
  data,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const columns: Column<InventoryItem>[] = useMemo(
    () => [
      { Header: "Cantidad", accessor: "quantity" as const },
      { Header: "Molde", accessor: "mold_number" as const },
      { Header: "Marca", accessor: "brand" as const },
      { Header: "Modelo", accessor: "model" as const },
      {
        Header: "Año",
        accessor: (row: InventoryItem) =>
          row.year_end
            ? `${row.year_start} - ${row.year_end}`
            : `${row.year_start}`,
        id: "year_range",
      },
      { Header: "Puertas", accessor: "doors" as const },
      { Header: "Tipo", accessor: "type" as const },
      { Header: "Descripción", accessor: "description" as const },
      {
        Header: "Acciones",
        Cell: ({ row }: { row: { original: InventoryItem } }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(row.original)}
              className="text-blue-500 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="text-red-500 hover:underline"
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="overflow-x-auto w-full">
      <table
        {...getTableProps()}
        className="min-w-full bg-white rounded-lg shadow-lg"
      >
        <thead className="bg-blue-500">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
