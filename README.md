# ERC-8004 On-Chain AI Risk Underwriter

> **LabLab AI Hackathon 2026 — $50K USDC Prize**  
> AI-powered DeFi risk analysis using the ERC-8004 standard

## Overview

An intelligent risk underwriting system for DeFi protocols and wallet positions. Uses AI agents (Claude) to analyze on-chain exposure, protocol risk factors, and provide actionable risk assessments.

## Features

- 🔍 **Wallet Risk Analyzer** — Analyze any wallet's DeFi positions with AI risk scoring
- 📊 **Protocol Explorer** — Deep risk analysis for 8+ major DeFi protocols
- 🤖 **AI Risk Engine** — Claude-powered risk assessment with structured output
- 📈 **Risk Scoring** — 0-100 risk scores with category breakdowns
- ⚡ **Real-time Analysis** — Instant protocol and wallet risk reports

## Tech Stack

- **Backend**: FastAPI + Python + Anthropic Claude
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Standard**: ERC-8004 (AI Agent Risk Underwriting)
- **Deploy**: Vercel (both frontend and backend)

## Architecture

```
┌─────────────────┐     ┌──────────────────────────┐
│   Next.js 14    │────▶│   FastAPI Backend         │
│   Frontend      │     │   /health                 │
│   - Wallet UI   │     │   /protocols              │
│   - Protocol UI │     │   /analyze-wallet         │
└─────────────────┘     │   /analyze-protocol       │
                        └──────────────────────────┘
                                    │
                        ┌──────────────────────────┐
                        │   Anthropic Claude        │
                        │   (claude-3-5-haiku)      │
                        └──────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/protocols` | List all tracked protocols |
| GET | `/protocols/{id}` | Get protocol details |
| POST | `/analyze-wallet` | Analyze wallet risk profile |
| POST | `/analyze-protocol` | Deep protocol risk analysis |

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
ANTHROPIC_API_KEY=your_key uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## ERC-8004 Standard

This project implements the ERC-8004 standard for on-chain AI agent risk underwriting, enabling:
- Standardized risk scoring interfaces
- Protocol risk metadata
- Wallet exposure analysis
- AI-powered underwriting decisions

## Built For

[LabLab AI Hackathon 2026](https://lablab.ai) — ERC-8004 Track — $50,000 USDC Prize Pool
