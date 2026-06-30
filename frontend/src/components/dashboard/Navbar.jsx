import { useState, useRef, useEffect } from "react";
import { actualizarPerfil } from "../../services/authentication";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "??";
}

function ProfileModal({ userData, mode, onClose, onPerfilUpdated }) {
  const [nuevoNombre, setNuevoNombre] = useState(userData?.name || "");
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const handleGuardar = async () => {
    if (!passwordActual) {
      setError("Ingresa tu contraseña actual para confirmar cambios.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resultado = await actualizarPerfil({
        passwordActual,
        nuevoNombre: nuevoNombre !== userData?.name ? nuevoNombre : undefined,
        nuevaPassword: nuevaPassword || undefined,
      });
      localStorage.setItem("token", resultado.token);
      onPerfilUpdated(resultado.token);
      setExito(true);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">
              {mode === "info" ? "Mi información" : "Editar perfil"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>

          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
              {getInitials(userData?.name)}
            </div>
          </div>

          {mode === "info" ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Usuario</p>
                <p className="text-xs text-gray-800 font-medium mt-0.5">{userData?.name || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Rol</p>
                <p className="text-xs text-gray-800 font-medium capitalize mt-0.5">{userData?.rol || "—"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Nueva contraseña <span className="normal-case text-gray-300">(opcional)</span></label>
                <input
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Dejar vacío para no cambiar"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Contraseña actual <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="Requerida para confirmar"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {error && <p className="text-[10px] text-red-500">{error}</p>}
              {exito && <p className="text-[10px] text-green-500">Perfil actualizado correctamente.</p>}

              <button
                onClick={handleGuardar}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Navbar({ onLogout, userData, onPerfilUpdated }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'info' | 'edit' | null
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-gray-400">ACTECK RyC</span>
          <span className="text-gray-300">&gt;</span>
          <span className="text-gray-700 font-semibold">Dashboard</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar recepción, OC, proveedor..."
              className="w-64 pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative border-l border-gray-100 pl-6" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                {getInitials(userData?.name)}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{userData?.name || "Usuario"}</p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">{userData?.rol || "—"}</p>
              </div>
              <span className="text-gray-400 text-xs ml-1">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1">
                <button
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { setModal("edit"); setOpen(false); }}
                >
                  <span>✏️</span> Editar perfil
                </button>
                <button
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { setModal("info"); setOpen(false); }}
                >
                  <span>👤</span> Mi información
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => { setOpen(false); onLogout(); }}
                >
                  <span>🚪</span> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {modal && (
        <ProfileModal
          userData={userData}
          mode={modal}
          onClose={() => setModal(null)}
          onPerfilUpdated={onPerfilUpdated}
        />
      )}
    </>
  );
}

export default Navbar;
