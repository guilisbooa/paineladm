"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Edit2, Save, X } from "lucide-react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, phone, vehicle_type, license_plate, status, created_at")
      .order("created_at", { ascending: false });
    if (!error) setDrivers(data);
  }

  async function save() {
    if (!form.name || !form.phone) return alert("Nome e telefone obrigatórios.");
    if (form.id)
      await supabase.from("drivers").update(form).eq("id", form.id);
    else await supabase.from("drivers").insert([form]);
    setForm(null);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Entregadores</h1>

        <button
          onClick={() =>
            setForm({
              name: "",
              phone: "",
              vehicle_type: "",
              license_plate: "",
              status: "active",
            })
          }
          className="mb-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
        >
          + Novo Entregador
        </button>

        {form && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">
              {form.id ? "Editar Entregador" : "Novo Entregador"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                placeholder="Nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Tipo de Veículo"
                value={form.vehicle_type}
                onChange={(e) =>
                  setForm({ ...form, vehicle_type: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Placa"
                value={form.license_plate}
                onChange={(e) =>
                  setForm({ ...form, license_plate: e.target.value })
                }
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={save}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <Save size={16} /> Salvar
              </button>
              <button
                onClick={() => setForm(null)}
                className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                <X size={16} /> Cancelar
              </button>
            </div>
          </div>
        )}

        <table className="w-full border-collapse">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-2 px-3 text-left">Nome</th>
              <th className="py-2 px-3 text-left">Telefone</th>
              <th className="py-2 px-3 text-left">Veículo</th>
              <th className="py-2 px-3 text-left">Placa</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{d.name}</td>
                <td className="py-2 px-3">{d.phone}</td>
                <td className="py-2 px-3">{d.vehicle_type}</td>
                <td className="py-2 px-3">{d.license_plate}</td>
                <td className="py-2 px-3">{d.status}</td>
                <td className="py-2 px-3">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Nenhum entregador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
