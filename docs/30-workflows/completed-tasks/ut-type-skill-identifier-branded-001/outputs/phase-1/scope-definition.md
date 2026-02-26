# Phase 1 スコープ定義

## 対象（In Scope）

- `packages/shared/src/types/skill.ts` の `SkillId` / `SkillName` / 変換関数追加。
- `Skill`・関連型の `id` / `name` の型適用。
- `SkillImportDialog`・`AgentView`・`agentSlice`・`preload skill-api`・`main skillHandlers` の型シグネチャ適用。
- 型安全性テスト（ID/Name取り違え検出）追加。

## 非対象（Out of Scope）

- IPCチャンネル名・命名体系の再設計。
- SkillService/SkillImportManagerの内部アルゴリズム変更。
- 既存UI/UX仕様変更。
- 未関連機能（RAG/Graph/Authなど）の型変更。

## 成果判定

- コンパイル時にID/Name取り違えを検出可能であること。
- 既存のインポート成功/失敗挙動を維持すること。
- 参照仕様（interfaces-agent-sdk-skill / api-ipc-agent / security-skill-ipc）と矛盾しないこと。
