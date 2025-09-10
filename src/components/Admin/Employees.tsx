import { useState } from "react";
import { addUser, getUsers, type User } from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { useToast } from "../../hooks/useToast";

export default function Employees() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [isCreating, setIsCreating] = useState(false);
  const { showSuccess, showError, ToastContainer } = useToast();
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: { username: string; password: string; role: string }) =>
      addUser(data),
    onMutate: () => {
      setIsCreating(true);
    },
    onSuccess: (newUser: User) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users"], (oldData: User[]) =>
        oldData ? [...oldData, newUser] : [newUser]
      );
      setUsername("");
      setPassword("");
      setRole("employee");
      showSuccess("User created.");
    },
    onError: (error: Error) => {
      showError(error.message);
    },

    onSettled: () => {
      setIsCreating(false);
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showError("Please provide both username and password");
      return;
    }
    mutation.mutate({
      username: username.trim(),
      password: password.trim(),
      role,
    });
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div>
        <h2 className="text-xl font-semibold">Employees</h2>
        <p className="text-sm text-gray-500">
          List and create employee/admin accounts
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        <Card>
          <CardContent>
            <form
              onSubmit={handleCreate}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end"
            >
              <div className="space-y-1 flex flex-col">
                <label className="text-sm font-medium">Username:</label>
                <input
                  className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jdoe"
                />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-sm font-medium">Password:</label>
                <input
                  type="password"
                  className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                />
              </div>
              <div className="space-y-1 flex flex-col">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="h-10 px-3  rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-3">Users</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="text-left">
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="px-3 py-3" colSpan={2}>
                        Loading...
                      </td>
                    </tr>
                  ) : users?.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3" colSpan={2}>
                        No users
                      </td>
                    </tr>
                  ) : (
                    users?.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-3 py-2">{u.username}</td>
                        <td className="px-3 py-2">{u.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
