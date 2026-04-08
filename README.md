# Chorus

Cohort-consensus tracker for smart-money behavior on Solana.

See when smart money is actually aligned instead of just noisy in one pocket.

`bun run dev`

- watches makers, funds, teams, and traders as separate cohorts
- ignores one-cohort inventory skew that looks bigger than it is
- promotes tokens where multiple cohorts agree on direction at the same time

[![Build](https://img.shields.io/github/actions/workflow/status/ChorusSignals/Chorus/ci.yml?branch=master&style=flat-square&label=Build)](https://github.com/ChorusSignals/Chorus/actions)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

Consensus Board • Signal Feed • Operating Surfaces • Cohort Separation • Consensus States • Technical Spec • Quick Start

## Consensus Board

![Chorus consensus map](assets/preview-consensus.svg)

## Signal Feed

![Chorus signal feed](assets/preview-signals.svg)

## Operating Surfaces

- `Consensus Board`: shows whether conviction is broad or isolated to one cohort
- `Signal Feed`: prints the actual names climbing the alignment stack
- `Cohort Weighting`: ranks makers, funds, teams, and traders separately before blending
- `Agreement Score`: converts wallet activity into a usable conviction state

## Why Wallet Tracking Usually Breaks Down

Most wallet dashboards collapse all "smart money" into one stream. That looks useful until a single cohort dominates the tape and the board starts pretending there is broad agreement when there is not.

Chorus avoids that mistake on purpose. It keeps funds, makers, teams, and traders separated long enough for the operator to see whether conviction is actually spreading or only echoing within one group.

## Why Cohorts Stay Separate

Chorus does not believe that "smart money" is one thing. Funds, makers, teams, and fast traders all behave differently, and collapsing them into one blended wallet list hides that difference.

A maker leaning on inventory is not the same as broad cross-cohort agreement. Chorus exists to keep those cases separate until the market actually lines up.

## Consensus States

The board is easier to use when the operator can name the state:

- `isolated`: one cohort is moving, everyone else is absent
- `building`: two cohorts are starting to agree
- `broad`: multiple cohorts are aligned on the same name and direction
- `crowded`: agreement exists, but the move is too late to treat cleanly

## What The Operator Learns From Chorus

The board is trying to answer three practical questions:

- who moved first
- who confirmed the move after that
- whether the agreement is becoming broader or only louder

That is much more useful than a flat list of wallet buys.

## Technical Spec

Chorus computes agreement in two layers:

### Tier Weight

`tier1 = 3`

`tier2 = 2`

`tier3 = 1`

### Cohort Bonus

`market_maker = 1.2`

`fund = 1.1`

`team = 1.0`

`trader = 0.9`

### Consensus Score

`consensusScore = agreeingWeight / totalTrackedWeight`

Signals strengthen when multiple cohorts align. A single cohort can still be useful, but broad cross-cohort agreement is treated as the higher-conviction state.

## When Chorus Should Demote A Signal

- only one cohort is active and everyone else is absent
- agreement exists, but comes too late after the move is obvious
- the same small cluster keeps appearing without broader confirmation
- team or maker activity looks more like inventory management than conviction

## Why Chorus Works On Busy Days

Wallet tracking becomes unreadable when every feed just dumps buys and sells into one stream. Chorus keeps the interpretation layer intact.

That means the operator can tell the difference between real agreement and one noisy wallet pocket dragging attention around.

## Quick Start

```bash
git clone https://github.com/ChorusSignals/Chorus
cd Chorus
npm install
cp .env.example .env
npm run dev
```

## Local Audit Docs

- [Commit sequence](docs/commit-sequence.md)
- [Issue drafts](docs/issue-drafts.md)

## Support Docs

- [Runbook](docs/runbook.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

MIT
