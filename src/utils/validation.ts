import { INVALID_DATE, INVALID_PROPERTY } from "../responses/apiMessages";
import { BadRequestError } from "../responses/customApiError";

const rutRegex: RegExp = /^\d{1,8}-[\dkK]$/;
const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex: RegExp = /^\+?[0-9]{7,12}$/;

export const parseString = (param: any, fieldName: string): string => {
  if (!isString(param)) {
    throw new BadRequestError(`${INVALID_PROPERTY}${fieldName}.`);
  }

  return param;
};

export const parseDate = (param: any, fieldName: string): Date => {
  if (!isString(param) || !isDate(param)) {
    throw new BadRequestError(`${INVALID_PROPERTY}${fieldName}.`);
  }
  return param;
};

export const parseNum = (param: any, fieldName: string): Number => {
  if (!isNumber(param)) {
    throw new BadRequestError(`${INVALID_PROPERTY}${fieldName}.`);
  }
  return param;
};

export const parseBoolean = (param: any, fieldName: string): boolean => {
  if (!isBoolean(param)) {
    throw new BadRequestError(`${INVALID_PROPERTY}${fieldName}. Expect a boolean.`);
  }
  return param;
};

export const parseEnum = <T extends Record<string, string>>(
  param: any,
  Enum: T,
  fieldName: string
): T[keyof T] => {
  if (!isString(param) || !isEnum(param, Enum)) {
    throw new BadRequestError(`Incorrect or missing ${fieldName}`);
  }

  return param as T[keyof T];
};

export const isEnum = (string: string, Enum: object): boolean => {
  return Object.values(Enum).includes(string);
};

export const isString = (string: string): boolean => {
  return typeof string === "string" && string.length >= 1;
};

export const isNumber = (number: any): boolean => {
  return typeof number === "number";
};

const isDate = (date: string): boolean => {
  if (date.length <= 1) {
    throw new BadRequestError(INVALID_DATE);
  }
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900;
};

const isBoolean = (value: boolean): boolean => {
  return typeof value === "boolean";
};

const calculateRutVerifier = (number: string) => {
  let sum = 0;
  let mul = 2;

  let i = number.length;
  while (i--) {
    sum = sum + parseInt(number.charAt(i)) * mul;
    if (mul % 7 === 0) {
      mul = 2;
    } else {
      mul++;
    }
  }

  const res = sum % 11;

  if (res === 0) {
    return "0";
  } else if (res === 1) {
    return "K";
  }

  return `${11 - res}`;
};

export const validateRutPattern = (rut: string): boolean => {
  if (!rutRegex.test(rut)) return false; // Validar formato rut XXXXXXX-X

  rut = rut.replace("-", "").toUpperCase();
  const rutNumber = rut.slice(0, -1);
  const verifierDigit = rut.slice(-1);

  return verifierDigit === calculateRutVerifier(rutNumber);
};

export const validateEmailPattern = (email: string): boolean => {
  if (!emailRegex.test(email)) return false;
  return true;
};

export const validatePhonePattern = (phone: string): boolean => {
  if (!phoneRegex.test(phone)) return false;
  return true;
};

export const validateIsArrayOfTypeNumber = (value: number[]): boolean => {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
};

export const validateParamIsNumber = (param: any): boolean => {
  if (isNaN(param)) return false;
  return true;
};
