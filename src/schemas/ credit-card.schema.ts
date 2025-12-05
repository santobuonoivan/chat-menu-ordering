import Joi from "joi";

export const CreditCardSchema = Joi.object({
  number: Joi.string().required().messages({
    "string.empty": "El número de tarjeta de crédito no es válido",
  }),
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": '"El nombre" debe ser un texto',
    "string.empty": '"El nombre" no puede estar vacío',
    "string.min": '"El nombre" debe tener al menos 1 carácter',
    "string.max": '"El nombre" no puede tener más de 100 caracteres',
  }),
  expirationDate: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)
    .required()
    .custom((value, helpers: any) => {
      const [month, year] = value.split("/");
      const expDate = new Date(
        Number(`20${year.length === 2 ? year : year.slice(2)}`),
        Number(month) - 1
      );
      if (expDate < new Date()) {
        return helpers.message("La tarjeta de crédito está vencida");
      }
      return value;
    })
    .messages({
      "string.pattern.base":
        "La fecha de vencimiento debe estar en el formato MM/AA o MM/AAAA",
      "string.empty": "La fecha de vencimiento no puede estar vacío",
    }),
  cvv: Joi.string()
    .pattern(/^[0-9]{3,4}$/)
    .required()
    .messages({
      "string.pattern.base": "El CVV debe ser de 3 o 4 dígitos",
      "string.empty": "El CVV no puede estar vacío",
    }),
});
