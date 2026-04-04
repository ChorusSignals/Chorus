<div align="center">

# Chorus

**Smart money consensus tracker for Solana.**
Watches 8 curated high-performing wallets. When 3+ agree on a direction, Claude tells you what they're positioning for and why.

[![Build](https://img.shields.io/github/actions/workflow/status/ChorusSignals/Chorus/ci.yml?branch=main&style=flat-square&label=Build)](https://github.com/ChorusSignals/Chorus/actions)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-2dd4bf?style=flat-square)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)

</div>

---

Individual wallets are noise. Multiple wallets moving in the same direction at the same time — that's signal. `Chorus` tracks market makers, protocol teams, and proven traders on-chain, weights their moves by track record, and runs consensus scoring every minute. When the signal is strong enough, Claude breaks it down: what are they buying, what's the likely thesis, and what would change it.

```
FETCH → WEIGHT → SCORE → ANALYZE → SIGNAL
```

---

## Consensus Signal Map

![Chorus Consensus](assets/preview-consensus.svg)

---

## Signal Feed

![Chorus Feed](assets/preview-signals.svg)

---

## Wallet Tiers

| Tier | Weight | Examples |
|------|--------|---------|
| **Tier 1** | 3x | Market makers, known funds |
| **Tier 2** | 2x | Protocol teams, large LPs |
| **Tier 3** | 1x | Verified alpha traders |

Consensus score = weighted agreement / total weight. Minimum 3 wallets required.

---

## Quick Start

```bash
git clone https://github.com/ChorusSignals/Chorus
cd Chorus && bun install
cp .env.example .env
bun run dev
```

---

## License

MIT

---

*when they move together, listen.*
