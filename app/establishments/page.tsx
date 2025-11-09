"use client";

import { useEffect, useState } from "react";
import { establishmentService } from "@/lib/supabase/services";
import { Plus, Save, X, Edit2, Trash2 } from "lucide-react";

export default function EstablishmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await establishmentService.getAll();
    setData(res);
  }

  async function save() {
    if (!form.name) return alert("O nome é obrigatório.");
    if (form.id) await establishmentService.update(form.id, form);
    else await establishmentService.create(form);
    setForm(null);
    load();
  }

  async function remove(id: string) {
    if (confirm("Deseja realmente excluir este estabelecimento?")) {
      await establishmentService.delete(id);
      load();
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estabelecimentos</h1>
        <button
          onClick={() => setForm({ name: "", address: "", phone: "" })}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      <input
        placeholder="Buscar estabelecimento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {form && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">
            {form.id ? "Editar Estabelecimento" : "Novo Estabelecimento"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Endereço"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <input
              placeholder="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={save}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Save size={16} /> Salvar
            </button>
            <button
              onClick={() => setForm(null)}
              className="flex items-center gap-2 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Endereço</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td>{e.name}</td>
              <td>{e.address}</td>
              <td>{e.phone}</td>
              <td className="flex gap-3 py-2">
                <button
                  onClick={() => setForm(e)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Edit2 size={15} /> Editar
                </button>
                <button
                  onClick={() => remove(e.id)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 size={15} /> Excluir
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                Nenhum estabelecimento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
