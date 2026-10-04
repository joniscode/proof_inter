import { HttpError } from './http-error.js';

export function positiveInteger(value: unknown, field: string, maximum = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new HttpError(400, 'INVALID_INPUT', `${field} debe ser un entero positivo.`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
    throw new HttpError(400, 'INVALID_INPUT', `${field} debe estar entre 1 y ${maximum}.`);
  }
  return number;
}

export function optionalText(value: unknown, field: string, maximum: number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > maximum) {
    throw new HttpError(400, 'INVALID_INPUT', `${field} debe ser un texto de hasta ${maximum} caracteres.`);
  }
  return value.trim() || undefined;
}

export function allowedFields(value: object, fields: string[]): void {
  if (Object.keys(value).some(key => !fields.includes(key))) {
    throw new HttpError(400, 'INVALID_INPUT', 'La solicitud contiene campos no permitidos.');
  }
}
