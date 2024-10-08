// src/components/InventoryForm.tsx
import { useState, useEffect } from "react";

interface InventoryItem {
  id?: number;
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

interface InventoryFormProps {
  onSubmit: (item: InventoryItem) => void;
  onClose: () => void;
  item?: InventoryItem; // Item opcional para editar
}

export default function InventoryForm({
  onSubmit,
  onClose,
  item,
}: InventoryFormProps) {
  const [formData, setFormData] = useState<InventoryItem>({
    brand: "",
    model: "",
    year_start: 0,
    year_end: 0,
    doors: 4,
    type: "",
    quantity: 0,
    description: "",
    mold_number: "",
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !formData.brand ||
      !formData.model ||
      !formData.year_start ||
      !formData.year_end ||
      !formData.doors ||
      !formData.quantity ||
      !formData.mold_number
    ) {
      alert("Todos los campos (excepto Descripción) son obligatorios");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">
          {item ? "Actualizar Item" : "Crear Nuevo Item"}
        </h2>
        <form className="space-y-4">
          <input
            name="brand"
            placeholder="Marca"
            value={formData.brand}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="model"
            placeholder="Modelo"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="year_start"
            placeholder="Año Inicio"
            value={formData.year_start}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="year_end"
            placeholder="Año Fin"
            value={formData.year_end}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="doors"
            placeholder="Puertas"
            value={formData.doors}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tipo</option>
            <option value="Parche">Parche</option>
            <option value="Empotrar">Empotrar</option>
          </select>
          <input
            type="number"
            name="quantity"
            placeholder="Cantidad"
            value={formData.quantity}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="mold_number"
            placeholder="Número de Molde"
            value={formData.mold_number}
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
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {item ? "Actualizar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
