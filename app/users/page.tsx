"use client";

import { useEffect, useState } from "react";
import { userService, User } from "@/lib/supabase/users";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

import { Loader2, Edit, Trash2, Save, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [search, setSearch] = useState("");

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await userService.getAll();
    setUsers(data);
    setLoading(false);
  }

  // Filtro de busca
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Iniciar edição
  function handleEdit(user: User) {
    setEditingId(user.id);
    setEditForm(user);
  }

  // Cancelar edição
  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  // Salvar alterações
  async function saveEdit() {
    if (!editingId) return;
    const success = await userService.update(editingId, editForm);
    if (success) {
      await loadUsers();
      setEditingId(null);
    }
  }

  // Excluir usuário
  async function deleteUser(id: string) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      await userService.delete(id);
      await loadUsers();
    }
  }

  return (
    <div className="p-6">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-xl font-semibold text-gray-800">
            👤 Usuários
          </CardTitle>
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              <Loader2 className="animate-spin mr-2" /> Carregando usuários...
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">E-mail</th>
                    <th className="text-left p-3">Telefone</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        {editingId === user.id ? (
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === user.id ? (
                          <Input
                            value={editForm.email || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td className="p-3">
                        {editingId === user.id ? (
                          <Input
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        ) : (
                          user.phone || "-"
                        )}
                      </td>
                      <td className="p-3 capitalize">
                        {editingId === user.id ? (
                          <Input
                            value={editForm.status || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {user.status || "indefinido"}
                          </span>
                        )}
                      </td>
                      <td className="p-3 flex gap-2">
                        {editingId === user.id ? (
                          <>
                            <Button
                              onClick={saveEdit}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-1" /> Salvar
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4 mr-1" /> Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(user)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="w-4 h-4 mr-1" /> Editar
                            </Button>
                            <Button
                              onClick={() => deleteUser(user.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Excluir
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
