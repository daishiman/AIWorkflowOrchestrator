# TASK-P0-07: hardcoded-agent-names-dynamic-resolution

## 概要

RuntimeSkillCreatorFacade 及び関連ファイルにハードコードされたエージェント名参照（`AGENT_NAMES` 定数等）を、ManifestLoader で読み込んだ `workflow-manifest.json` の `resources` と fallback path の `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` を source of truth として動的に解決する仕組みに置き換える。これにより、異なるスキル定義が独自のエージェント構成を指定できるようになり、skill-creator の汎用性が向上する。

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-P0-07                                             |
| タスク種別 | リファクタリング / 機能追加                            |
| 優先度     | P0 (High)                                              |
| ステータス | spec_created（Phase 1-12 complete / Phase 13 blocked） |
| 上流ゲート | なし                                                   |
| 依存タスク | TASK-P0-03 (manifest 配置), TASK-P0-04 (loader 有効化) |
| 後続タスク | なし                                                   |
| 作成日     | 2026-03-29                                             |
| 更新日     | 2026-04-06                                             |

## 受入基準

| ID   | 基準                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | ハードコードされたエージェント名の参照が全て動的解決に置き換えられている                                                     |
| AC-2 | ManifestLoader が `workflow-manifest.json` の resources を読み込み、agent resource を提供できる                              |
| AC-3 | manifest resource が未定義/参照不可の場合、`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` のフォールバックが機能する |
| AC-4 | 異なる manifest resource 構成（agent resource の差分）を持つスキル定義で正しく動作する                                       |
| AC-5 | 既存テストが pass する（後方互換性維持）                                                                                     |
| AC-6 | エージェント名解決のユニットテストが全パターンを網羅する                                                                     |

## スコープ

**含む**:

- ハードコードされたエージェント名の全箇所特定
- 動的エージェント名解決メカニズムの作成（`AgentNameResolver` または同等機能）
- ManifestLoader が読み込む resource descriptor を利用して agent resource を解決
- RuntimeSkillCreatorFacade のエージェント名参照を動的解決に変更
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

| ファイル                                                               | 現状の役割                                            | TASK-P0-07 での扱い                |
| ---------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | plan/execute/improve の resource 解決と fallback 制御 | 動的解決の主経路に置き換え         |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`             | workflow-manifest.json の読み込みと検証               | resources から構成を取得           |
| `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts` | root 候補と provenance の解決                         | 動的 root 収集の責務を担う         |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`        | plan 用 resource request 定義                         | fallback path の source of truth   |
| `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`     | improve 用 resource request 定義                      | fallback path の source of truth   |
| `packages/shared/src/types/skillCreator.ts`                            | 型定義                                                | manifest / provenance 関連型を保持 |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | ハードコードされたエージェント名がスキル定義の汎用性を阻害している問題を、マニフェストからの動的解決で解消すること       |
| 依存関係・責務境界   | ManifestLoader がデータ提供、RuntimeSkillCreatorFacade が消費者。解決ロジックは独立したユーティリティとして分離          |
| 価値とコストの不均衡 | 変更箇所は限定的だが、将来の拡張性に大きく寄与する。フォールバック機構により既存動作への影響を最小化                     |
| 改善優先順位         | 1. ハードコード箇所の特定 2. 型定義 3. 解決メカニズム 4. ManifestLoader 拡張 5. RuntimeSkillCreatorFacade 置換 6. テスト |
| 4条件評価            | 価値性: 高（拡張性直結）/ 実現性: 高（限定的変更）/ 整合性: ManifestLoader 拡張 / 運用性: フォールバックで安全           |

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
- `RuntimeSkillCreatorFacade.ts` のエージェント名参照箇所を読了している
- `ManifestLoader.ts` の読み込みフローを把握している
- `.claude/skills/skill-creator/` のスキル定義構造を把握している

### 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — fallback path で `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` を利用
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts` — agent resource の単一ソースを `PLAN_RESOURCE_REQUESTS` に固定
- `apps/desktop/src/main/services/runtime/improvePromptConstants.ts` — improve の agent resource を `IMPROVE_RESOURCE_REQUESTS` に固定
- テストファイル — 動的解決とフォールバックのテスト追加

### 非対象

- ManifestLoader のコアロジック変更
- マニフェスト配置変更
- UI への変更
- スキル定義スキーマの破壊的変更

### 完了イメージ

- `AGENT_NAMES` 等のハードコード定数が削除され、`workflow-manifest.json` の `resources` と fallback path の `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` から動的に取得される
- manifest の agent resource が未定義/参照不可の場合、従来と同じ default resource set が使われる
- 異なるスキル定義で異なるエージェント名を指定でき、正しく動作する
- 全既存テストが pass する

### 並列実行メモ

- TASK-P0-07 は TASK-P0-03 / TASK-P0-04 完了後に着手
- `RuntimeSkillCreatorFacade.ts` の編集は TASK-P0-01 / TASK-P0-02 と競合する可能性あり
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
