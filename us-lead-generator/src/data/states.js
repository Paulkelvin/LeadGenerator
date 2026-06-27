export const SOCRATA_STATES = {
  CO: {
    name: 'Colorado',
    emoji: '🏔️',
    color: 'blue',
    endpoint: 'https://data.colorado.gov/resource/4ykn-tg5h.json',
    fields: {
      name: 'entityname',
      type: 'entitytype',
      date: 'entityformdate',
      status: 'entitystatus',
      address: 'principaladdress1',
      city: 'principalcity',
      stateField: 'principalstate',
      zip: 'principalzipcode',
      agentFn: (r) => [r.agentfirstname, r.agentlastname].filter(Boolean).join(' '),
    },
    dateField: 'entityformdate',
    nameField: 'entityname',
    cityField: 'principalcity',
  },
  OR: {
    name: 'Oregon',
    emoji: '🌲',
    color: 'green',
    endpoint: 'https://data.oregon.gov/resource/tckn-sxa6.json',
    fields: {
      name: 'business_name',
      type: 'entity_type',
      date: 'registry_date',
      status: null,
      address: 'address',
      city: 'city',
      stateField: 'state',
      zip: 'zip',
      agent: 'authorized_name',
    },
    dateField: 'registry_date',
    nameField: 'business_name',
    cityField: 'city',
  },
  CT: {
    name: 'Connecticut',
    emoji: '⛵',
    color: 'red',
    endpoint: 'https://data.ct.gov/resource/n7gp-d28j.json',
    fields: {
      name: 'name',
      type: 'business_type',
      date: 'date_registration',
      status: 'status',
      address: 'business_street',
      city: 'business_city',
      stateField: 'business_state',
      zip: 'business_zip',
      agent: null,
    },
    dateField: 'date_registration',
    nameField: 'name',
    cityField: 'business_city',
  },
};

export const FILED_STATES = [
  { code: 'FL', name: 'Florida',     emoji: '🌴', color: 'orange' },
  { code: 'TX', name: 'Texas',       emoji: '⭐', color: 'yellow' },
  { code: 'NY', name: 'New York',    emoji: '🗽', color: 'purple' },
  { code: 'CA', name: 'California',  emoji: '🌅', color: 'amber'  },
  { code: 'WA', name: 'Washington',  emoji: '🌧️', color: 'teal'   },
  { code: 'IL', name: 'Illinois',    emoji: '🌆', color: 'indigo' },
  { code: 'NJ', name: 'New Jersey',  emoji: '🏙️', color: 'cyan'   },
  { code: 'GA', name: 'Georgia',     emoji: '🍑', color: 'pink'   },
];

export const STATE_BADGE_CLASSES = {
  blue:   'bg-blue-900/60 text-blue-300 border-blue-700/50',
  green:  'bg-green-900/60 text-green-300 border-green-700/50',
  red:    'bg-red-900/60 text-red-300 border-red-700/50',
  orange: 'bg-orange-900/60 text-orange-300 border-orange-700/50',
  yellow: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50',
  purple: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  amber:  'bg-amber-900/60 text-amber-300 border-amber-700/50',
  teal:   'bg-teal-900/60 text-teal-300 border-teal-700/50',
  indigo: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50',
  cyan:   'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
  pink:   'bg-pink-900/60 text-pink-300 border-pink-700/50',
};

export function getStateColor(stateCode) {
  if (SOCRATA_STATES[stateCode]) return SOCRATA_STATES[stateCode].color;
  const fs = FILED_STATES.find((s) => s.code === stateCode);
  return fs ? fs.color : 'blue';
}

export function getStateName(stateCode) {
  if (SOCRATA_STATES[stateCode]) return SOCRATA_STATES[stateCode].name;
  const fs = FILED_STATES.find((s) => s.code === stateCode);
  return fs ? fs.name : stateCode;
}

export function getStateEmoji(stateCode) {
  if (SOCRATA_STATES[stateCode]) return SOCRATA_STATES[stateCode].emoji;
  const fs = FILED_STATES.find((s) => s.code === stateCode);
  return fs ? fs.emoji : '🇺🇸';
}
