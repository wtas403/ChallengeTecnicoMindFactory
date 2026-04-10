import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { connectTestDatabase, disconnectTestDatabase, seedDatabase } from '../helpers/test-db';

describe('Automotores API', () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDatabase();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('lista automotores', async () => {
    const response = await request(app).get('/api/automotores');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        dominio: expect.any(String),
        sujeto: expect.objectContaining({
          cuit: expect.any(String),
          nombreCompleto: expect.any(String),
        }),
      }),
    );
  });

  it('obtiene automotor por dominio', async () => {
    const response = await request(app).get('/api/automotores/AA123BB');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        dominio: 'AA123BB',
        chasis: 'CHS-0001',
        motor: 'MTR-0001',
      }),
    );
  });

  it('responde 404 para dominio inexistente', async () => {
    const response = await request(app).get('/api/automotores/AC123DE');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 'AUTOMOTOR_NOT_FOUND',
      message: 'No existe un automotor para el dominio informado.',
    });
  });

  it('responde 422 para dominio mal formado', async () => {
    const response = await request(app).get('/api/automotores/123');

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.errors).toContainEqual({
      field: 'dominio',
      message: 'El dominio debe tener formato AAA999 o AA999AA.',
    });
  });

  it('crea un automotor valido', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'AC123DE',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      dominio: 'AC123DE',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      sujeto: {
        cuit: '20123456786',
        nombreCompleto: 'Juan Perez',
      },
    });
  });

  it('responde 409 si el dominio ya existe', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'AA123BB',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('AUTOMOTOR_DOMINIO_ALREADY_EXISTS');
  });

  it('responde 409 si el chasis ya existe', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'AC123DE',
      chasis: 'CHS-0001',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('AUTOMOTOR_CHASIS_ALREADY_EXISTS');
  });

  it('responde 409 si el motor ya existe', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'AC123DE',
      chasis: 'CHS-9999',
      motor: 'MTR-0001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('AUTOMOTOR_MOTOR_ALREADY_EXISTS');
  });

  it('responde 422 si el titular no existe', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'AC123DE',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20333333334',
    });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('TITULAR_NOT_FOUND');
    expect(response.body.errors).toContainEqual({
      field: 'nombreTitular',
      message:
        'No existe un sujeto para este CUIT. Ingresa el nombre completo para crearlo junto al automotor.',
    });
  });

  it('crea automotor junto con titular nuevo en una sola operacion', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'AC123DE',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20333333334',
      nombreTitular: 'Ana Torres',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      dominio: 'AC123DE',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      sujeto: {
        cuit: '20333333334',
        nombreCompleto: 'Ana Torres',
      },
    });
  });

  it('no crea sujeto si falla create de automotor por dominio duplicado', async () => {
    const createResponse = await request(app).post('/api/automotores').send({
      dominio: 'AA123BB',
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20333333334',
      nombreTitular: 'Ana Torres',
    });

    expect(createResponse.status).toBe(409);
    expect(createResponse.body.code).toBe('AUTOMOTOR_DOMINIO_ALREADY_EXISTS');

    const titularResponse = await request(app).get('/api/sujetos/by-cuit').query({ cuit: '20333333334' });
    expect(titularResponse.status).toBe(404);
    expect(titularResponse.body.code).toBe('SUJETO_NOT_FOUND');
  });

  it('responde 422 con body invalido', async () => {
    const response = await request(app).post('/api/automotores').send({
      dominio: 'A',
      chasis: '',
      motor: '',
      color: '',
      fechaFabricacion: '209901',
      cuitTitular: '20123456780',
    });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('actualiza un automotor y permite reasignar titular', async () => {
    const response = await request(app).put('/api/automotores/AA123BB').send({
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20000000019',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dominio: 'AA123BB',
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Negro',
      fechaFabricacion: '202401',
      sujeto: {
        cuit: '20000000019',
        nombreCompleto: 'Maria Gomez',
      },
    });
  });

  it('responde 404 al actualizar un dominio inexistente', async () => {
    const response = await request(app).put('/api/automotores/AC123DE').send({
      chasis: 'CHS-9999',
      motor: 'MTR-9999',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('AUTOMOTOR_NOT_FOUND');
  });

  it('responde 409 al actualizar con chasis duplicado', async () => {
    const response = await request(app).put('/api/automotores/AA123BB').send({
      chasis: 'CHS-0002',
      motor: 'MTR-0001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('AUTOMOTOR_CHASIS_ALREADY_EXISTS');
  });

  it('responde 409 al actualizar con motor duplicado', async () => {
    const response = await request(app).put('/api/automotores/AA123BB').send({
      chasis: 'CHS-0001',
      motor: 'MTR-0002',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20123456786',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('AUTOMOTOR_MOTOR_ALREADY_EXISTS');
  });

  it('responde 422 al actualizar con titular inexistente', async () => {
    const response = await request(app).put('/api/automotores/AA123BB').send({
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20333333334',
    });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('TITULAR_NOT_FOUND');
    expect(response.body.errors).toContainEqual({
      field: 'nombreTitular',
      message:
        'No existe un sujeto para este CUIT. Ingresa el nombre completo para crearlo junto al automotor.',
    });
  });

  it('actualiza automotor con reasignacion a titular nuevo en una sola operacion', async () => {
    const response = await request(app).put('/api/automotores/AA123BB').send({
      chasis: 'CHS-0001',
      motor: 'MTR-0001',
      color: 'Negro',
      fechaFabricacion: '202401',
      cuitTitular: '20333333334',
      nombreTitular: 'Ana Torres',
    });

    expect(response.status).toBe(200);
    expect(response.body.sujeto).toEqual({
      cuit: '20333333334',
      nombreCompleto: 'Ana Torres',
    });
  });

  it('elimina un automotor existente', async () => {
    const response = await request(app).delete('/api/automotores/AA123BB');

    expect(response.status).toBe(204);

    const fetchResponse = await request(app).get('/api/automotores/AA123BB');
    expect(fetchResponse.status).toBe(404);
  });

  it('responde 404 al eliminar un automotor inexistente', async () => {
    const response = await request(app).delete('/api/automotores/AC123DE');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('AUTOMOTOR_NOT_FOUND');
  });
});
