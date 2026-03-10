# StockNews

A real-time stock news aggregator built with Next.js. Search for any publicly traded company and get the latest news and live quotes, powered by the Finnhub API.

**Live at [https://shivesh.tech](https://shivesh.tech)**

## Features

- Search companies by name or ticker symbol
- Real-time stock quotes (price, change, open, high, low)
- Latest company news from multiple sources
- Auto-refreshes every 60 seconds
- Dark themed UI

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **API:** Finnhub (news + quotes)
- **Deployment:** Nginx reverse proxy + PM2 on a VPS

## Getting Started

### Prerequisites

- Node.js 18+
- A [Finnhub API key](https://finnhub.io/) (free tier available)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/shiveshrajnigam/stock-news.git
   cd stock-news
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   FINNHUB_API_KEY=your_api_key_here
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## API Routes

| Endpoint | Description |
|---|---|
| `GET /api/search?q=apple` | Search companies by name or ticker |
| `GET /api/news?symbol=AAPL` | Get latest news and quote for a stock |
