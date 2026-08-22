import { useState } from 'react';
import { INITIAL_COWS } from './data/initialCows';
import { CowTable } from './components/CowTable';

export function App() {
  const [cows] = useState(INITIAL_COWS);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho do Sistema */}
        <header className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-emerald-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              Controle Reprodutivo de Vacas
            </h1>
            <p className="text-sm text-gray-500">
              Sistema de gestão de inseminação artificial e reprodução do rebanho.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-sm font-semibold">
            Total de Matrizes: {cows.length}
          </div>
        </header>

        {/* Tabela de Registros */}
        <main>
          <CowTable cows={cows} />
        </main>
      </div>
    </div>
  );
}

export default App;