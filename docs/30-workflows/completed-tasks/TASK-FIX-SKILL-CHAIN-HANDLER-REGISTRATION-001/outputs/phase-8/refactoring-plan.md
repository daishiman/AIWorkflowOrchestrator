# Phase 8: リファクタリング計画

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスク ID  | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase      | 8 - リファクタリング                          |
| 作成日     | 2026-03-03                                    |
| 前提成果物 | outputs/phase-5/implementation-summary.md     |

## 1. リファクタリング対象の評価

### 1.1 構造改善の必要性評価: **低（不要）**

今回の変更は `apps/desktop/src/main/ipc/index.ts` への `registerSkillChainHandlers()` 呼び出し追加のみ。

- 既存パターン（`registerSkillScheduleHandlers`, `registerSkillDocsHandlers`）と**同一構造**に従う
- 重複ロジックなし
- 新規の抽象化レイヤー導入は不要

### 1.2 命名改善の必要性評価: **なし**

| 対象               | 現状命名                     | 準拠規則            | 判定 |
| ------------------ | ---------------------------- | ------------------- | ---- |
| ハンドラ登録関数   | `registerSkillChainHandlers` | 既存命名規則に準拠  | OK   |
| IPC チャンネル定数 | `IPC_CHANNELS.SKILL_CHAIN_*` | 既存命名規則に準拠  | OK   |
| DI 対象クラス      | `SkillChainStore`            | PascalCase + 責務名 | OK   |
| DI 対象クラス      | `SkillChainExecutor`         | PascalCase + 責務名 | OK   |

### 1.3 コード重複の評価: **なし**

`registerAllIpcHandlers()` 内の各 `register*Handlers()` 呼び出しは、
それぞれ独立した IPC ドメインを管理しており、共通化の余地はない。

### 1.4 パフォーマンス改善の評価: **不要**

- ハンドラ登録はアプリ起動時に1回のみ実行
- ホットパスではないため最適化の必要なし

## 2. 結論

**今回の変更にリファクタリングは不要。**

既存パターンを忠実に踏襲する最小変更であり、以下の理由からリファクタリングを見送る:

1. 変更箇所が `index.ts` への1行追加 + DI オブジェクト生成のみ
2. 既存の `register*Handlers` パターンと完全に一致
3. 新たな技術的負債を導入していない
4. コードの可読性・保守性に悪影響がない

## 3. 将来的な改善候補（参考）

| #   | 候補                                                          | 優先度 | 備考                                                 |
| --- | ------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| 1   | `services/skill/index.ts` バレルファイルへの export 追加      | 低     | MINOR 指摘として Phase 10 で記録予定                 |
| 2   | register\*Handlers 群の自動発見機構（Convention over Config） | 低     | 現時点では過剰設計。ハンドラ数が増加した時点で再検討 |
