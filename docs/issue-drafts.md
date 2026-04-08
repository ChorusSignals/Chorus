# Issue Drafts

## Issue 1

Title: `Consensus should penalize same-cohort clustering harder`

Body:
Three market makers leaning the same way is useful, but it is still one slice of the market. The current cohort count is surfaced, but not yet used strongly enough in the final score. We should add a clustering penalty.

## Issue 2

Title: `Need hold-state transitions when cohorts stop adding but do not reverse`

Body:
Right now Chorus is biased toward buy or sell snapshots. In practice the highest-value signal is sometimes that funds stop buying while makers keep inventory balanced. We need an explicit hold / fade transition model.

Backlog note: both issues should be replayed on mixed-cohort rotations before changing live thresholds.
