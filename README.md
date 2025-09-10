# GoPark Frontend (React + TypeScript + Vite)

A React + TypeScript application for managing parking gates, zones, tickets, and subscriptions. It uses a simple fetch-based API client, Zustand stores, React Query caching, and a lightweight WebSocket manager for real-time updates.

- Install dependencies:
```bash
npm install
```

- Run the dev server:
```bash
npm run dev
```
added some backend endpoints to get users and post users 

app.get(BASE + "/admin/users", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.users);
});
app.post(BASE + "/admin/users", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  const u = {
    id: "user_" + uuidv4().split("-")[0],
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  };
  db.users.push(u);
  res.status(201).json(u);
});

added some reusable hooks and components to make it better scaling 