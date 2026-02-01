# E2Eフィクスチャ サブリソース型拡充 - タスク指示書

## メタ情報

```yaml
issue_number: 630
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-imp-e2e-fixture-subresource-expansion-001  |
| タスク名     | E2Eフィクスチャ サブリソース型拡充              |
| 分類         | 改善                                            |
| 対象機能     | SkillScanner E2Eテストフィクスチャ              |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | システム仕様書Gap分析（quality-e2e-testing.md） |
| 発見日       | 2026-02-01                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8C-Eで作成されたE2Eテストフィクスチャは、SkillScannerの基本的なパースフローを検証するために3種類のスキル（完全構成・最小構成・無効構成）を提供している。しかし、`ScannedSkillMetadata`型が定義する6種類のサブリソース型（agents, references, scripts, assets, schemas, indexes）のうち、実際にフィクスチャでテストされているのは2種類（agents, references）のみである。

### 1.2 問題点・課題

| サブリソース型 | E2Eフィクスチャ | ユニットテスト | E2Eカバレッジ状況 |
| -------------- | --------------- | -------------- | ----------------- |
| agents         | test-agent.md   | あり           | カバー済み        |
| references     | test-ref.md     | あり           | カバー済み        |
| scripts        | なし            | あり           | **未カバー**      |
| assets         | なし            | あり           | **未カバー**      |
| schemas        | なし            | あり           | **未カバー**      |
| indexes        | なし            | あり           | **未カバー**      |

現在のE2Eテスト（TASK-8C-B/C/D）は、scripts/assets/schemas/indexesサブリソースを持つスキルのインポート・表示・権限確認を検証できない状態にある。

### 1.3 放置した場合の影響

- TASK-8C-B（スキル選択E2E）でサブリソース一覧表示の完全性を検証できない
- TASK-8C-C（インポート実行E2E）でscripts/assets/schemas/indexesのインポートフローが未テストとなる
- SkillScannerのサブリソースパースにリグレッションが発生しても、E2Eテストで検出できない
- 将来のスキルテンプレートがscripts/schemasを利用する際、E2Eフィクスチャの追加が必要になり開発遅延のリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

E2Eテストフィクスチャの`test-skill`を拡張し、SkillScannerがサポートする全6種類のサブリソース型を含む完全構成スキルを提供する。

### 2.2 最終ゴール

- `test-skill/`フィクスチャが6種類すべてのサブリソースディレクトリを持つ
- `skills.fixture.test.ts`に新サブリソースの検証テストケースが追加されている
- 既存29テストケースが引き続きPASS
- `quality-e2e-testing.md`のフィクスチャ仕様が更新されている

### 2.3 スコープ

#### 含むもの

- `test-skill/scripts/test-script.md`の作成
- `test-skill/assets/test-asset.md`の作成
- `test-skill/schemas/test-schema.md`の作成
- `test-skill/indexes/test-index.md`の作成
- `skills.fixture.test.ts`へのテストケース追加（scripts/assets/schemas/indexes各1件以上）
- `quality-e2e-testing.md`のフィクスチャ仕様テーブル更新

#### 含まないもの

- `another-skill/`（最小構成）へのサブリソース追加
- `invalid-skill/`の変更
- SkillScannerのコード変更
- TASK-8C-B/C/Dのテストコード（それらは独立タスク）

### 2.4 成果物

| 成果物           | パス                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| test-script.md   | `src/__tests__/__fixtures__/skills/test-skill/scripts/`                    |
| test-asset.md    | `src/__tests__/__fixtures__/skills/test-skill/assets/`                     |
| test-schema.md   | `src/__tests__/__fixtures__/skills/test-skill/schemas/`                    |
| test-index.md    | `src/__tests__/__fixtures__/skills/test-skill/indexes/`                    |
| テストケース追加 | `src/__tests__/fixtures/skills.fixture.test.ts`                            |
| 仕様書更新       | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8C-Eが完了していること（29テスト全PASS）
- SkillScannerの`scanSkillSubResources()`がscripts/assets/schemas/indexesをパース可能であること（ユニットテストで検証済み）

### 3.2 依存タスク

| タスク    | 内容                      | 状態 |
| --------- | ------------------------- | ---- |
| TASK-8C-E | E2Eテストフィクスチャ作成 | 完了 |
| TASK-2A   | SkillScanner実装          | 完了 |

### 3.3 必要な知識

- SkillScannerの`scanSkillSubResources()`のパースロジック（`arch-electron-services.md` 参照）
- `ScannedSkillMetadata`の`SkillSubResource[]`型構造（`interfaces-agent-sdk-skill.md` 参照）
- 既存フィクスチャのMarkdownフォーマット（`test-agent.md`、`test-ref.md`を参考）

### 3.4 推奨アプローチ

1. 既存の`test-agent.md`/`test-ref.md`の構造を参考にして4つの新フィクスチャファイルを作成
2. 各ファイルは`# タイトル`見出しで始め、SkillScannerの説明抽出ロジック互換にする
3. TDDアプローチ: テストを先に書き（Red）、フィクスチャを作成（Green）
4. 既存テスト29件が壊れないことを確認

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                                        |
| ----- | ---------------- | ------------------------------------------- |
| 1     | テスト作成       | 新サブリソース検証テストケースを追加（Red） |
| 2     | フィクスチャ作成 | 4つのサブリソースファイルを作成（Green）    |
| 3     | 品質確認         | 全テストPASS確認、ESLint、仕様書更新        |

### Phase 1: テスト作成（Red）

#### 目的

新サブリソースの期待値を定義するテストケースを追加

#### 手順

1. `skills.fixture.test.ts`を開く
2. `SkillScanner Fixture Integration` describeブロックに以下を追加:
   - `test-skill のscriptsが1件`
   - `script filenameがtest-script.md`
   - `script descriptionがTest Script`
   - 同様にassets, schemas, indexes各3テスト
