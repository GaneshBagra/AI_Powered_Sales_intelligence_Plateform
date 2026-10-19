import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "./context/Theme";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddExportOrderPage, BacklogsPage, ExportOrderListPage } from "./pages/OrderPages";
import { AppShell } from "./components/AppShell";


function App() {
  
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders/add" element={<AddExportOrderPage />} />
            <Route path="/orders/list" element={<ExportOrderListPage />} />
            <Route path="/orders/backlogs" element={<BacklogsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
