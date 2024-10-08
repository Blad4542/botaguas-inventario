// src/app/inventory/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import AddInventoryForm from "@/components/AddInventoryForm";
import InventoryTable from "@/components/InventoryTable";

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

const ITEMS_PER_PAGE = 25;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        await fetchInventory();
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase.from("botaguas").select("*");
      if (error) {
        console.error("Error fetching inventory:", error.message);
      } else if (data) {
        setInventory(data as InventoryItem[]);
        setFilteredInventory(data as InventoryItem[]);
        extractFilters(data as InventoryItem[]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const extractFilters = (data: InventoryItem[]) => {
    const uniqueBrands = Array.from(new Set(data.map((item) => item.brand)));
    const uniqueModels = Array.from(new Set(data.map((item) => item.model)));
    const uniqueYears = Array.from(
      new Set(data.flatMap((item) => [item.year_start, item.year_end]))
    ).sort((a, b) => b - a);
    setBrands(uniqueBrands);
    setModels(uniqueModels);
    setYears(uniqueYears);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    filterData(brand, selectedModel, selectedYear);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    filterData(selectedBrand, model, selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value ? parseInt(e.target.value, 10) : "";
    setSelectedYear(year);
    filterData(selectedBrand, selectedModel, year);
  };

  const filterData = (brand: string, model: string, year: number | "") => {
    let filtered = inventory;

    if (brand) {
      filtered = filtered.filter((item) => item.brand === brand);
    }
    if (model) {
      filtered = filtered.filter((item) => item.model === model);
    }
    if (year !== "") {
      filtered = filtered.filter(
        (item) => item.year_start <= year && item.year_end >= year
      );
    }

    setFilteredInventory(filtered);
    setCurrentPage(1); // Reinicia a la primera página al aplicar filtros
  };

  const handleClearFilters = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear("");
    setFilteredInventory(inventory);
    setCurrentPage(1); // Reinicia a la primera página al limpiar filtros
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAddOrUpdateItem = async (
    item: Omit<InventoryItem, "id"> | InventoryItem
  ) => {
    let error;
    if ("id" in item && item.id) {
      // Actualización
      const { error: updateError } = await supabase
        .from("botaguas")
        .update(item)
        .eq("id", item.id);
      error = updateError;
    } else {
      // Creación
      const uppercasedItem = {
        ...item,
        brand: item.brand.toUpperCase(),
        model: item.model.toUpperCase(),
      };
      const { error: insertError } = await supabase
        .from("botaguas")
        .insert([uppercasedItem]);
      error = insertError;
    }

    if (error) {
      console.error("Error submitting form:", error.message);
    } else {
      fetchInventory();
      setIsModalOpen(false);
      setItemToEdit(null); // Reiniciar item en edición después de crear o actualizar
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const paginatedData = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
        <p className="text-xl font-semibold text-blue-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-6">
      <header className="flex items-center justify-between p-4 bg-white shadow-lg rounded-lg mb-6">
        <h1 className="text-xl font-bold text-blue-600">
          Inventario de Botaguas
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Agregar
          </button>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {isModalOpen && (
        <AddInventoryForm
          onSubmit={handleAddOrUpdateItem}
          onClose={() => {
            setIsModalOpen(false);
            setItemToEdit(null); // Reiniciar el item en edición al cerrar el modal
          }}
          item={itemToEdit} // Pasar el item en edición al formulario
        />
      )}

      {/* Filtros de Marca, Modelo y Año */}
      <div className="flex space-x-4 mb-6 items-center">
        <select
          value={selectedBrand}
          onChange={handleBrandChange}
          className="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Filtrar por Marca</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Filtrar por Modelo</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Filtrar por Año</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button
          onClick={handleClearFilters}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Tabla de Inventario Paginada */}
      <InventoryTable data={paginatedData} onEdit={handleEditItem} />

      {/* Controles de Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
