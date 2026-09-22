// automacao.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Agenda para rodar todos os dias às 23:59
cron.schedule('59 23 * * *', async () => {
  console.log('🔄 Executando verificação automática de faltas...');
  
  const today = new Date();
  // Zera as horas para salvar apenas a data pura no banco (YYYY-MM-DD)
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth() + 1; // Janeiro é 0, por isso somamos +1
  const currentYear = today.getFullYear();

  try {
    // 1. Busca todos os funcionários que estão ativos na empresa
    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true }
    });

    for (const employee of activeEmployees) {
      // 2. Verifica se o funcionário bateu ponto (tem registro) hoje
      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: today
        }
      });

      // 3. Se não tem registro de ponto hoje, o sistema entende que ele faltou
      if (!attendance) {
        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: today,
            month: currentMonth,
            year: currentYear,
            status: "FALTA"
          }
        });
        console.log(`❌ Falta registrada automaticamente para: ${employee.name}`);
      }
    }
    console.log('✅ Verificação de faltas concluída com sucesso.');
  } catch (error) {
    console.error("❌ Erro ao processar faltas automáticas:", error);
  }
});