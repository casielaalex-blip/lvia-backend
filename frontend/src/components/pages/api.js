const API_URL = "https://lvia-backend-2.onrender.com/api/funcionarios";

// Função para buscar funcionários
async function carregarFuncionarios() {
  try {
    const resposta = await fetch(API_URL);
    const dados = await resposta.json();
    console.log("Funcionários:", dados);
    return dados;
  } catch (erro) {
    console.error("Erro ao procurar funcionários:", erro);
  }
}

// Função para salvar novo funcionário
async function salvarFuncionario(funcionario) {
  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(funcionario)
    });
    const dados = await resposta.json();
    console.log("Salvo com sucesso:", dados);
    carregarFuncionarios();
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
  }
}