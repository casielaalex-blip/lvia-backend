const express = require('express');
const cors = require('cors');

const app = express();

// 1. Liberar acesso do frontend (Firebase) para a API (Render)
app.use(cors());

// 2. Permitir que o Express receba dados no formato JSON no req.body
app.use(express.json());

// Banco de dados em memória (substitua por MongoDB/PostgreSQL no futuro se desejar)
let funcionarios = [
  {
    id: 1,
    nome: "Alex Casiela Sétima",
    cargo: "Assistente",
    setor: "Técnico",
    dadosPessoais: "28-07-2003"
  }
];

// Rota raiz para testar se o servidor está online
app.get('/', (req, res) => {
  res.send('API do Sistema de Frequência está a rodar com sucesso!');
});

// GET: Listar todos os funcionários
app.get('/api/funcionarios', (req, res) => {
  res.json(funcionarios);
});

// POST: Cadastrar um novo funcionário
app.post('/api/funcionarios', (req, res) => {
  const { nome, cargo, setor, dadosPessoais } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome do funcionário é obrigatório.' });
  }

  const novoFuncionario = {
    id: Date.now(),
    nome,
    cargo: cargo || '',
    setor: setor || '',
    dadosPessoais: dadosPessoais || ''
  };

  funcionarios.push(novoFuncionario);
  res.status(201).json(novoFuncionario);
});

// DELETE: Remover um funcionário pelo ID
app.delete('/api/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  funcionarios = funcionarios.filter(f => String(f.id) !== String(id));
  res.json({ mensagem: 'Funcionário removido com sucesso.' });
});

// Porta dinâmica para o Render (utiliza a variável PORT do ambiente)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
});