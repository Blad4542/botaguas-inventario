// src/components/AddInventoryForm.tsx
import { useState } from "react";
import { supabase } from "../../supabaseClient";

interface InventoryItem {
  brand: string;
  model: string;
  doors: number;
  type: string;
  quantity: number;
  description: string;
  mold_number: string;
}

interface AddInventoryFormProps {
  onSubmit: (item: InventoryItem) => void; // Cambiado para aceptar el objeto item
  onClose: () => void;
}

export default function AddInventoryForm({
  onSubmit,
  onClose,
}: AddInventoryFormProps) {
  const [newItem, setNewItem] = useState<InventoryItem>({
    brand: "",
    model: "",
    doors: 4,
    type: "",
    quantity: 0,
    description: "",
    mold_number: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    // Validación simple para campos obligatorios
    if (
      !newItem.brand ||
      !newItem.model ||
      !newItem.doors ||
      !newItem.type ||
      !newItem.quantity ||
      !newItem.mold_number
    ) {
      alert("Todos los campos (excepto Descripción) son obligatorios");
      return;
    }

    onSubmit(newItem); // Pasa el item al método onSubmit del padre
    setNewItem({
      brand: "",
      model: "",
      doors: 4,
      type: "",
      quantity: 0,
      description: "",
      mold_number: "",
    }); // Limpia el formulario después de agregar el ítem
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">
          Agregar Nuevo Item
        </h2>
        <form className="space-y-4">
          <input
            name="brand"
            placeholder="Marca"
            value={newItem.brand}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="model"
            placeholder="Modelo"
            value={newItem.model}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label
            htmlFor="doors"
            className="block text-sm font-semibold text-gray-600"
          >
            Puertas
          </label>
          <input
            type="number"
            name="doors"
            id="doors"
            placeholder="Puertas"
            value={newItem.doors}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            name="type"
            value={newItem.type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tipo</option>
            <option value="Parche">Parche</option>
            <option value="Empotrar">Empotrar</option>
          </select>

          <label
            htmlFor="quantity"
            className="block text-sm font-semibold text-gray-600"
          >
            Disponible
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            placeholder="Cantidad"
            value={newItem.quantity}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            name="description"
            placeholder="Descripción"
            value={newItem.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
          <input
            name="mold_number"
            placeholder="Número de Molde"
            value={newItem.mold_number}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </form>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
