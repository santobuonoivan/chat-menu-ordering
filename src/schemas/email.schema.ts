import Joi from "joi";

export const EmailSchema = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "ai", "lat", "mx", "us"] },
  })
  .required()
  .custom((value, helpers) => {
    if (
      value.includes("@") &&
      value.split("@")[1].toLowerCase() === "admin.com"
    ) {
      return helpers.message({
        custom:
          'La dirección de correo electrónico no puede ser de "admin.com"',
      });
    }
    return value;
  })
  .messages({
    "string.email": "Ingrese una dirección de correo electrónico válida",
    "string.empty": '"Email" no puede estar vacío',
    "string.invalid": '"Email" no puede ser "null"',
    "string.required": '"Email" no puede ser "null"',
  });

export const EmailAdminSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ai", "lat", "mx", "us"] },
    })
    .required()
    .custom((value, helpers) => {
      if (
        value.includes("@") &&
        value.split("@")[1].toLowerCase() === "admin.com"
      ) {
        return helpers.message({
          custom:
            'La dirección de correo electrónico no puede ser de "admin.com"',
        });
      }
      return value;
    }),
}).messages({
  "string.email": "Ingrese una dirección de correo electrónico válida",
  "string.empty": "{#label} no puede estar vacío",
  "string.invalid": '{#label} no puede ser "null"',
});

export const NameSchema = Joi.string()
  .regex(/^\S+\s\S+$/)
  .messages({
    "string.empty":
      "El nombre no puede estar vacío, debe contener nombre y apellido separado por un espacio",
    "string.pattern.base":
      "El nombre debe contener nombre y apellido separado por un espacio",
  });

export const PhoneSchema = Joi.string()
  .min(8)
  .max(15)
  .pattern(/^\d+$/)
  .required()
  .messages({
    "string.length": "El número de teléfono debe tener mínimo 8 caracteres",
    "string.min": "El número de teléfono debe tener mínimo 8 caracteres",
    "string.max": "El número de teléfono debe tener máximo 15 caracteres",
    "string.pattern.base": "El número de teléfono debe contener solo dígitos",
    "any.required":
      "El número de teléfono es obligatorio, debe tener mínimo 8 caracteres",
    "string.empty":
      "El número de teléfono es obligatorio, debe tener mínimo 8 caracteres",
  });

export const CustomerSchema = Joi.object({
  name: NameSchema,
  phone: PhoneSchema,
});

export const CustomerMobileSchema = Joi.object({
  search: PhoneSchema,
});

export const OrderCostSchema = Joi.object({
  total: Joi.number().greater(0).required().messages({
    "object.base": "Debe haber una cotización para seguir",
    "number.base": "El costo debe ser un valor numérico",
    "number.greater":
      "Debe haber una cotización para seguir, se calcula automático cuando seleccionas una dirección del envío",
    "any.required": "El costo es obligatorio",
  }),
})
  .messages({
    "object.base": "Debe haber una cotización para seguir",
    "any.required":
      "La cotización es obligatoria y automática cuando seleccionas una dirección del envío para seguir",
  })
  .unknown(true);

export const OrderCostDistanceSchema = Joi.object().messages({
  "object.base":
    "Debe haber un cálculo de distancia, se calcula automático cuando seleccionas una dirección del envío",
  "any.required": "Debe haber un cálculo de distancia",
});

export const LocationSelectedSchema = Joi.object({
  // city: Joi.string().required().messages({
  //   'string.base': 'La ciudad debe ser un string',
  //   'string.empty': 'La ciudad no debe estar vacía',
  //   'any.required': 'La ciudad es obligatoria',
  // }),
  // state: Joi.string().required().messages({
  //   'string.base': 'El estado debe ser un string',
  //   'string.empty': 'El estado no debe estar vacío',
  //   'any.required': 'El estado es obligatorio',
  // }),
  // street: Joi.string().required().messages({
  //   'string.base': 'La calle debe ser un string',
  //   'string.empty': 'La calle no debe estar vacía',
  //   'any.required': 'La calle es obligatoria',
  // }),
  // postalCode: Joi.string().required().messages({
  //   'string.base': 'El código postal debe ser un string',
  //   'string.empty': 'El código postal no debe estar vacío',
  //   'any.required': 'El código postal es obligatorio',
  // }),
  address: Joi.string().required().messages({
    "string.base": "La dirección debe ser un string",
    "string.empty": "La dirección no debe estar vacía",
    "any.required": "La dirección es obligatoria",
  }),
})
  .unknown(true)
  .required()
  .messages({
    "object.base": "Debe ingresar una dirección de envío, es obligatoria",
    "any.required": "Debe ingresar una dirección de envío, es obligatoria",
  });

export const RestsSelectedSchema = Joi.alternatives()
  .try(Joi.string().required(), Joi.number().required())
  .messages({
    "string.base": "Debe haber un restaurante seleccionado",
    "number.base": "Debe haber un restaurante seleccionado",
    "any.required": "Debe haber un restaurante seleccionado",
    "alternatives.types": "Debe haber un restaurante seleccionado",
  });

export const LocationCostSchema = Joi.object({
  rests: RestsSelectedSchema,
  costTotal: OrderCostSchema,
  location: LocationSelectedSchema,
  costDistance: OrderCostDistanceSchema,
});

export const OrderSchema = Joi.object({
  orderAmount: Joi.number().greater(14).less(5001).required().messages({
    "number.base":
      "El monto del pedido debe ser una cantidad mayor o igual a 15.00 MXN",
    "number.greater": "El monto del pedido debe ser mayor o igual a 15.00 MXN",
    "number.less": "El monto del pedido debe ser menor a 5000.00 MXN",
    "any.required": "El monto del pedido es obligatorio",
  }),
  time: Joi.number().min(0).less(120).required().messages({
    "number.base": "El tiempo del pedido debe ser un número en minutos",
    "number.min": "El tiempo del pedido debe ser mayor o igual que 0 MIN",
    "number.less": "El tiempo del pedido debe ser menor que 120 MIN",
    "any.required": "El tiempo del pedido es obligatorio",
  }),
  option: Joi.object().required().messages({
    "any.required": "El tipo de pago es obligatorio",
  }),
  method: Joi.number().integer().required().messages({
    "number.base": "Debe seleccionar el tipo de pago del pedido",
    "number.integer":
      "El tipo de pago del pedido debe ser un valor de la lista",
    "any.required": "El tipo de pago del pedido es obligatorio",
  }),
});
