const express = require('express');
const cors = require('cors');

const app = express();

// Habilita CORS para aceitar requisições do Firebase/Frontend
app.use(cors());
app.use(express.json());

// Banco de dados em memória (Substitua por Mongoose/MongoDB se estiver a usar banco de dados)
let funcionarios = [
  {
    id: '1',
    nome: 'Alex Casiela Sétima',
    cargo: 'Assistente',
    setor: 'Técnico',
    dadosPessoais: '28-07-2003'
  }
];

let pontos = [];

// ==========================================
// ROTAS DE FUNCIONÁRIOS
// ==========================================

// 1. Obter todos os funcionários
app.get('/api/funcionarios', (req, res) => {
  res.json(funcionarios);
});

// 2. Criar novo funcionário
app.post('/api/funcionarios', (req, res) => {
  try {
    const { nome, cargo, setor, departamento, dadosPessoais } = req.body;
    
    const novoFuncionario = {
      id: Date.now().toString(),
      nome: nome || '',
      cargo: cargo || '',
      setor: setor || departamento || '',
      dadosPessoais: dadosPessoais || ''
    };

    funcionarios.push(novoFuncionario);
    res.status(201).json(novoFuncionario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar funcionário.' });
  }
});

// 3. Atualizar funcionário existente (PUT) - RESOLVE O ERRO 404 CANNOT PUT
app.put('/api/funcionarios/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, setor, departamento, dadosPessoais } = req.body;

    const index = funcionarios.findIndex(f => f.id === id || f._id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }

    funcionarios[index] = {
      ...funcionarios[index],
      nome: nome !== undefined ? nome : funcionarios[index].nome,
      cargo: cargo !== undefined ? cargo : funcionarios[index].cargo,
      setor: setor || departamento || funcionarios[index].setor,
      dadosPessoais: dadosPessoais !== undefined ? dadosPessoais : funcionarios[index].dadosPessoais
    };

    res.json(funcionarios[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar funcionário.' });
  }
});

// 4. Eliminar funcionário (DELETE)
app.delete('/api/funcionarios/:id', (req, res) => {
  try {
    const { id } = req.params;
    funcionarios = funcionarios.filter(f => f.id !== id && f._id !== id);
    res.json({ message: 'Funcionário eliminado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar funcionário.' });
  }
});

// ==========================================
// ROTAS DE PONTO E RELATÓRIO
// ==========================================

// Registrar Ponto
app.post('/api/ponto', (req, res) => {
  try {
    const { funcionarioId, tipo } = req.body;
    const novoPonto = {
      id: Date.now().toString(),
      funcionarioId,
      tipo,
      dataHora: new Date()
    };
    pontos.push(novoPonto);
    res.status(201).json(novoPonto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar ponto.' });
  }
});

// Relatório Semanal
app.get('/api/relatorio-semanal', (req, res) => {
  const diasDaSemana = [
    { nomeDia: 'Seg', dataFormatada: '22/09' },
    { nomeDia: 'Ter', dataFormatada: '23/09' },
    { nomeDia: 'Qua', dataFormatada: '24/09' },
    { nomeDia: 'Qui', dataFormatada: '25/09' },
    { nomeDia: 'Sex', dataFormatada: '26/09' }
  ];

  const gradeSemanal = funcionarios.map(func => ({
    funcionario: func,
    dias: [
      { status: 'PRESENTE', horaPonto: '08:00' },
      { status: 'PRESENTE', horaPonto: '08:05' },
      { status: '-', horaPonto: '' },
      { status: '-', horaPonto: '' },
      { status: '-', horaPonto: '' }
    ]
  }));

  res.json({ diasDaSemana, gradeSemanal });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});