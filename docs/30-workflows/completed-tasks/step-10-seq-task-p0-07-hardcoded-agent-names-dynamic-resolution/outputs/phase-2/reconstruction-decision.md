# reconstruction-decision.md — Phase 2 成果物

## 判断: 再構成（patch ではなく）

### 理由

`AGENT_NAMES = ["discover-problem", "design-workflow", "plan-structure"]` は
`PLAN_RESOURCE_REQUESTS.filter(r => r.kind === "agent").map(r => r.id)` と
完全に同一のデータ。定数を維持する正当性がない。

### 採用案

**単一源泉化**: `PLAN_RESOURCE_REQUESTS` を唯一の agent 名源とし、
`AgentNameResolver.resolveFromRequests(PLAN_RESOURCE_REQUESTS)` で導出する。

`IMPROVE_RESOURCE_REQUESTS` に対しても同様の処理を適用。

### 不採用案

- patch（`AGENT_NAMES` を残しつつ `resolveFromRequests` も追加）: 重複が増えるため却下
- manifest に `agentConfig` フィールドを新設: スキーマ変更が scope 外のため却下
