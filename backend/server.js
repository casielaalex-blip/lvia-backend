const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Lista de Funcionários Iniciais
let funcionarios = [
  {
    id: '1',
    nome: 'Alex Casiela',
    cargo: 'Assistente',
    setor: 'Técnico',
    dadosPessoais: '28-07-2003'
  }
];

// O histórico de pontos começa completamente vazio
let pontos = [];

// Função para formatar a data sem errar no fuso horário
function dataParaISODataLocal(date) {
  const d = new Date(date);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Gera os 5 dias da semana atual (Segunda a Sexta)
function getDiasDaSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); 
  
  const distanciaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + distanciaParaSegunda);

  const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const dias = [];

  for (let i = 0; i < 5; i++) {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    
    const isoData = dataParaISODataLocal(d);
    const diaNum = String(d.getDate()).padStart(2, '0');
    const mesNum = String(d.getMonth() + 1).padStart(2, '0');
    
    dias.push({
      nomeDia: nomesDias[i],
      dataFormatada: `${diaNum}/${mesNum}`,
      isoData: isoData
    });
  }

  return dias;
}

// ==========================================
// ROTAS DE FUNCIONÁRIOS
// ==========================================
app.get('/api/funcionarios', (req, res) => res.json(funcionarios));

app.post('/api/funcionarios', (req, res) => {
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
});

app.put('/api/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cargo, setor, departamento, dadosPessoais } = req.body;
  const index = funcionarios.findIndex(f => f.id === id || f._id === id);

  if (index === -1) return res.status(404).json({ error: 'Não encontrado.' });

  funcionarios[index] = {
    ...funcionarios[index],
    nome: nome !== undefined ? nome : funcionarios[index].nome,
    cargo: cargo !== undefined ? cargo : funcionarios[index].cargo,
    setor: setor || departamento || funcionarios[index].setor,
    dadosPessoais: dadosPessoais !== undefined ? dadosPessoais : funcionarios[index].dadosPessoais
  };
  res.json(funcionarios[index]);
});

app.delete('/api/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  funcionarios = funcionarios.filter(f => f.id !== id && f._id !== id);
  res.json({ message: 'Eliminado com sucesso!' });
});

// ==========================================
// ROTAS DE PONTO E RELATÓRIO
// ==========================================

app.post('/api/ponto', (req, res) => {
  const { funcionarioId, tipo } = req.body;
  const novoPonto = {
    id: Date.now().toString(),
    funcionarioId,
    tipo: tipo || 'Entrada',
    dataHora: new Date()
  };
  pontos.push(novoPonto);
  res.status(201).json(novoPonto);
});

app.get('/api/relatorio-semanal', (req, res) => {
  const hojeISO = dataParaISODataLocal(new Date());
  const diasDaSemana = getDiasDaSemanaAtual();

  const gradeSemanal = funcionarios.map(func => {
    const funcId = (func._id || func.id).toString();

    const dias = diasDaSemana.map(dia => {
      // Procura se o funcionário bateu ponto neste dia exato
      const pontoDoDia = pontos.find(p => {
        const pFuncId = (p.funcionarioId || '').toString();
        const pDataISO = dataParaISODataLocal(p.dataHora);
        return pFuncId === funcId && pDataISO === dia.isoData;
      });

      if (pontoDoDia) {
        // Mostra a hora apenas se bateu o ponto
        const hora = new Date(pontoDoDia.dataHora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        return { status: 'PRESENTE', horaPonto: hora };
      } else {
        // Se não bateu ponto e é hoje ou um dia passado -> FALTA
        if (dia.isoData <= hojeISO) {
          return { status: 'FALTA', horaPonto: '' };
        } else {
          // Dias no futuro
          return { status: '-', horaPonto: '' };
        }
      }
    });

    return { funcionario: func, dias: dias };
  });

  res.json({ diasDaSemana, gradeSemanal });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});