# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| Phase名    | 実装                                 |
| 前提Phase  | Phase 4（テスト作成）                |
| 後続Phase  | Phase 6（テスト拡充）                |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

Phase 4 で作成したテストを全件パスさせるために、E2Eテストフィクスチャファイルを作成する（Green 状態にする）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: test-skill フィクスチャの作成

**目的**: 完全なスキルフィクスチャ（SKILL.md + サブリソース）を作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md` を作成する：

```markdown
---
name: test-skill
description: E2Eテスト用のスキル
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Test Skill

テスト用のスキルです。

## 機能

- ファイルの読み書き
- コマンド実行

## 使用例

\`\`\`
/test-skill ファイルを作成
\`\`\`
```

2. `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md` を作成する：

```markdown
# Test Agent

テスト用サブエージェント。

## 役割

テスト実行時のモック処理。

## 入力

- テストプロンプト

## 出力

- テスト結果
```

3. `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/references/test-ref.md` を作成する：

```markdown
# Test Reference

テスト用参照資料。

## 概要

E2Eテストで使用する参照情報。

## 詳細

テスト環境の設定と検証方法。
```

**期待される成果物**:

- `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md`
- `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md`
- `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/references/test-ref.md`

---

### タスク2: another-skill フィクスチャの作成

**目的**: 最小構成のスキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/SKILL.md` を作成する：

```markdown
---
name: another-skill
description: 別のテスト用スキル
allowed-tools:
  - Read
  - Glob
---

# Another Skill

もう一つのテスト用スキル。
```

**期待される成果物**:

- `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/SKILL.md`

---

### タスク3: invalid-skill フィクスチャの作成

**目的**: SkillScanner がスキップする無効なスキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skills/invalid-skill/README.md` を作成する：

```markdown
# Invalid Skill

このディレクトリは SKILL.md を含まないため、SkillScanner によってスキップされます。
E2Eテストで無効なスキルのハンドリングを検証するために使用します。
```

**期待される成果物**:

- `apps/desktop/src/__tests__/__fixtures__/skills/invalid-skill/README.md`

---

### タスク4: テスト実行確認（Green 状態）

**目的**: Phase 4 で作成したテストが全件パスすることを確認する

**実行手順**:

1. テストを実行する：
   ```bash
   pnpm --filter @repo/desktop vitest run src/__tests__/fixtures/skills.fixture.test.ts
   ```
2. 全テストケース（TC-001〜TC-014）がパスすることを確認する
3. 実装サマリーを `outputs/phase-05/implementation-summary.md` に出力する

**期待される成果物**:

- テスト実行結果（全件 PASS）
- `outputs/phase-05/implementation-summary.md`

---

## 参照資料

| 参照資料       | パス                                                                      | 内容                   |
| -------------- | ------------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書 | `outputs/phase-02/fixture-design.md`                                      | フィクスチャ設計       |
| Phase 4 テスト | `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts`              | フィクスチャ検証テスト |
| 元タスク定義   | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-e-fixtures.md` | フィクスチャ内容       |

---

## 成果物

| 成果物              | パス                                                                               | 内容         |
| ------------------- | ---------------------------------------------------------------------------------- | ------------ |
| test-skill SKILL.md | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md`               | 完全スキル   |
| test-agent.md       | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md`   | エージェント |
| test-ref.md         | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/references/test-ref.md` | 参照資料     |
| another-skill       | `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/SKILL.md`            | 最小スキル   |
| invalid-skill       | `apps/desktop/src/__tests__/__fixtures__/skills/invalid-skill/README.md`           | 無効スキル   |
| 実装サマリー        | `outputs/phase-05/implementation-summary.md`                                       | 実装記録     |

---

## 統合テスト連携

フィクスチャ作成後、SkillScanner でフィクスチャディレクトリをスキャンし、期待される `ScannedSkillMetadata[]` が返されることを確認する。これは Phase 4 のテストケース TC-009〜TC-014 で検証される。

---

## Electronデスクトップアプリ観点

| 層               | 確認内容                                                           |
| ---------------- | ------------------------------------------------------------------ |
| バックエンド     | SkillScanner（Main Process）がフィクスチャを正しくパースできること |
| ファイルシステム | フィクスチャのパスがプラットフォーム非依存であること               |

---

## 完了条件

- [ ] test-skill/SKILL.md が作成されている
- [ ] test-skill/agents/test-agent.md が作成されている
- [ ] test-skill/references/test-ref.md が作成されている
- [ ] another-skill/SKILL.md が作成されている
- [ ] invalid-skill/README.md が作成されている
- [ ] Phase 4 のテスト（TC-001〜TC-014）が全件パスしている
- [ ] 実装サマリーが outputs/phase-05/ に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-06-test-expansion.md`
