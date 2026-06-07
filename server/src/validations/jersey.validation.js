const { z } = require('zod');

const allowedSleeveTypes = ['HALF', 'FULL'];
const allowedVersionTypes = ['FAN', 'PLAYER'];
const allowedFeaturedClubs = ['BARCELONA', 'REAL_MADRID', 'MAN_UNITED', 'AC_MILAN'];
const allowedSizeTypes = ['S', 'M', 'L', 'XL', '2XL'];
const allowedSortFields = ['created_at', 'price', 'name', 'team_name', 'featured_club'];
const allowedSortOrders = ['asc', 'desc'];
const allowedCategoryTypes = ['INTERNATIONAL', 'CLUB', 'SHORTS', 'OTHER'];

function normalizeSizeList(value) {
  const normalize = (size) => {
    const upper = String(size || '').trim().toUpperCase();
    if (upper === 'ZXL' || upper === 'XXL') {
      return '2XL';
    }

    return upper;
  };

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(normalize);
      }
    } catch {
      return value.split(',').map(normalize).filter(Boolean);
    }
  }

  if (Array.isArray(value)) {
    return value.map(normalize).filter(Boolean);
  }

  return value;
}

function emptyToUndefined(value) {
  if (value === '' || value === null) {
    return undefined;
  }

  return value;
}

function stringOrNull(schema) {
  return z.preprocess((value) => emptyToUndefined(value), schema.optional().nullable());
}

function booleanBodySchema(defaultValue) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();

      if (lower === 'true') {
        return true;
      }

      if (lower === 'false') {
        return false;
      }
    }

    return value;
  }, z.boolean());
}

function booleanQuerySchema() {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();

      if (lower === 'true') {
        return true;
      }

      if (lower === 'false') {
        return false;
      }
    }

    return value;
  }, z.boolean().optional());
}

function booleanOptionalBodySchema() {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();

      if (lower === 'true') {
        return true;
      }

      if (lower === 'false') {
        return false;
      }
    }

    return value;
  }, z.boolean().optional());
}

function numberQuerySchema() {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return Number(value);
  }, z.number().finite().nonnegative().optional());
}

function integerQuerySchema(defaultValue, minValue, maxValue) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    return Number(value);
  }, z.number().int().min(minValue).max(maxValue));
}

const jerseyListQuerySchema = z
  .object({
    search: z.preprocess((value) => emptyToUndefined(value), z.string().trim().max(100).optional()),
    team: z.preprocess((value) => emptyToUndefined(value), z.string().trim().max(255).optional()),
    price_min: numberQuerySchema(),
    price_max: numberQuerySchema(),
    national_team: booleanQuerySchema(),
    has_shorts: booleanQuerySchema(),
    sleeve_type: z.preprocess(
      (value) => emptyToUndefined(value),
      z.enum(allowedSleeveTypes).optional()
    ),
    version_type: z.preprocess(
      (value) => emptyToUndefined(value),
      z.enum(allowedVersionTypes).optional()
    ),
    featured_club: z.preprocess(
      (value) => emptyToUndefined(value),
      z.enum(allowedFeaturedClubs).optional()
    ),
    category_type: z.preprocess(
      (value) => emptyToUndefined(value),
      z.enum(allowedCategoryTypes).optional()
    ),
    is_on_sale: booleanQuerySchema(),
    page: integerQuerySchema(1, 1, 1000000),
    limit: integerQuerySchema(12, 1, 100),
    sort_by: z.preprocess((value) => emptyToUndefined(value), z.enum(allowedSortFields).default('created_at')),
    sort_order: z.preprocess((value) => emptyToUndefined(value), z.enum(allowedSortOrders).default('desc'))
  })
  .refine(
    (data) => {
      if (data.price_min !== undefined && data.price_max !== undefined) {
        return data.price_min <= data.price_max;
      }

      return true;
    },
    {
      message: 'price_min must be less than or equal to price_max',
      path: ['price_max']
    }
  );

const jerseySlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case')
});

const jerseyIdParamsSchema = z.object({
  id: z.string().uuid()
});

const jerseyCreateSchema = z.object({
  slug: z.preprocess((value) => emptyToUndefined(value), z.string().trim().min(1).max(255).optional()),
  name: z.string().trim().min(1).max(255),
  team_name: z.string().trim().min(1).max(255),
  league_name: stringOrNull(z.string().trim().min(1).max(255)),
  description: stringOrNull(z.string().trim().max(10000)),
  price: z.coerce.number().positive(),
  is_national_team: booleanBodySchema(false),
  has_shorts: booleanBodySchema(false),
  sleeve_type: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedSleeveTypes).optional().nullable()
  ),
  version_type: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedVersionTypes).optional().nullable()
  ),
  featured_club: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedFeaturedClubs).optional().nullable()
  ),
  available_sizes: z.preprocess(normalizeSizeList, z.array(z.enum(allowedSizeTypes)).optional().nullable()),
  is_active: booleanBodySchema(true),
  category_type: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedCategoryTypes).default('CLUB')
  ),
  is_on_sale: booleanBodySchema(false),
  sale_price: z.preprocess(
    (value) => emptyToUndefined(value),
    z.coerce.number().positive().optional().nullable()
  )
}).refine(
  (data) => {
    if (data.is_on_sale) {
      if (data.sale_price === undefined || data.sale_price === null) {
        return false;
      }
      return data.sale_price < data.price;
    }
    return true;
  },
  {
    message: 'sale_price must be present and less than regular price when is_on_sale is true',
    path: ['sale_price']
  }
);

const jerseyUpdateSchema = z.object({
  slug: z.preprocess((value) => emptyToUndefined(value), z.string().trim().min(1).max(255).optional()),
  name: z.preprocess((value) => emptyToUndefined(value), z.string().trim().min(1).max(255).optional()),
  team_name: z.preprocess((value) => emptyToUndefined(value), z.string().trim().min(1).max(255).optional()),
  league_name: stringOrNull(z.string().trim().min(1).max(255)),
  description: stringOrNull(z.string().trim().max(10000)),
  price: z.preprocess(
    (value) => emptyToUndefined(value),
    z.coerce.number().positive().optional()
  ),
  is_national_team: booleanOptionalBodySchema(),
  has_shorts: booleanOptionalBodySchema(),
  sleeve_type: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedSleeveTypes).optional().nullable()
  ),
  version_type: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedVersionTypes).optional().nullable()
  ),
  featured_club: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedFeaturedClubs).optional().nullable()
  ),
  available_sizes: z.preprocess(normalizeSizeList, z.array(z.enum(allowedSizeTypes)).optional().nullable()),
  is_active: booleanOptionalBodySchema(),
  category_type: z.preprocess(
    (value) => emptyToUndefined(value),
    z.enum(allowedCategoryTypes).optional()
  ),
  is_on_sale: booleanOptionalBodySchema(),
  sale_price: z.preprocess(
    (value) => emptyToUndefined(value),
    z.coerce.number().positive().optional().nullable()
  )
}).refine(
  (data) => {
    if (data.is_on_sale && data.sale_price !== undefined && data.sale_price !== null) {
      if (data.price !== undefined && data.price !== null) {
        return data.sale_price < data.price;
      }
    }
    return true;
  },
  {
    message: 'sale_price must be less than regular price when is_on_sale is true',
    path: ['sale_price']
  }
);

module.exports = {
  jerseyListQuerySchema,
  jerseyCreateSchema,
  jerseyUpdateSchema,
  jerseySlugParamsSchema,
  jerseyIdParamsSchema
};