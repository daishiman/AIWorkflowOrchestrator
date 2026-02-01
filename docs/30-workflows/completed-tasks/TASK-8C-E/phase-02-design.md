# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| Phase名    | 設計                                 |
| 前提Phase  | Phase 1（要件定義）                  |
| 後続Phase  | Phase 3（設計レビューゲート）        |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

E2Eテストフィクスチャのディレクトリ構造、各ファイルの内容、SkillScanner パース結果の期待値を設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ディレクトリ構造設計

**目的**: フィクスチャのファイルシステム構造を確定する

**実行手順**:

1. Phase 1 の要件定義書（`outputs/phase-01/requirements-definition.md`）を読む
2. 以下のディレクトリ構造を設計する：

```
apps/desktop/src/__tests__/__fixtures__/skills/
├── test-skill/
│   ├── SKILL.md
│   ├── agents/
│   │   └── test-agent.md
│   └── references/
│       └── test-ref.md
├── another-skill/
│   └── SKILL.md
└── invalid-skill/
    └── README.md
```

3. 各ディレクトリの役割をテーブルで整理する：

| ディレクトリ   | 役割                             | SkillScanner の期待動作            |
| -------------- | -------------------------------- | ---------------------------------- |
| test-skill/    | 完全なスキル（サブリソース付き） | パース成功、agents/references 検出 |
| another-skill/ | 最小構成スキル（SKILL.md のみ）  | パース成功、サブリソース空配列     |
| invalid-skill/ | 無効なスキル（SKILL.md なし）    | スキップ                           |

4. `outputs/phase-02/fixture-design.md` に構造設計を記載する

**期待される成果物**:

- `outputs/phase-02/fixture-design.md`

---

### タスク2: SKILL.md コンテンツ設計

**目的**: 各スキルの SKILL.md の具体的な内容を設計する

**実行手順**:

1. SkillScanner の YAML Frontmatter パース仕様を確認する（`apps/desktop/src/main/services/skill/SkillScanner.ts`）
2. 以下の2つの SKILL.md を設計する：

**test-skill/SKILL.md**:

```yaml
---
name: test-skill
description: E2Eテスト用のスキル
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---
```

- body部分: `# Test Skill` 見出し + 説明テキスト + 機能リスト + 使用例

**another-skill/SKILL.md**:

```yaml
---
name: another-skill
description: 別のテスト用スキル
allowed-tools:
  - Read
  - Glob
---
```

- body部分: `# Another Skill` 見出し + 説明テキスト

3. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- SKILL.md コンテンツ設計（`outputs/phase-02/fixture-design.md` に含む）

---

### タスク3: サブリソースファイル設計

**目的**: agents/ と references/ 配下のファイル内容を設計する

**実行手順**:

1. SkillScanner の説明抽出ロジックを確認する（最初の `#` 見出し行をdescriptionとして取得）
2. 以下のファイルを設計する：

**test-skill/agents/test-agent.md**:

- 最初の見出し: `# Test Agent`
- 内容: テスト用サブエージェントの役割・入力・出力

**test-skill/references/test-ref.md**:

- 最初の見出し: `# Test Reference`
- 内容: テスト用参照資料の概要・詳細

3. 各ファイルの SkillScanner パース期待値を記載する：

| ファイル               | 期待される name | 期待される description |
| ---------------------- | --------------- | ---------------------- |
| agents/test-agent.md   | test-agent      | Test Agent             |
| references/test-ref.md | test-ref        | Test Reference         |

4. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- サブリソース設計（`outputs/phase-02/fixture-design.md` に含む）

---

### タスク4: 無効スキル設計

**目的**: invalid-skill の構造を設計する

**実行手順**:

1. SkillScanner がスキルをスキップする条件を確認する（SKILL.md が存在しない場合）
2. invalid-skill/README.md の内容を設計する：
   - SKILL.md ではないので SkillScanner はこのディレクトリをスキップする
   - README.md は任意の内容（テスト目的の説明）
3. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- 無効スキル設計（`outputs/phase-02/fixture-design.md` に含む）

---

## 参照資料

| 参照資料          | パス                                                                                | 内容           |
| ----------------- | ----------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物    | `outputs/phase-01/requirements-definition.md`                                       | 要件定義       |
| SkillScanner 実装 | `apps/desktop/src/main/services/skill/SkillScanner.ts`                              | パースロジック |
| 既存フィクスチャ  | `apps/desktop/src/main/services/skill/__tests__/__fixtures__/`                      | 参考構造       |
| スキル構造仕様    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md仕様   |

---

## 成果物

| 成果物           | パス                                 | 内容                     |
| ---------------- | ------------------------------------ | ------------------------ |
| フィクスチャ設計 | `outputs/phase-02/fixture-design.md` | 構造・内容・期待値の設計 |

---

## 統合テスト連携

**Phase 2 では統合テストの対象外**

設計フェーズのため、統合テストは Phase 4 以降で実施する。フィクスチャが SkillScanner と整合する設計であることを確認する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                    |
| -------------- | ----------------------------------------------------------- |
| テスタビリティ | フィクスチャが E2E テストの全シナリオをカバーしているか     |
| 保守性         | SKILL.md のフォーマットが SkillScanner 仕様と一致しているか |
| 拡張性         | 将来のテスト追加時にフィクスチャを拡張しやすい構造か        |

---

## 完了条件

- [ ] ディレクトリ構造が確定している
- [ ] test-skill/SKILL.md の YAML Frontmatter と body が設計されている
- [ ] another-skill/SKILL.md の YAML Frontmatter と body が設計されている
- [ ] agents/test-agent.md の内容と期待パース結果が設計されている
- [ ] references/test-ref.md の内容と期待パース結果が設計されている
- [ ] invalid-skill/README.md の内容が設計されている
- [ ] 全成果物が outputs/phase-02/ に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-03-design-review.md`
