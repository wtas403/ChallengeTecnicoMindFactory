import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { connectTestDatabase, disconnectTestDatabase, seedDatabase } from '../helpers/test-db';

describe('Sujetos API', () => {
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

  it('obtiene un sujeto existente por cuit', async () => {
    const response = await request(app).get('/api/sujetos/by-cuit').query({ cuit: '20123456786' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });
  });

  it('responde 404 cuando el sujeto no existe', async () => {
    const response = await request(app).get('/api/sujetos/by-cuit').query({ cuit: '20333333334' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 'SUJETO_NOT_FOUND',
      message: 'No existe un sujeto para el CUIT informado.',
    });
  });

  it('responde 422 cuando el cuit es invalido', async () => {
    const response = await request(app).get('/api/sujetos/by-cuit').query({ cuit: '20123456780' });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.errors).toContainEqual({
      field: 'cuit',
      message: 'El CUIT informado no es valido.',
    });
  });

  it('crea un sujeto valido', async () => {
    const response = await request(app).post('/api/sujetos').send({
      cuit: '20329642330',
      nombreCompleto: 'Ana Torres',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      cuit: '20329642330',
      nombreCompleto: 'Ana Torres',
    });
  });

  it('responde 409 al crear un sujeto duplicado', async () => {
    const response = await request(app).post('/api/sujetos').send({
      cuit: '20123456786',
      nombreCompleto: 'Juan Perez',
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('SUJETO_ALREADY_EXISTS');
    expect(response.body.errors).toContainEqual({
      field: 'cuit',
      message: 'Ya existe un sujeto para el CUIT informado.',
    });
  });

  it('responde 422 al crear un sujeto invalido', async () => {
    const response = await request(app).post('/api/sujetos').send({
      cuit: '20123456780',
      nombreCompleto: '   ',
    });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
