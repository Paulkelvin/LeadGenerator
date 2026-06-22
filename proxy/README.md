# Companies House API Proxy

Use this if the browser blocks direct API calls due to CORS.

## Setup

```bash
# From the project root
node proxy/server.js
# or with your API key:
CH_API_KEY=your_key_here node proxy/server.js
```

The proxy runs on `http://localhost:3001` by default.

## Switching the app to use the proxy

In `src/lib/companiesHouse.js`, change:

```js
const BASE_URL = 'https://api.company-information.service.gov.uk';
```

to:

```js
const BASE_URL = 'http://localhost:3001/api';
```

The proxy forwards all requests to the Companies House API with your API key
attached as HTTP Basic Auth. CORS headers are added so the browser accepts
the responses.

## Environment variables

| Variable    | Default | Description                  |
|-------------|---------|------------------------------|
| CH_API_KEY  | —       | Your Companies House API key |
| PORT        | 3001    | Port the proxy listens on    |
