# Roxana

**Collaborative dialectic management platform**
React 18 · TypeScript · AWS Amplify · DynamoDB · AppSync

---

## What it is

Roxana is a serverless multi-user web application for managing philosophical and argumentative dialogues. Multiple users can simultaneously edit a shared set of propositions and draw inferential relationships between them — building a visual map of an argument that makes logical dependencies explicit and equivocations visible.

Named after a character in Timothy Williamson's *Tetralogue*, a philosophical dialogue about relativism and truth.

---

## Why it exists

Philosophical and legal arguments are often derailed by equivocation — the same term used in different senses at different points — or by participants talking past each other about which propositions are actually in dispute. Roxana makes the structure of a dialogue explicit and shared, so that evasions and inconsistencies become visible rather than hidden in the flow of natural language.

---

## Architecture

Roxana is fully serverless, deployed on AWS Amplify with DynamoDB as the primary store and AppSync for real-time GraphQL subscriptions.

**Concurrency**: Multiple users editing simultaneously is the central design challenge. Roxana uses optimistic concurrency control via DynamoDB condition expressions — each write carries the expected version, and conflicts trigger automatic retry-merge rather than silently overwriting. A serial Redux event queue prevents interleaved layout writes on the client side without requiring external coordination primitives.

**State model**: Voting state (which users accept which propositions) is serialized as a single atomic JSON blob per discussion revision, collapsing what would otherwise be N vote rows into a single write. This keeps the data model simple and the consistency guarantees strong.

**Irrational voter detection**: Roxana computes the set of users who have accepted all premise propositions in an argument but rejected the conclusion — a useful diagnostic for identifying where genuine disagreement lies versus where participants may be reasoning inconsistently.

---

## What it demonstrates

- Serverless architecture with real-time multi-user synchronization
- Optimistic concurrency control in a distributed setting
- Atomic state design to minimize write complexity and maximize consistency
- A domain model derived from formal logic applied to a collaborative UI

---

## Related projects

- [Dianoia](https://github.com/rvanegas/dianoia) — argument analysis backend
- [Noesis](https://github.com/rvanegas/noesis) — single-user argument evaluation tool
