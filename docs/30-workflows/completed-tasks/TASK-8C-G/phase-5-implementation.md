# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 5          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

Phase 4で作成した失敗テストを通すために、新規フィクスチャファイル6種類を作成し、テストヘルパーの実装を完了する。全テストがGreen状態になることを確認する。

## 実行タスク

- フィクスチャファイル作成: 6種類の新規フィクスチャの全ファイルを作成
- テストヘルパー完成: parseFrontmatter等のヘルパー関数を動作させる
- テスト修正: Red状態のテストをGreenにするための微調整

## 参照資料

| 資料名                   | パス                                                                | 説明             |
| ------------------------ | ------------------------------------------------------------------- | ---------------- |
| Phase 2 フィクスチャ設計 | `outputs/phase-02/fixture-design.md`                                | フィクスチャ構造 |
| Phase 4 テスト仕様書     | `outputs/phase-04/test-specification.md`                            | TC一覧           |
| 既存テストファイル       | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | テストコード     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                       | 内容                 |
| ------------- | -------------------------------------------------------------------------- | -------------------- |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md` | フィクスチャ設計原則 |

## 実行手順

### 1. boundary-skill/ フィクスチャ作成

`apps/desktop/src/__tests__/__fixtures__/skill-creator/boundary-skill/` に以下のファイルを作成する。

#### SKILL.md

| 要素          | 内容                                                        |
| ------------- | ----------------------------------------------------------- |
| name          | 64文字のkebab-case文字列（例: `a]` を繰り返し64文字に調整） |
| description   | 10文字ちょうどの文字列                                      |
| version       | `1.0.0`（semver形式）                                       |
| allowed-tools | `[Read, Write, Bash]`                                       |
| body          | `## Anchors` と `## Trigger` セクションを含む               |

#### agents/boundary-agent.md

| 要素 | 内容                                                         |
| ---- | ------------------------------------------------------------ |
| body | `## 目的`, `## 入力`, `## 出力`, `## 実行手順` の4セクション |

#### assets/chain-config.yaml

| 要素  | 内容                              |
| ----- | --------------------------------- |
| steps | 2件のステップ定義（最小値テスト） |

#### assets/parallel-config.yaml

| 要素  | 内容                            |
| ----- | ------------------------------- |
| tasks | 2件のタスク定義（最小値テスト） |

#### schemas/boundary-schema.json

| 要素       | 内容                                      |
| ---------- | ----------------------------------------- |
| $schema    | `http://json-schema.org/draft-07/schema#` |
| type       | `object`                                  |
| properties | 最小限のプロパティ定義                    |

### 2. missing-fields-skill/ フィクスチャ作成

`apps/desktop/src/__tests__/__fixtures__/skill-creator/missing-fields-skill/` に以下のファイルを作成する。

#### SKILL.md

Frontmatterにnameもdescriptionも含まない。`allowed-tools` のみ記載するか、Frontmatterブロック自体を空にする。

### 3. forbidden-files-skill/ フィクスチャ作成

`apps/desktop/src/__tests__/__fixtures__/skill-creator/forbidden-files-skill/` に以下のファイルを作成する。

#### SKILL.md

有効なFrontmatter（name, description, allowed-tools）を持つ正常なSKILL.md。

#### README.md

`validate-skill-structure.js` の `FORBIDDEN_FILES` リストに該当するファイル。内容は検証目的の説明テキスト。

### 4. invalid-name-skill/ フィクスチャ作成

`apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-name-skill/` に以下のファイルを作成する。

#### SKILL.md

Frontmatterの `name` フィールドに `Invalid_Name_With_Uppercase` のような非kebab-case文字列を設定。

### 5. empty-agents-skill/ フィクスチャ作成

`apps/desktop/src/__tests__/__fixtures__/skill-creator/empty-agents-skill/` に以下のファイルを作成する。

#### SKILL.md

有効なFrontmatter。

#### agents/.gitkeep

空ファイル。agents/ ディレクトリが存在するが .md ファイルがない状態を作る。

### 6. invalid-schema-skill/ フィクスチャ作成

`apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-schema-skill/` に以下のファイルを作成する。

#### SKILL.md

有効なFrontmatter。

#### schemas/invalid-schema.json

`$schema` プロパティなし、`type` プロパティなしの不正なJSONスキーマ。

### 7. テスト実行とGreen確認

```bash
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts
```

全96件（既存62件 + 新規34件）のテストがPASSすることを確認する。

## 統合テスト連携

| 実装項目           | 内容                                                 |
| ------------------ | ---------------------------------------------------- |
| フィクスチャ作成   | 6種類のフィクスチャファイルをファイルシステムに配置  |
| スクリプト実行確認 | 各フィクスチャに対する検証スクリプトの正常動作を確認 |
| Vitest統合確認     | テストファイルからのスクリプト呼び出しが正常に動作   |

## 成果物

| 成果物       | パス                                                                           | 説明               |
| ------------ | ------------------------------------------------------------------------------ | ------------------ |
| 実装サマリー | `outputs/phase-05/implementation-summary.md`                                   | 実装内容の記録     |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skill-creator/boundary-skill/`        | 境界値フィクスチャ |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skill-creator/missing-fields-skill/`  | フィールド欠落     |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skill-creator/forbidden-files-skill/` | 禁止ファイル       |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-name-skill/`    | 名前違反           |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skill-creator/empty-agents-skill/`    | 空agents           |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-schema-skill/`  | 不正スキーマ       |

## 完了条件

- [ ] 6種類の新規フィクスチャが全て作成されている
- [ ] boundary-skill のnameが64文字、descriptionが10文字である
- [ ] boundary-skill にAnchors/Triggerセクションがある
- [ ] forbidden-files-skill にREADME.mdが含まれている
- [ ] invalid-name-skill のnameが非kebab-caseである
- [ ] empty-agents-skill のagents/に.mdファイルがない
- [ ] invalid-schema-skill のスキーマに$schema/typeがない
- [ ] 全テスト（96件）がGreen状態である
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts

# 確認項目
# - [ ] 既存62件のテストが成功を維持
# - [ ] 新規34件のテストが成功（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
