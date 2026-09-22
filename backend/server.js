const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Lista de Funcionários Iniciais
let funcionarios = [
  {
    id: '1',
    nome: 'Alex Casiela Sétima',
    cargo: 'Assistente',
    setor: 'Técnico',
    dadosPessoais: '28-07-2003'
  }
];

// O histórico de pontos
let pontos = [];

// Função para obter a data (YYYY-MM-DD) no fuso horário exato de Moçambique
function dataParaISODataLocal(date) {
  const formatter = new Intl.DateTimeFormat('pt-PT', {
    timeZone: 'Africa/Maputo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const partes = formatter.formatToParts(new Date(date));
  const dia = partes.find(p => p.type === 'day').value;
  const mes = partes.find(p => p.type === 'month').value;
  const ano = partes.find(p => p.type === 'year').value;
  return `${ano}-${mes}-${dia}`;
}

// Gera os 5 dias da semana atual (Segunda a Sexta) com base no fuso de Moçambique
function getDiasDaSemanaAtual() {
  // Pega a hora atual em Maputo para não falhar a virada do dia
  const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Maputo" }));
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
    dataHora: new Date() // Fica em UTC no servidor, formatamos na saída
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
      // Procura se o funcionário bateu ponto neste dia
      const pontoDoDia = pontos.find(p => {
        const pFuncId = (p.funcionarioId || '').toString();
        const pDataISO = dataParaISODataLocal(p.dataHora);
        return pFuncId === funcId && pDataISO === dia.isoData;
      });

      if (pontoDoDia) {
        // FORÇA O FUSO HORÁRIO DE MOÇAMBIQUE NA HORA MOSTRADA
        const hora = new Intl.DateTimeFormat('pt-PT', {
          timeZone: 'Africa/Maputo',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(pontoDoDia.dataHora));
        
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