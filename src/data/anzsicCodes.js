export const ANZSIC_CATEGORIES = [
  {
    label: 'Cafes & Restaurants',
    codes: [
      { code: '4511', label: 'Cafes, Restaurants and Takeaway Food Services' },
      { code: '4512', label: 'Pubs, Bars and Nightclubs' },
    ],
  },
  {
    label: 'Hair & Beauty',
    codes: [
      { code: '9511', label: 'Hairdressing and Beauty Services' },
    ],
  },
  {
    label: 'Fitness & Sport',
    codes: [
      { code: '9111', label: 'Sports and Physical Recreation Activities' },
    ],
  },
  {
    label: 'Retail',
    codes: [
      { code: '4111', label: 'Supermarket and Grocery Stores' },
      { code: '4251', label: 'Clothing Retailing' },
      { code: '4521', label: 'Hardware and Building Supplies Retailing' },
    ],
  },
  {
    label: 'Construction & Trades',
    codes: [
      { code: '3011', label: 'House Construction' },
      { code: '3020', label: 'Non-Residential Building Construction' },
      { code: '3211', label: 'Plumbing Services' },
      { code: '3212', label: 'Electrical Services' },
      { code: '3221', label: 'Painting and Decorating Services' },
      { code: '3222', label: 'Plastering and Ceiling Services' },
    ],
  },
  {
    label: 'Accommodation',
    codes: [
      { code: '4400', label: 'Accommodation' },
    ],
  },
  {
    label: 'Real Estate',
    codes: [
      { code: '6711', label: 'Residential Property Operators' },
      { code: '6721', label: 'Real Estate Services' },
    ],
  },
  {
    label: 'Automotive',
    codes: [
      { code: '5321', label: 'Automotive Repair and Maintenance' },
      { code: '5322', label: 'Automotive Body Repair Services' },
    ],
  },
  {
    label: 'Cleaning Services',
    codes: [
      { code: '7322', label: 'Cleaning Services' },
    ],
  },
  {
    label: 'Photography',
    codes: [
      { code: '6942', label: 'Photographic Services' },
    ],
  },
  {
    label: 'Events & Catering',
    codes: [
      { code: '4520', label: 'Catering Services' },
    ],
  },
  {
    label: 'Dental',
    codes: [
      { code: '8531', label: 'Dental Services' },
    ],
  },
  {
    label: 'Veterinary',
    codes: [
      { code: '6952', label: 'Veterinary Services' },
    ],
  },
  {
    label: 'Education',
    codes: [
      { code: '8101', label: 'Preschool Education' },
      { code: '8102', label: 'Primary Education' },
      { code: '8103', label: 'Secondary Education' },
      { code: '8219', label: 'Other Education' },
    ],
  },
];

export const ALL_ANZSIC_CODES = ANZSIC_CATEGORIES.flatMap((cat) => cat.codes);

export const ANZSIC_CODE_MAP = Object.fromEntries(
  ALL_ANZSIC_CODES.map(({ code, label }) => [code, label])
);
