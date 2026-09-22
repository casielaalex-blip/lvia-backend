const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function rodarRoboAgora() {
  console.log('🔄 Iniciando varredura forçada de faltas...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  try {
    const activeEmployees = await prisma.employee.findMany({
      where: { isActive: true }
    });

    if (activeEmployees.length === 0) {
      console.log('⚠️ Nenhum funcionário ativo encontrado no banco.');
      return;
    }

    for (const employee of activeEmployees) {
      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: today
        }
      });

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
        console.log(`❌ Falta automática registrada para: ${employee.name}`);
      } else {
        console.log(`✅ ${employee.name} já tem ponto registrado hoje.`);
      }
    }
    console.log('✅ Varredura concluída com sucesso.');
  } catch (error) {
    console.error("❌ Erro ao processar faltas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

rodarRoboAgora();