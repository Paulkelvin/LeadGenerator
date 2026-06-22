export const SIC_CATEGORIES = [
  {
    label: 'Restaurants & Cafes',
    codes: [
      { code: '56101', label: 'Licensed restaurants' },
      { code: '56102', label: 'Unlicensed restaurants and cafes' },
      { code: '56103', label: 'Take-away food shops' },
    ],
  },
  {
    label: 'Hair & Beauty Salons',
    codes: [
      { code: '96021', label: 'Hairdressing' },
      { code: '96022', label: 'Beauty treatment & nail bars' },
    ],
  },
  {
    label: 'Fitness & Gyms',
    codes: [
      { code: '93110', label: 'Operation of sports facilities' },
      { code: '93130', label: 'Fitness facilities (gyms)' },
    ],
  },
  {
    label: 'Retail',
    codes: [
      { code: '47110', label: 'Retail in non-specialised stores (food)' },
      { code: '47190', label: 'Other retail in non-specialised stores' },
      { code: '47710', label: 'Retail of clothing' },
      { code: '47810', label: 'Retail via stalls and markets (food)' },
    ],
  },
  {
    label: 'Construction & Trades',
    codes: [
      { code: '41100', label: 'Development of building projects' },
      { code: '41201', label: 'Construction of commercial buildings' },
      { code: '43110', label: 'Demolition' },
      { code: '43210', label: 'Electrical installation' },
      { code: '43290', label: 'Other construction installation' },
      { code: '43310', label: 'Plastering' },
      { code: '43341', label: 'Painting' },
      { code: '43390', label: 'Other building completion and finishing' },
    ],
  },
  {
    label: 'Accommodation & Hotels',
    codes: [
      { code: '55100', label: 'Hotels and similar accommodation' },
      { code: '55201', label: 'Holiday centres and villages' },
      { code: '55209', label: 'Other holiday and short-stay accommodation' },
    ],
  },
  {
    label: 'Real Estate',
    codes: [
      { code: '68100', label: 'Buying and selling of own real estate' },
      { code: '68209', label: 'Other letting and operating of own property' },
    ],
  },
  {
    label: 'Automotive Repair',
    codes: [
      { code: '45200', label: 'Maintenance and repair of motor vehicles' },
      { code: '45400', label: 'Sale and repair of motorcycles' },
    ],
  },
  {
    label: 'Cleaning Services',
    codes: [
      { code: '81210', label: 'General cleaning of buildings' },
      { code: '81221', label: 'Window cleaning services' },
      { code: '81290', label: 'Other building and industrial cleaning' },
    ],
  },
  {
    label: 'Photography',
    codes: [
      { code: '74201', label: 'Portrait photographic activities' },
    ],
  },
  {
    label: 'Events & Catering',
    codes: [
      { code: '56210', label: 'Event catering activities' },
    ],
  },
  {
    label: 'Dental',
    codes: [
      { code: '86230', label: 'Dental practice activities' },
    ],
  },
  {
    label: 'Veterinary',
    codes: [
      { code: '75000', label: 'Veterinary activities' },
    ],
  },
  {
    label: 'Education & Tutoring',
    codes: [
      { code: '85200', label: 'Primary education' },
      { code: '85310', label: 'General secondary education' },
      { code: '85320', label: 'Technical and vocational secondary education' },
      { code: '85590', label: 'Other education' },
    ],
  },
];

export const ALL_SIC_CODES = SIC_CATEGORIES.flatMap((cat) => cat.codes);

export const SIC_CODE_MAP = Object.fromEntries(
  ALL_SIC_CODES.map(({ code, label }) => [code, label])
);
