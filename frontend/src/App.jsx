import React, { useState, useEffect } from 'react';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('rh');
  const [listaFuncionarios, setListaFuncionarios] = useState([]);
  const [dadosSemana, setDadosSemana] = useState({ diasDaSemana: [], gradeSemanal: [] });

  const [rhLogado, setRhLogado] = useState(false);
  const [userRh, setUserRh] = useState('');
  const [passRh, setPassRh] = useState('');

  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [dadosPessoais, setDadosPessoais] = useState('');

  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = () => {
    carregarFuncionarios();
    carregarRelatorioSemanal();
  };

  const carregarFuncionarios = async () => {
    try {
      const res = await fetch('http://https://lvia-backend-2.onrender.com:3000/api/funcionarios');
      const data = await res.json();
      setListaFuncionarios(data);
    } catch (err) { console.error(err); }
  };

  const carregarRelatorioSemanal = async () => {
    try {
      const res = await fetch('http://https://lvia-backend-2.onrender.com:3000/api/relatorio-semanal');
      const data = await res.json();
      setDadosSemana(data);
    } catch (err) { console.error(err); }
  };

  const handleLoginRh = (e) => {
    e.preventDefault();
    if (userRh === 'admin' && passRh === '1234') {
      setRhLogado(true);
    } else {
      alert('Utilizador ou Palavra-passe incorretos!');
    }
  };

  const handleLogoutRh = () => {
    setRhLogado(false);
    setUserRh('');
    setPassRh('');
  };

  const handleSalvarFuncionario = async (e) => {
    e.preventDefault();
    
    const url = idEmEdicao 
      ? `http://https://lvia-backend-2.onrender.com:3000/api/funcionarios/${idEmEdicao}` 
      : 'http://https://lvia-backend-2.onrender.com:3000/api/funcionarios';
      
    const metodo = idEmEdicao ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeCompleto, cargo, departamento, dadosPessoais })
      });
      
      if (res.ok) {
        alert(idEmEdicao ? '✅ Atualizado com sucesso!' : '✅ Funcionário cadastrado!');
        cancelarEdicao();
        carregarTudo();
      } else {
        alert('❌ Erro ao atualizar no servidor.');
      }
    } catch (err) { 
      alert('❌ Erro de ligação com o servidor.'); 
    }
  };

  const prepararEdicao = (func) => {
    setIdEmEdicao(func.id);
    setNomeCompleto(func.nome || '');
    setCargo(func.cargo || '');
    setDepartamento(func.departamento || '');
    setDadosPessoais(func.dadosPessoais || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setIdEmEdicao(null);
    setNomeCompleto('');
    setCargo('');
    setDepartamento('');
    setDadosPessoais('');
  };

  const handleEliminarFuncionario = async (id) => {
    if (!window.confirm('Tem certeza que quer apagar este funcionário?')) return;
    try {
      const res = await fetch(`http://https://lvia-backend-2.onrender.com:3000/api/funcionarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Eliminado com sucesso!');
        carregarTudo();
      }
    } catch (err) { alert('Erro ao eliminar.'); }
  };

  const handleRegistrarPonto = async () => {
    if (!funcionarioSelecionado) return alert('Selecione o seu nome!');
    try {
      const res = await fetch('http://https://lvia-backend-2.onrender.com:3000/api/ponto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funcionarioId: funcionarioSelecionado, tipo: 'Entrada' })
      });
      if (res.ok) {
        alert('Presença registada!');
        setFuncionarioSelecionado('');
        carregarTudo();
      }
    } catch (err) { alert('Erro ao registar ponto.'); }
  };

  const renderBadgeStatus = (dia) => {
    switch (dia.status) {
      case 'PRESENTE': return <span style={{ backgroundColor: '#2ecc71', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>✅ {dia.horaPonto}</span>;
      case 'FALTA_AUTOMATICA': return <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>❌ Falta</span>;
      case 'FERIADO': return <span style={{ backgroundColor: '#f1c40f', color: '#7f6000', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>🎉 Feriado</span>;
      case 'FOLGA': return <span style={{ backgroundColor: '#ecf0f1', color: '#7f8c8d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>⚪ Folga</span>;
      default: return <span style={{ color: '#bdc3c7', fontSize: '12px' }}>-</span>;
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px' }}>🏢 Sistema de Frequência</h2>
        <div>
          <button onClick={() => setAbaAtiva('terminal')} style={{ padding: '8px 16px', marginRight: '10px', backgroundColor: abaAtiva === 'terminal' ? '#3498db' : '#e9ecef', color: abaAtiva === 'terminal' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Terminal</button>
          <button onClick={() => setAbaAtiva('rh')} style={{ padding: '8px 16px', backgroundColor: abaAtiva === 'rh' ? '#3498db' : '#e9ecef', color: abaAtiva === 'rh' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Painel RH</button>
        </div>
      </div>

      {abaAtiva === 'terminal' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' }}>
            <h3>Bater Ponto Diário</h3>
            <select value={funcionarioSelecionado} onChange={e => setFuncionarioSelecionado(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">-- Selecione o seu Nome --</option>
              {listaFuncionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <button onClick={handleRegistrarPonto} style={{ width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Bater Ponto Agora
            </button>
          </div>
        </div>
      )}

      {abaAtiva === 'rh' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {!rhLogado ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔒 Acesso Restrito ao RH</h3>
                <form onSubmit={handleLoginRh}>
                  <input type="text" placeholder="Utilizador" value={userRh} onChange={e => setUserRh(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  <input type="password" placeholder="Palavra-passe" value={passRh} onChange={e => setPassRh(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Entrar no Painel</button>
                </form>
              </div>
            </div>
          ) : (
            
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button onClick={handleLogoutRh} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Sair do RH</button>
              </div>

              {/* 1. PAINEL DE CADASTRO / EDIÇÃO */}
              <div style={{ backgroundColor: idEmEdicao ? '#fff3cd' : 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px', transition: 'background-color 0.3s' }}>
                <h4 style={{ marginTop: 0, color: idEmEdicao ? '#856404' : '#2c3e50' }}>
                  {idEmEdicao ? '✏️ Editando Funcionário' : '➕ Cadastrar Funcionário'}
                </h4>
                <form onSubmit={handleSalvarFuncionario} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Nome Completo" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} required style={{ flex: '1 1 200px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Cargo" value={cargo} onChange={e => setCargo(e.target.value)} required style={{ flex: '1 1 150px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Sector / Departamento" value={departamento} onChange={e => setDepartamento(e.target.value)} required style={{ flex: '1 1 150px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Dados Pessoais (Contacto/BI)" value={dadosPessoais} onChange={e => setDadosPessoais(e.target.value)} required style={{ flex: '1 1 150px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ backgroundColor: idEmEdicao ? '#f39c12' : '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
                      {idEmEdicao ? 'Atualizar' : 'Salvar'}
                    </button>
                    
                    {idEmEdicao && (
                      <button type="button" onClick={cancelarEdicao} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                    )}
                  </div>
                </form>
              </div>

              {/* 2. LISTA DE FUNCIONÁRIOS CADASTRADOS (POR ABAIXO) */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
                <h3 style={{ marginTop: 0, color: '#2c3e50' }}>👥 Lista de Funcionários Registados</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#ecf0f1', color: '#2c3e50' }}>
                      <th style={{ padding: '10px' }}>Nome</th>
                      <th style={{ padding: '10px' }}>Cargo</th>
                      <th style={{ padding: '10px' }}>Sector</th>
                      <th style={{ padding: '10px' }}>Dados Pessoais</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaFuncionarios.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d' }}>Nenhum funcionário registado.</td></tr>
                    ) : (
                      listaFuncionarios.map(func => (
                        <tr key={func.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold' }}>{func.nome}</td>
                          <td style={{ padding: '10px' }}>{func.cargo}</td>
                          <td style={{ padding: '10px' }}>{func.departamento}</td>
                          <td style={{ padding: '10px', color: '#7f8c8d' }}>{func.dadosPessoais}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button onClick={() => prepararEdicao(func)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>✏️ Editar</button>
                            <button onClick={() => handleEliminarFuncionario(func.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Eliminar</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 3. CONTROLE SEMANAL (APENAS COM O NOME) */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
                <h3 style={{ marginTop: 0 }}>📅 Controle Semanal</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Funcionário</th>
                      {dadosSemana.diasDaSemana.map((dia, idx) => (
                        <th key={idx} style={{ padding: '12px', borderLeft: '1px solid #34495e' }}>{dia.nomeDia}<br/><span style={{ fontSize: '11px', opacity: 0.8 }}>{dia.dataFormatada}</span></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dadosSemana.gradeSemanal.length === 0 ? (
                      <tr><td colSpan="8" style={{ padding: '20px' }}>Nenhum funcionário cadastrado.</td></tr>
                    ) : (
                      dadosSemana.gradeSemanal.map(item => (
                        <tr key={item.funcionario.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#2c3e50' }}>
                            {item.funcionario.nome}
                          </td>
                          {item.dias.map((dia, idx) => (
                            <td key={idx} style={{ padding: '12px', borderLeft: '1px solid #f2f2f2' }}>{renderBadgeStatus(dia)}</td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}