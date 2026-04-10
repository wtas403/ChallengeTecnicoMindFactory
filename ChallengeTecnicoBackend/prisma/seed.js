"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.automotor.deleteMany();
    await prisma.sujeto.deleteMany();
    const sujetos = await prisma.sujeto.createManyAndReturn({
        data: [
            { cuit: '20123456786', nombreCompleto: 'Juan Perez' },
            { cuit: '27345678901', nombreCompleto: 'Maria Gomez' },
            { cuit: '20987654321', nombreCompleto: 'Carlos Diaz' },
        ],
    });
    await prisma.automotor.createMany({
        data: [
            {
                dominio: 'AA123BB',
                chasis: 'CHS-0001',
                motor: 'MTR-0001',
                color: 'Rojo',
                fechaFabricacion: '202401',
                sujetoId: sujetos[0].id,
            },
            {
                dominio: 'AB456CD',
                chasis: 'CHS-0002',
                motor: 'MTR-0002',
                color: 'Azul',
                fechaFabricacion: '202212',
                sujetoId: sujetos[1].id,
            },
            {
                dominio: 'AAA999',
                chasis: 'CHS-0003',
                motor: 'MTR-0003',
                color: 'Blanco',
                fechaFabricacion: '202110',
                sujetoId: sujetos[2].id,
            },
        ],
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
