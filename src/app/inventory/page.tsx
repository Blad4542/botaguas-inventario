/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import AddInventoryForm from "@/components/AddInventoryForm";
import InventoryTable from "@/components/InventoryTable";

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
  user_name: string;
}

interface DecodedToken {
  email: string;
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
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | undefined>(); // Cambiado a undefined
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  const fetchInventory = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        const decoded = jwtDecode<DecodedToken>(data.session.access_token);
        setUser(decoded.email);
        await fetchInventory();
      }
      setLoading(false);
    };
    checkAuth();
  }, [router, fetchInventory]);

  const extractFilters = (data: InventoryItem[]) => {
    const uniqueBrands = Array.from(new Set(data.map((item) => item.brand)));
    const uniqueModels = Array.from(new Set(data.map((item) => item.model)));
    const uniqueYears = Array.from(
      new Set(
        data
          .flatMap((item) => [item.year_start, item.year_end])
          .filter((year) => year !== null)
      )
    ).sort((a, b) => b - a);
    setBrands(uniqueBrands);
    setModels(uniqueModels);
    setYears(uniqueYears as number[]);
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
        (item) =>
          item.year_start <= year &&
          (item.year_end === null || item.year_end >= year)
      );
    }

    setFilteredInventory(filtered);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear("");
    setFilteredInventory(inventory);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAddOrUpdateItem: any = async (
    item: Omit<InventoryItem, "id"> | InventoryItem
  ) => {
    let error;

    if ("id" in item && item.id) {
      const updatedItem = {
        ...item,
        year_end: item.year_end,
        user_name: user || null,
      };
      const { error: updateError } = await supabase
        .from("botaguas")
        .update(updatedItem)
        .eq("id", item.id);
      error = updateError;
    } else {
      const { data: existingItem, error: fetchError } = await supabase
        .from("botaguas")
        .select("mold_number")
        .eq("mold_number", item.mold_number)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing item:", fetchError.message);
        return;
      }

      if (existingItem) {
        alert(
          `El número de molde ${item.mold_number} ya existe. Por favor, ingresa un número de molde diferente.`
        );
        return;
      }

      const uppercasedItem = {
        ...item,
        brand: item.brand.toUpperCase(),
        model: item.model.toUpperCase(),
        year_end: item.year_end,
        user_name: user?.toUpperCase() || null,
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
      setItemToEdit(undefined); // Cambiado a undefined
    }
  };

  const handleEditItem: any = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };
  const openDeleteModal: any = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal: any = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from("botaguas")
        .delete()
        .eq("id", itemToDelete.id);
      if (error) {
        console.error("Error deleting item:", error.message);
      } else {
        setInventory((prevInventory) =>
          prevInventory.filter((invItem) => invItem.id !== itemToDelete.id)
        );
        setFilteredInventory((prevFilteredInventory) =>
          prevFilteredInventory.filter(
            (invItem) => invItem.id !== itemToDelete.id
          )
        );
        closeDeleteModal();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow-lg rounded-lg mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h1 className="text-lg sm:text-xl font-bold text-blue-600 text-center sm:text-left">
          Inventario de Botaguas
        </h1>
        <div className="flex space-x-2">
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
            setItemToEdit(undefined);
          }}
          item={itemToEdit} // Ahora es undefined en lugar de null
        />
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full text-center">
            <h2 className="text-lg font-semibold mb-4">¿Eliminar este item?</h2>
            <p className="mb-6 text-sm">Esta acción no se puede deshacer.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteItem}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 items-center">
        <select
          value={selectedBrand}
          onChange={handleBrandChange}
          className="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
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
          className="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
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
          className="p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
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
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
        >
          Limpiar Filtros
        </button>
      </div>

      <InventoryTable
        data={paginatedData}
        onEdit={handleEditItem}
        onDelete={openDeleteModal}
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-gray-700 text-xs sm:text-base">
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
