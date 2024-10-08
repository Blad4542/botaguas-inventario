// src/components/InventoryTable.tsx
import { useMemo } from "react";
import { useTable } from "react-table";

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  year_start: number;
  year_end: number;
  doors: number;
  type: string;
  quantity: number;
  description: string;
  mold_number: string;
}

interface InventoryTableProps {
  data: InventoryItem[];
  onEdit: (item: InventoryItem) => void; // Prop para manejar la edición
}

export default function InventoryTable({ data, onEdit }: InventoryTableProps) {
  const columns = useMemo(
    () => [
      { Header: "Cantidad", accessor: "quantity" },
      { Header: "Molde", accessor: "mold_number" },
      { Header: "Marca", accessor: "brand" },
      { Header: "Modelo", accessor: "model" },
      {
        Header: "Año",
        accessor: (row: InventoryItem) => `${row.year_start} - ${row.year_end}`,
        id: "year_range",
      },
      { Header: "Puertas", accessor: "doors" },
      { Header: "Tipo", accessor: "type" },
      { Header: "Descripción", accessor: "description" },
      {
        Header: "Acciones",
        Cell: ({ row }: { row: { original: InventoryItem } }) => (
          <button
            onClick={() => onEdit(row.original)}
            className="text-blue-500 hover:underline"
          >
            Actualizar
          </button>
        ),
      },
    ],
    [onEdit]
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
