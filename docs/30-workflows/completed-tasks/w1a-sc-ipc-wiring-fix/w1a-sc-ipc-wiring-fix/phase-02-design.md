# Phase 2: 設計

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 2                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

Phase 1 の調査結果を基に、`creatorHandlers.ts` と `skillCreatorHandlers.ts` の統合戦略（統合 or 責務明確化）を設計する。チャネル定数の一元管理設計を確立し、P65再発を構造的に防止するアーキテクチャを定義する。

## 実行タスク

1. 統合戦略の選択判断を行う（完全統合 vs 責務明確化の2案を比較）
   - 案A: `creatorHandlers.ts` を廃止し全ハンドラを `skillCreatorHandlers.ts` に統合
   - 案B: `creatorHandlers.ts` を internal helper として `skillCreatorHandlers.ts` から呼び出す
2. 選択した戦略に基づくファイル構成を設計する
3. `channels.ts` における定数の一元管理設計を行う（`creator:*` 定数の扱いを決定）
4. 全16チャネルの登録先ファイルと登録タイミングを明示した設計書を作成する
5. `registerSkillCreatorHandlers()` の引数型をインターフェース依存（DIP準拠）に設計する
6. P65再発防止のため「新 namespace 追加は設計レビュー必須」のルールを設計に組み込む

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-01-requirements.md`
- `.claude/rules/06-known-pitfalls.md#P65`
- `.claude/rules/06-known-pitfalls.md#P61`（DIP違反）
- `.claude/rules/04-electron-security.md#IPC セキュリティ原則`
- `.claude/rules/01-architecture.md#レイヤー依存方向`

## 成果物

- Phase 2 設計書（本ファイル）
- 統合戦略の選択根拠ドキュメント
- 16チャネルの登録先テーブル（設計）
- `channels.ts` 定数一元管理設計
- `registerSkillCreatorHandlers()` 関数シグネチャ設計

## 完了条件

- [ ] 統合戦略（A/Bいずれか）が選択され、根拠が記載されている
- [ ] 全16チャネルの登録先ファイルが設計書に明示されている
- [ ] `channels.ts` の定数管理方針が決定されている
- [ ] DIP準拠の関数シグネチャが設計されている
- [ ] P65再発防止のガードレール設計が記載されている

## 次のPhase

Phase 3: 設計レビュー
