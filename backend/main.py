from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random
import hashlib

app = FastAPI(
    title="ERC-8004 Risk Underwriter API",
    description="AI-powered DeFi risk underwriting engine for ERC-8004 compliant protocols",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROTOCOLS = [
    {
        "id": "aave-v3",
        "name": "Aave V3",
        "category": "Lending",
        "tvl": "$8.2B",
        "risk_rating": "A",
        "risk_score": 18,
        "audits": 7,
        "age_days": 820,
        "description": "Decentralized liquidity protocol with battle-tested smart contracts.",
        "color": "#B6509E",
    },
    {
        "id": "uniswap-v3",
        "name": "Uniswap V3",
        "category": "DEX",
        "tvl": "$4.1B",
        "risk_rating": "A",
        "risk_score": 15,
        "audits": 9,
        "age_days": 1050,
        "description": "Concentrated liquidity AMM — the gold standard for on-chain trading.",
        "color": "#FF007A",
    },
    {
        "id": "compound-v3",
        "name": "Compound V3",
        "category": "Lending",
        "tvl": "$1.9B",
        "risk_rating": "A-",
        "risk_score": 22,
        "audits": 6,
        "age_days": 750,
        "description": "Interest-rate protocol with isolated collateral markets.",
        "color": "#00D395",
    },
    {
        "id": "curve-finance",
        "name": "Curve Finance",
        "category": "DEX / Stableswap",
        "tvl": "$2.4B",
        "risk_rating": "B+",
        "risk_score": 31,
        "audits": 5,
        "age_days": 1400,
        "description": "Stablecoin-optimized AMM with deep liquidity pools.",
        "color": "#FF0000",
    },
    {
        "id": "lido",
        "name": "Lido Finance",
        "category": "Liquid Staking",
        "tvl": "$24.1B",
        "risk_rating": "B+",
        "risk_score": 28,
        "audits": 8,
        "age_days": 1100,
        "description": "Liquid staking solution for ETH with stETH token.",
        "color": "#00A3FF",
    },
    {
        "id": "makerdao",
        "name": "MakerDAO / Sky",
        "category": "CDP / Stablecoin",
        "tvl": "$5.3B",
        "risk_rating": "A-",
        "risk_score": 24,
        "audits": 12,
        "age_days": 2200,
        "description": "Decentralized credit system backing the DAI stablecoin.",
        "color": "#F4B731",
    },
    {
        "id": "pendle",
        "name": "Pendle Finance",
        "category": "Yield Trading",
        "tvl": "$680M",
        "risk_rating": "B",
        "risk_score": 44,
        "audits": 4,
        "age_days": 420,
        "description": "Tokenized yield protocol enabling fixed and variable rate strategies.",
        "color": "#6C86AD",
    },
    {
        "id": "eigenlayer",
        "name": "EigenLayer",
        "category": "Restaking",
        "tvl": "$11.2B",
        "risk_rating": "B-",
        "risk_score": 58,
        "audits": 3,
        "age_days": 280,
        "description": "Restaking protocol introducing novel slashing and AVS risk vectors.",
        "color": "#8B5CF6",
    },
    {
        "id": "gmx-v2",
        "name": "GMX V2",
        "category": "Perp DEX",
        "tvl": "$520M",
        "risk_rating": "B",
        "risk_score": 47,
        "audits": 4,
        "age_days": 390,
        "description": "Decentralized perpetuals exchange on Arbitrum and Avalanche.",
        "color": "#2D42FC",
    },
    {
        "id": "morpho",
        "name": "Morpho Blue",
        "category": "Lending",
        "tvl": "$1.1B",
        "risk_rating": "B+",
        "risk_score": 33,
        "audits": 5,
        "age_days": 310,
        "description": "Permissionless lending primitive with isolated risk markets.",
        "color": "#9BDBF9",
    },
]

MOCK_POSITIONS = {
    "aave-v3": {"supplied": True, "borrowed": True},
    "uniswap-v3": {"lp": True},
    "lido": {"staked": True},
    "eigenlayer": {"restaked": True},
    "curve-finance": {"lp": True},
}


def deterministic_risk(wallet: str) -> int:
    """Generate a deterministic but realistic risk score from wallet address."""
    h = int(hashlib.sha256(wallet.lower().encode()).hexdigest(), 16)
    base = 25 + (h % 55)  # 25-79
    return base


def generate_exposure(wallet: str):
    h = int(hashlib.sha256(wallet.lower().encode()).hexdigest(), 16)
    random.seed(h)

    selected = random.sample(PROTOCOLS, k=random.randint(3, 6))
    total_value = round(random.uniform(8000, 450000), 2)

    exposures = []
    remaining = 100.0
    for i, p in enumerate(selected):
        if i == len(selected) - 1:
            pct = round(remaining, 1)
        else:
            pct = round(random.uniform(5, remaining - (len(selected) - i - 1) * 5), 1)
            remaining -= pct
        value = round(total_value * pct / 100, 2)
        exposures.append(
            {
                "protocol_id": p["id"],
                "protocol_name": p["name"],
                "category": p["category"],
                "allocation_pct": pct,
                "value_usd": value,
                "risk_rating": p["risk_rating"],
                "risk_score": p["risk_score"],
                "position_type": random.choice(["Supply", "LP", "Staked", "Borrow", "Restaked"]),
            }
        )

    return exposures, total_value


def generate_recommendations(risk_score: int, exposures: list) -> list:
    recs = []

    high_risk = [e for e in exposures if e["risk_score"] > 45]
    if high_risk:
        names = ", ".join(e["protocol_name"] for e in high_risk)
        recs.append(
            {
                "severity": "high",
                "icon": "⚠️",
                "title": "High-Risk Protocol Exposure",
                "detail": f"Positions in {names} carry elevated smart-contract and liquidity risk. Consider reducing allocation or hedging.",
            }
        )

    if risk_score > 60:
        recs.append(
            {
                "severity": "high",
                "icon": "🔴",
                "title": "Portfolio Risk Exceeds Threshold",
                "detail": "Overall risk score is in the danger zone. Rebalancing toward audited, battle-tested protocols is strongly advised.",
            }
        )
    elif risk_score > 40:
        recs.append(
            {
                "severity": "medium",
                "icon": "🟡",
                "title": "Moderate Concentration Risk",
                "detail": "Portfolio shows moderate risk. Diversifying across more protocol categories can smooth tail-risk exposure.",
            }
        )
    else:
        recs.append(
            {
                "severity": "low",
                "icon": "✅",
                "title": "Well-Diversified Portfolio",
                "detail": "Risk profile is healthy. Continue monitoring for protocol upgrades and governance changes.",
            }
        )

    lending = [e for e in exposures if e["category"] == "Lending"]
    if lending:
        recs.append(
            {
                "severity": "info",
                "icon": "💡",
                "title": "Liquidation Risk Monitor",
                "detail": "Active lending positions detected. Ensure health factors remain above 1.5x to avoid liquidation during volatility spikes.",
            }
        )

    recs.append(
        {
            "severity": "info",
            "icon": "🛡️",
            "title": "ERC-8004 Coverage Available",
            "detail": "This portfolio is eligible for ERC-8004 on-chain insurance underwriting. Estimated premium: 0.8% APY for full coverage.",
        }
    )

    return recs


class WalletRequest(BaseModel):
    wallet_address: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "erc8004-risk-underwriter", "mock_mode": True}


