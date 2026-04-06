# TASK-P0-07: hardcoded-agent-names-dynamic-resolution

## 概要

SkillCreatorWorkflowEngine 及び関連ファイルにハードコードされたエージェント名（`AGENT_NAMES` 定数等）を、ManifestLoader 経由でスキルマニフェストから動的に解決する仕組みに置き換える。これにより、異なるスキル定義が独自のエージェント構成を指定できるようになり、skill-creator の汎用性が向上する。

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-P0-07                                             |
| タスク種別 | リファクタリング / 機能追加                            |
| 優先度     | P0 (High)                                              |
| ステータス | spec_created                                           |
| 上流ゲート | なし                                                   |
| 依存タスク | TASK-P0-03 (manifest 配置), TASK-P0-04 (loader 有効化) |
| 後続タスク | なし                                                   |
| 作成日     | 2026-03-29                                             |
| 更新日     | 2026-03-29                                             |

## 受入基準

| ID   | 基準                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| AC-1 | ハードコードされたエージェント名の参照が全て動的解決に置き換えられている       |
| AC-2 | ManifestLoader がスキルマニフェストからエージェント構成を読み込み提供する      |
| AC-3 | マニフェストにエージェント構成が未定義の場合、デフォルト値にフォールバックする |
| AC-4 | 異なるエージェント構成を持つスキル定義を読み込んだ際に正しく動作する           |
| AC-5 | 既存テストが pass する（後方互換性維持）                                       |
| AC-6 | エージェント名解決のユニットテストが全パターンを網羅する                       |

## スコープ

**含む**:

- ハードコードされたエージェント名の全箇所特定
- 動的エージェント名解決メカニズムの作成（`AgentNameResolver` または同等機能）
- ManifestLoader へのエージェント構成読み込み機能追加
- SkillCreatorWorkflowEngine のエージェント名参照を動的解決に変更
- デフォルト値によるフォールバック機構
- ユニットテスト

**含まない**:

- ManifestLoader のコア読み込みロジック変更（TASK-P0-04 の責務）
- マニフェストファイルの配置変更（TASK-P0-03 の責務）
- スキル定義のスキーマ変更
- UI への影響（エージェント名は内部実装の詳細）

## 依存関係

| 種別       | 参照先                           | 役割                              |
| ---------- | -------------------------------- | --------------------------------- |
| upstream   | TASK-P0-03                       | マニフェストの本番配置            |
| upstream   | TASK-P0-04                       | ManifestLoader のデフォルト有効化 |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件                 |
| downstream | なし                             |                                   |

## 現行コードアンカー

| ファイル                                                               | 現状の役割                                    | TASK-P0-07 での扱い                        |
| ---------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | ハードコードされたエージェント名を使用        | 動的解決に置き換え                         |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`             | マニフェスト読み込み（SHA256 キャッシュ付き） | エージェント構成の読み込み機能を追加       |
| `.claude/skills/skill-creator/`                                        | スキル定義（エージェント構成のソース）        | エージェント構成を定義するセクションを参照 |
| `packages/shared/src/types/skillCreator.ts`                            | 型定義                                        | エージェント構成の型を追加                 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | ハードコードされたエージェント名がスキル定義の汎用性を阻害している問題を、マニフェストからの動的解決で解消すること |
| 依存関係・責務境界   | ManifestLoader がデータ提供、SkillCreatorWorkflowEngine が消費者。解決ロジックは独立したユーティリティとして分離   |
| 価値とコストの不均衡 | 変更箇所は限定的だが、将来の拡張性に大きく寄与する。フォールバック機構により既存動作への影響を最小化               |
| 改善優先順位         | 1. ハードコード箇所の特定 2. 型定義 3. 解決メカニズム 4. ManifestLoader 拡張 5. WorkflowEngine 置換 6. テスト      |
| 4条件評価            | 価値性: 高（拡張性直結）/ 実現性: 高（限定的変更）/ 整合性: ManifestLoader 拡張 / 運用性: フォールバックで安全     |

## ディレクトリ構成

```text
step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## 実装者向けクイックガイド

### 着手条件

- TASK-P0-03 と TASK-P0-04 が完了し ManifestLoader が本番稼働している
- `SkillCreatorWorkflowEngine.ts` のエージェント名参照箇所を読了している
- `ManifestLoader.ts` の読み込みフローを把握している
- `.claude/skills/skill-creator/` のスキル定義構造を把握している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — エージェント名参照を動的解決に変更
- `apps/desktop/src/main/services/runtime/ManifestLoader.ts` — エージェント構成読み込み追加
- `packages/shared/src/types/skillCreator.ts` — エージェント構成の型追加
- テストファイル — 動的解決とフォールバックのテスト追加

### 非対象

- ManifestLoader のコアロジック変更
- マニフェスト配置変更
- UI への変更
- スキル定義スキーマの破壊的変更

### 完了イメージ

- `AGENT_NAMES` 等のハードコード定数が削除され、`manifest.agentConfig` から動的に取得される
- マニフェストに `agentConfig` が未定義の場合、従来と同じデフォルト値が使われる
- 異なるスキル定義で異なるエージェント名を指定でき、正しく動作する
- 全既存テストが pass する

### 並列実行メモ

- TASK-P0-07 は TASK-P0-03 / TASK-P0-04 完了後に着手
- `SkillCreatorWorkflowEngine.ts` の編集は TASK-P0-01 / TASK-P0-02 と競合する可能性あり
- `ManifestLoader.ts` の編集は TASK-P0-04 と競合するため逐次実行

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
