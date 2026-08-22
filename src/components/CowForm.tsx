import React, { useState, useEffect } from 'react';
import { calculateReproductionFields } from '../utils/reproductionCalculations';
import type { Cow } from '../types/cow';

interface CowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  cowToEdit: Cow | null;
}

export function CowForm({ isOpen, onClose, onSave, cowToEdit }: CowFormProps) {
  const [formData, setFormData] = useState({
    numberTag: '',
    name: '',
    situation: 'L' as 'L' | 'S',
    categoryGS: '',
    offspringCount: 0,
    gender: 'F' as 'F' | 'M' | 'MF',
    currentCalvingDate: '',
    previousCalvingDate: '',
    firstHeatDate: '',
    firstInseminationDate: '',
    lastInseminationDate: '',
    inseminationNumber: 0,
    bull: '',
    diagnosisStatus: 'DG+' as 'DG+' | 'DG-',
    dryingDate: '',
    observations: ''
  });

  useEffect(() => {
    if (cowToEdit) {
      setFormData({
        numberTag: cowToEdit.numberTag || '',
        name: cowToEdit.name || '',
        situation: cowToEdit.situation || 'L',
        categoryGS: cowToEdit.categoryGS || '',
        offspringCount: cowToEdit.offspringCount || 0,
        gender: cowToEdit.gender || 'F',
        currentCalvingDate: cowToEdit.currentCalvingDate || '',
        previousCalvingDate: cowToEdit.previousCalvingDate || '',
        firstHeatDate: cowToEdit.firstHeatDate || '',
        firstInseminationDate: cowToEdit.firstInseminationDate || '',
        lastInseminationDate: cowToEdit.lastInseminationDate || '',
        inseminationNumber: cowToEdit.inseminationNumber || 0,
        bull: cowToEdit.bull || '',
        diagnosisStatus: cowToEdit.diagnosisStatus || 'DG+',
        dryingDate: cowToEdit.dryingDate || '',
        observations: cowToEdit.observations || ''
      });
    } else {
      setFormData({
        numberTag: '',
        name: '',
        situation: 'L',
        categoryGS: 'Nulípara',
        offspringCount: 0,
        gender: 'F',
        currentCalvingDate: '',
        previousCalvingDate: '',
        firstHeatDate: '',
        firstInseminationDate: '',
        lastInseminationDate: '',
        inseminationNumber: 0,
        bull: '',
        diagnosisStatus: 'DG+',
        dryingDate: '',
        observations: ''
      });
    }
  }, [cowToEdit, isOpen]);

  // Função auxiliar para sugerir a categoria automaticamente com base no Nº de IAs/Cios
  const handleInseminationChange = (value: number) => {
    let autoCategory = formData.categoryGS;
    if (value === 0) autoCategory = 'Nulípara';
    else if (value === 1) autoCategory = 'Primípara';
    else if (value > 1) autoCategory = 'Multípara';

    setFormData({
      ...formData,
      inseminationNumber: value,
      categoryGS: autoCategory
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const calculated = calculateReproductionFields({
      currentCalvingDate: formData.currentCalvingDate,
      previousCalvingDate: formData.previousCalvingDate,
      lastInseminationDate: formData.lastInseminationDate,
      firstInseminationDate: formData.firstInseminationDate,
      firstHeatDate: formData.firstHeatDate,
      inseminationNumber: formData.inseminationNumber
    });

    onSave({ ...formData, ...calculated });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-2xl space-y-4 shadow-xl my-8">
        <h2 className="text-xl font-bold text-gray-800">{cowToEdit ? 'Editar Vaca' : 'Nova Vaca'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nº Brinco / Num.</label>
            <input 
              type="text" className="w-full p-2 border rounded" placeholder="Ex: 1"
              value={formData.numberTag} onChange={e => setFormData({...formData, numberTag: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nome da Vaca</label>
            <input 
              type="text" className="w-full p-2 border rounded" placeholder="Nome"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Situação</label>
            <select className="w-full p-2 border rounded" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value as 'L' | 'S'})}>
              <option value="L">L - Lactação</option>
              <option value="S">S - Seca</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria (GS)</label>
            <select className="w-full p-2 border rounded" value={formData.categoryGS} onChange={e => setFormData({...formData, categoryGS: e.target.value})}>
              <option value="Nulípara">Nulípara (0 cios)</option>
              <option value="Primípara">Primípara (1 cio)</option>
              <option value="Multípara">Multípara (+ de 1 cio)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Crias</label>
            <input type="number" className="w-full p-2 border rounded" value={formData.offspringCount} onChange={e => setFormData({...formData, offspringCount: Number(e.target.value)} )} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sexo da Cria</label>
            <select className="w-full p-2 border rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'F' | 'M' | 'MF'})}>
              <option value="F">Fêmea (F)</option>
              <option value="M">Macho (M)</option>
              <option value="MF">Macho/Fêmea (MF)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Parto Atual</label>
            <input type="date" className="w-full p-2 border rounded" value={formData.currentCalvingDate} onChange={e => setFormData({...formData, currentCalvingDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Parto Anterior</label>
            <input type="date" className="w-full p-2 border rounded" value={formData.previousCalvingDate} onChange={e => setFormData({...formData, previousCalvingDate: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded border">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">1ª IA (Legado)</label>
            <input type="date" className="w-full p-2 border rounded bg-white" value={formData.firstInseminationDate} onChange={e => setFormData({...formData, firstInseminationDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">1º Cio (Legado)</label>
            <input type="date" className="w-full p-2 border rounded bg-white" value={formData.firstHeatDate} onChange={e => setFormData({...formData, firstHeatDate: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Última IA</label>
            <input type="date" className="w-full p-2 border rounded" value={formData.lastInseminationDate} onChange={e => setFormData({...formData, lastInseminationDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nº de IAs / Cios</label>
            <input type="number" className="w-full p-2 border rounded" value={formData.inseminationNumber} onChange={e => handleInseminationChange(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Touro</label>
            <input type="text" className="w-full p-2 border rounded" value={formData.bull} onChange={e => setFormData({...formData, bull: e.target.value})} placeholder="Ex: JACK DANIELS" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status DG</label>
            <select className="w-full p-2 border rounded" value={formData.diagnosisStatus} onChange={e => setFormData({...formData, diagnosisStatus: e.target.value as 'DG+' | 'DG-'})}>
              <option value="DG+">DG+</option>
              <option value="DG-">DG-</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Data Secar</label>
            <input type="date" className="w-full p-2 border rounded" value={formData.dryingDate} onChange={e => setFormData({...formData, dryingDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Observações</label>
            <input type="text" className="w-full p-2 border rounded" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800">Salvar</button>
        </div>
      </form>
    </div>
  );
}