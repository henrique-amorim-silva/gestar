import React, { useState, useEffect } from 'react';
import type { Cow } from '../types/cow';

interface CowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cowData: Omit<Cow, 'id' | 'order'>) => void;
  cowToEdit?: Cow | null;
}

export const CowForm: React.FC<CowFormProps> = ({ isOpen, onClose, onSave, cowToEdit }) => {
  const initialFormState = {
    numberTag: '',
    name: '',
    situation: 'L' as 'L' | 'S',
    categoryGS: '',
    offspringCount: 1,
    gender: 'F' as 'F' | 'M' | 'MF',
    currentCalvingDate: new Date().toISOString().split('T')[0],
    previousCalvingDate: '',
    firstHeatDate: '',
    firstInseminationDate: '',
    lastHeatDate: '',
    lastInseminationDate: '',
    inseminationNumber: 1,
    heatsCount: 1,
    del: 0,
    ps: 0,
    dpia: 0,
    ip: 0,
    expectedIp: 0,
    expectedCalvingDate: '',
    bull: '',
    diagnosisStatus: 'DG+' as 'DG+' | 'DG-',
    dryingDate: '',
    observations: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (cowToEdit) {
      setFormData({
        numberTag: cowToEdit.numberTag,
        name: cowToEdit.name,
        situation: cowToEdit.situation,
        categoryGS: cowToEdit.categoryGS,
        offspringCount: cowToEdit.offspringCount,
        gender: cowToEdit.gender,
        currentCalvingDate: cowToEdit.currentCalvingDate,
        previousCalvingDate: cowToEdit.previousCalvingDate,
        firstHeatDate: cowToEdit.firstHeatDate,
        firstInseminationDate: cowToEdit.firstInseminationDate,
        lastHeatDate: cowToEdit.lastHeatDate,
        lastInseminationDate: cowToEdit.lastInseminationDate,
        inseminationNumber: cowToEdit.inseminationNumber,
        heatsCount: cowToEdit.heatsCount,
        del: cowToEdit.del,
        ps: cowToEdit.ps,
        dpia: cowToEdit.dpia,
        ip: cowToEdit.ip,
        expectedIp: cowToEdit.expectedIp,
        expectedCalvingDate: cowToEdit.expectedCalvingDate,
        bull: cowToEdit.bull,
        diagnosisStatus: cowToEdit.diagnosisStatus,
        dryingDate: cowToEdit.dryingDate,
        observations: cowToEdit.observations
      });
    } else {
      setFormData(initialFormState);
    }
  }, [cowToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          {cowToEdit ? 'Editar Dados da Vaca' : 'Cadastrar Nova Vaca'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700">Número (Brinco)</label>
            <input
              type="text"
              className="mt-1 w-full border rounded p-2"
              value={formData.numberTag}
              onChange={e => setFormData({ ...formData, numberTag: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Nome da Vaca</label>
            <input
              type="text"
              className="mt-1 w-full border rounded p-2"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Situação (L/S)</label>
            <select
              className="mt-1 w-full border rounded p-2"
              value={formData.situation}
              onChange={e => setFormData({ ...formData, situation: e.target.value as 'L' | 'S' })}
            >
              <option value="L">L - Lactação</option>
              <option value="S">S - Seca/Descarte</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Nº de Crias</label>
            <input
              type="number"
              className="mt-1 w-full border rounded p-2"
              value={formData.offspringCount}
              onChange={e => setFormData({ ...formData, offspringCount: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Sexo da Cria</label>
            <select
              className="mt-1 w-full border rounded p-2"
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as 'F' | 'M' | 'MF' })}
            >
              <option value="F">Feminino (F)</option>
              <option value="M">Masculino (M)</option>
              <option value="MF">Misto / Outro (MF)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Data Parto Atual</label>
            <input
              type="date"
              className="mt-1 w-full border rounded p-2"
              value={formData.currentCalvingDate}
              onChange={e => setFormData({ ...formData, currentCalvingDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Touro</label>
            <input
              type="text"
              className="mt-1 w-full border rounded p-2"
              value={formData.bull}
              onChange={e => setFormData({ ...formData, bull: e.target.value.toUpperCase() })}
              placeholder="Ex: JACK DANIELS"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Diagnóstico (DG)</label>
            <select
              className="mt-1 w-full border rounded p-2"
              value={formData.diagnosisStatus}
              onChange={e => setFormData({ ...formData, diagnosisStatus: e.target.value as 'DG+' | 'DG-' })}
            >
              <option value="DG+">DG+</option>
              <option value="DG-">DG-</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700">Observações</label>
            <input
              type="text"
              className="mt-1 w-full border rounded p-2"
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-4 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 font-medium"
            >
              {cowToEdit ? 'Salvar Alterações' : 'Salvar Vaca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};