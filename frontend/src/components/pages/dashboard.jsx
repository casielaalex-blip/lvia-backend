import React, { useState, useEffect } from 'react';
import { buscarRegistros } from '../api';
import './Dashboard.css';

export default function DashboardAdmin() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await buscarRegistros();
        setRegistros(dados);
      } catch (erro) {
        console.error("Erro ao carregar:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Painel de Controle - RH</h1>
      <p>Acompanhamento diário de presenças e faltas.</p>

      {carregando ? (
        <p>Carregando dados do servidor...</p>
      ) : registros.length === 0 ? (
        <p style={{ color: '#666' }}>Nenhum registro de ponto encontrado ainda. Cadastre um funcionário no Prisma Studio e bata o ponto!</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>Funcionário</th>
              <th>Cargo</th>
              <th>Data</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((reg) => (
              <tr key={reg.id}>
                <td>{reg.employee?.name || 'Desconhecido'}</td>
                <td>{reg.employee?.role || '-'}</td>
                <td>{new Date(reg.date).toLocaleDateString('pt-BR')}</td>
                <td>{reg.checkIn ? new Date(reg.checkIn).toLocaleTimeString('pt-BR') : '--:--'}</td>
                <td>{reg.checkOut ? new Date(reg.checkOut).toLocaleTimeString('pt-BR') : '--:--'}</td>
                <td style={{ color: reg.status === 'FALTA' ? 'red' : 'green', fontWeight: 'bold' }}>
                  {reg.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}