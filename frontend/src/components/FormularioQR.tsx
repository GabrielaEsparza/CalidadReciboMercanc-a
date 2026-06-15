import { useState } from "react";

function FormularioQR() {
  const [sku, setSku] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");

  const generarQR = (e) => {
    e.preventDefault();

    console.log({
      sku,
      numeroSerie,
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Calidad Recibo Mercancía
      </h2>

      <form onSubmit={generarQR} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">
            SKU
          </label>

          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese SKU"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Números de serie
          </label>

          <input
            type="text"
            value={numeroSerie}
            onChange={(e) => setNumeroSerie(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese número de serie"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700"
          >
            Generar QR
          </button>

          <button
            type="button"
            className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700"
          >
            Siguiente SKU
          </button>

          <button
            type="button"
            className="bg-yellow-500 text-white rounded-lg p-2 hover:bg-yellow-600"
          >
            Incidencia
          </button>

          <button
            type="button"
            className="bg-red-600 text-white rounded-lg p-2 hover:bg-red-700"
          >
            Finalizar
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioQR;