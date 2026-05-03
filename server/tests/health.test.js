import { describe, test, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Health Check API', () => {
  test('GET /api/health returns status 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  test('GET /api/health returns JSON body { status: "ok" }', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /api/health responds in under 200ms', async () => {
    const start = Date.now();
    await request(app).get('/api/health');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
