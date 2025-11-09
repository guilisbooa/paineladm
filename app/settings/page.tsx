"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [primaryColor, setPrimaryColor] = useState("#1e3a8a");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Configurações</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Tema do Painel</h2>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cor Primária</h2>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-20 h-10 rounded"
            />
          </div>

          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