@app.get("/protocols")
def get_protocols():
    return {
        "count": len(PROTOCOLS),
        "protocols": PROTOCOLS,
    }


@app.post("/analyze-wallet")
def analyze_wallet(req: WalletRequest):
    wallet = req.wallet_address.strip()
    if not wallet:
        raise HTTPException(status_code=400, detail="wallet_address is required")

    if not (wallet.startswith("0x") and len(wallet) == 42):
        raise HTTPException(
            status_code=400,
            detail="Invalid Ethereum wallet address. Must be 0x-prefixed 42-character hex string.",
        )

    risk_score = deterministic_risk(wallet)
    exposures, total_value = generate_exposure(wallet)
    recommendations = generate_recommendations(risk_score, exposures)

    if risk_score <= 30:
        risk_label = "Low Risk"
        risk_color = "green"
    elif risk_score <= 55:
        risk_label = "Medium Risk"
        risk_color = "yellow"
    else:
        risk_label = "High Risk"
        risk_color = "red"

    weighted_risk = sum(
        e["risk_score"] * e["allocation_pct"] / 100 for e in exposures
    )

    return {
        "wallet_address": wallet,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "risk_color": risk_color,
        "weighted_protocol_risk": round(weighted_risk, 2),
        "total_value_usd": total_value,
        "protocol_count": len(exposures),
        "exposures": exposures,
        "recommendations": recommendations,
        "erc8004_eligible": True,
        "underwriting_premium_bps": max(10, risk_score * 2),
        "mock_mode": True,
        "disclaimer": "Mock data for demo purposes. Not financial advice.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