3. テスト実行 → 全て失敗（Red）を確認

#### 成果物

テストケース12件追加（各サブリソース型×3: 件数・filename・description）

#### 完了条件

- 新規テスト12件がRED（失敗）状態であること
- 既存テスト29件が引き続きPASSであること

### Phase 2: フィクスチャ作成（Green）

#### 目的

テストを通すためのフィクスチャファイルを作成

#### 手順

1. `test-skill/scripts/test-script.md`を作成（見出し: `# Test Script`）
2. `test-skill/assets/test-asset.md`を作成（見出し: `# Test Asset`）
3. `test-skill/schemas/test-schema.md`を作成（見出し: `# Test Schema`）
4. `test-skill/indexes/test-index.md`を作成（見出し: `# Test Index`）
5. テスト実行 → 全てPASS（Green）を確認

#### 成果物

4つのフィクスチャMarkdownファイル

#### 完了条件

- 新規テスト12件 + 既存テスト29件 = 41件全PASS

### Phase 3: 品質確認・仕様書更新

#### 目的

品質基準を満たし、仕様書を最新化

#### 手順

1. ESLint実行（0エラー確認）
2. `quality-e2e-testing.md`のtest-skillフィクスチャ仕様テーブルを更新
3. `quality-e2e-testing.md`のテストケース一覧を更新

#### 成果物

更新済み仕様書

#### 完了条件

- ESLint 0エラー
- 仕様書のフィクスチャ仕様が実態と一致

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] test-skill/scripts/test-script.md が存在する
- [ ] test-skill/assets/test-asset.md が存在する
- [ ] test-skill/schemas/test-schema.md が存在する
- [ ] test-skill/indexes/test-index.md が存在する
- [ ] SkillScanner.scanAll()でscripts/assets/schemas/indexes各1件がパースされる
- [ ] 各サブリソースのfilenameとdescriptionが正しくパースされる

### 品質要件

- [ ] 全テストケース（41件以上）がPASS
- [ ] 既存29テストケースに回帰なし
- [ ] ESLint 0エラー
- [ ] TODO/FIXME/HACK/XXXコメントなし

### ドキュメント要件

- [ ] quality-e2e-testing.md のフィクスチャ仕様テーブルが更新されている
- [ ] quality-e2e-testing.md のテストケース一覧が更新されている

---

## 6. 検証方法

### テストケース

| TC  | テスト内容                      | 期待結果                        |
| --- | ------------------------------- | ------------------------------- |
| 1   | test-skill のscriptsが1件       | `scripts.length === 1`          |
| 2   | script filenameがtest-script.md | `filename === 'test-script.md'` |
| 3   | script descriptionがTest Script | `description === 'Test Script'` |
| 4   | test-skill のassetsが1件        | `assets.length === 1`           |
| 5   | asset filenameがtest-asset.md   | `filename === 'test-asset.md'`  |
| 6   | asset descriptionがTest Asset   | `description === 'Test Asset'`  |
| 7   | test-skill のschemasが1件       | `schemas.length === 1`          |
| 8   | schema filenameがtest-schema.md | `filename === 'test-schema.md'` |
| 9   | schema descriptionがTest Schema | `description === 'Test Schema'` |
| 10  | test-skill のindexesが1件       | `indexes.length === 1`          |
| 11  | index filenameがtest-index.md   | `filename === 'test-index.md'`  |
| 12  | index descriptionがTest Index   | `description === 'Test Index'`  |

### 検証手順

```bash
# テスト実行
cd apps/desktop
npx vitest run src/__tests__/fixtures/skills.fixture.test.ts

# ESLint確認
npx eslint src/__tests__/fixtures/skills.fixture.test.ts

# 既存ユニットテストへの影響確認
npx vitest run src/main/services/skill/__tests__/
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                          |
| -------------------------------------------- | ------ | -------- | --------------------------------------------- |
| SkillScannerが一部サブリソース型を未サポート | 中     | 低       | ユニットテストで事前確認（49テスト全PASS）    |
| 既存テスト29件への回帰                       | 高     | 低       | Phase 1でRed確認時に既存テストPASSを検証      |
| フィクスチャ構造がSkillScanner互換でない     | 中     | 低       | 既存test-agent.md/test-ref.mdと同じ構造を踏襲 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | 内容                                    |
| ------------------------------- | --------------------------------------- |
| `quality-e2e-testing.md`        | E2Eテスト仕様（現在のフィクスチャ定義） |
| `arch-electron-services.md`     | SkillScanner仕様（サブリソースパース）  |
| `interfaces-agent-sdk-skill.md` | ScannedSkillMetadata型定義              |
| TASK-8C-E outputs               | 既存フィクスチャ実装詳細                |

### 参考資料

| 資料                                                                | 用途                           |
| ------------------------------------------------------------------- | ------------------------------ |
| `src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md` | フィクスチャファイル構造の参考 |
| `src/__tests__/fixtures/skills.fixture.test.ts`                     | テストパターンの参考           |

---

## 9. 備考

### 発見の経緯

TASK-8C-E完了後のシステム仕様書（quality-e2e-testing.md）分析にて、`ScannedSkillMetadata`型の全6サブリソース型のうち4型（scripts, assets, schemas, indexes）がE2Eフィクスチャで未カバーであることを検出。

### 補足事項

- 本タスクはTASK-8C-B/C/D（E2Eテスト本体）の前に完了することが望ましいが、必須ではない
- TASK-8C-B/C/Dが先行実施された場合、後からフィクスチャを拡張してテストケースを追加することも可能
- `another-skill/`（最小構成）にはサブリソースを追加しない（最小構成の性質を維持するため）
