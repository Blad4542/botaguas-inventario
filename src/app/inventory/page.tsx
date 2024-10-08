// src/app/inventory/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useRouter } from "next/navigation";
import AddInventoryForm from "@/components/AddInventoryForm";

interface InventoryItem {
  id: number;
  brand: string;
  model: string;
  doors: number;
  type: string;
  quantity: number;
  description: string;
  mold_number: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      } else {
        fetchInventory();
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const fetchInventory = async () => {
    const { data, error } = await supabase.from("botaguas").select("*");
    if (error) {
      console.error("Error fetching inventory:", error.message);
    } else {
      setInventory(data as InventoryItem[]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAddItem = async (item: Omit<InventoryItem, "id">) => {
    const { error } = await supabase.from("botaguas").insert([item]);
    if (error) {
      console.error("Error adding item:", error.message);
    } else {
      fetchInventory(); // Actualiza la lista de inventario después de agregar
      setIsModalOpen(false);
    }
  };

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
          onSubmit={handleAddItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <div className="container mx-auto max-w-4xl p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4 text-center">
          Lista de Inventario
        </h2>
        {inventory.length > 0 ? (
          <ul className="space-y-4">
            {inventory.map((item) => (
              <li
                key={item.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md"
              >
                <p className="font-semibold text-lg">
                  {item.brand} {item.model}
                </p>
                <p>Puertas: {item.doors}</p>
                <p>Tipo: {item.type}</p>
                <p>Cantidad: {item.quantity}</p>
                <p>Descripción: {item.description}</p>
                <p>Número de Molde: {item.mold_number}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">
            No hay elementos en el inventario.
          </p>
        )}
      </div>
    </div>
  );
}
