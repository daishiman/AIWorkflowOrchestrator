# Phase 1 成果物: 要件定義書

## タスク情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001 |
| タスク種別 | docs-only                                             |
| 作成日     | 2026-04-11                                            |

## 機能要件

### FR-01: AC-4定義へのフィールド独立推論性の明示

task-specification-creator スキルの「よくある漏れ」テーブル（[Feedback FB-03]エントリ）および  
フォールバック仕様のテンプレート部分に、フィールド間独立推論性を明示した補足を追記する。

**対象ファイル**: `.claude/skills/task-specification-creator/SKILL.md`

**追記内容**:

- `purpose` は `tool` / `timing` を駆動する
- `category` は `format` を駆動する
- 各フィールドは独立して推論される（連鎖nullにならない）

### FR-02: フォールバック仕様書テンプレートへの独立性記述追加

`phase-template-execution.md`（Phase 4-10テンプレート）のSmartDefaultテスト設計セクションに  
「フィールド間独立性」の専用補足を追加する。

**対象ファイル**: `.claude/skills/task-specification-creator/references/phase-template-execution.md`

### FR-03: 仕様揺れ検出テストケースの追加

SmartDefaultテストファイルに TC-FB03-01〜09 の9件のテストケースを追加する。

**対象ファイル**: `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts`

## 非機能要件

### NFR-01: docs-only原則の厳守

コード実装（`smartDefaultReasoningService.ts`）への変更は行わない。  
ドキュメント（SKILL.md、テンプレート）とテストケース追加のみ。

### NFR-02: 既存テスト回帰ゼロ

TC-FB03-XX の追加後、既存33件のテストが全件PASS であること。

### NFR-03: 整合性の保証

追加されるフィールド独立推論性の定義が、既存の実装・テスト・仕様書と矛盾しないこと。

## スコープ確認

| 項目                                           | 含む | 除く |
| ---------------------------------------------- | ---- | ---- |
| SKILL.md の FB-03 補足強化                     | ✅   |      |
| phase-template-execution.md への追記           | ✅   |      |
| テストケース TC-FB03-01〜09 追加               | ✅   |      |
| `smartDefaultReasoningService.ts` のコード変更 |      | ✅   |
| UIコンポーネントの変更                         |      | ✅   |
| コミット・PR作成                               |      | ✅   |
