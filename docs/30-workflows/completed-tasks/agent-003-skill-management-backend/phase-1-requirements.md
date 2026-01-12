# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 1                      |
| Phase名    | 要件定義               |
| 前提Phase  | -                      |
| 後続Phase  | Phase 2                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

スキル管理バックエンド機能の目的・スコープ・受け入れ基準を定義する。SKILL.md解析仕様を明確化し、100人中100人が同じ理解で実装できる粒度で要件を定義する。

## 背景

エージェント機能を実現するため、Main ProcessでClaude Codeのスキルを読み込み・解析し、Rendererに提供するバックエンド実装が必要。フロントエンド（AGENT-002）と並行開発するため、IPC契約を先に定義する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: 実装すべき機能を明確に定義する

**実行手順**:

1. 対象タスク指示書を読み込む
   - `docs/30-workflows/unassigned-task/task-agent-03-skill-management-backend.md`

2. 以下の機能要件を文書化する:
   - 利用可能スキル一覧取得（`agent:scan-available-skills`）
   - インポート済みスキル一覧取得（`agent:get-imported-skills`）
   - スキルインポート（`agent:import-skills`）
   - スキル削除（`agent:remove-skill`）
   - スキル詳細取得（`agent:get-skill-detail`）
   - スキルパス設定（設定可能）

3. 非機能要件を文書化する:
   - パフォーマンス: 初回スキャン3秒以内、キャッシュ利用時100ms以内
   - セキュリティ: パストラバーサル防止、IPC sender検証
   - 永続化: electron-storeによるインポート設定保存

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`

---

### タスク2: SKILL.md解析仕様の定義

**目的**: SKILL.mdファイルの解析ルールを明確に定義する

**実行手順**:

1. システム仕様を確認する:
   - `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md`

2. 以下の解析対象を定義する:

   ```yaml
   # YAML Frontmatter（解析対象）
   name: string # 必須: スキル識別子
   description: string # 必須: スキル説明（Anchors・Trigger含む）
   license: string # 任意
   allowed-tools: [] # 任意
   tags: [] # 任意
   dependencies: [] # 任意
   ```

3. Anchors解析ルールを定義する:
   - description内の `Anchors:` セクションを抽出
   - `• {{アンカー名}} / 適用: {{適用範囲}} / 目的: {{目的}}` 形式を解析

4. Trigger解析ルールを定義する:
   - description内の `Trigger:` セクションを抽出
   - キーワードリストとして解析

5. fallback値を定義する（解析失敗時）:
   ```typescript
   const defaultSkill: Partial<Skill> = {
     name: "Unknown Skill",
     description: "Description not available",
     triggers: [],
     anchors: [],
   };
   ```

**期待される成果物**:

- `outputs/phase-1/skill-md-spec.md`

---

### タスク3: 受け入れ基準の定義（Given-When-Then形式）

**目的**: テスト可能な受け入れ基準を定義する

**実行手順**:

1. 以下のシナリオをGiven-When-Then形式で定義する:

```gherkin
Feature: スキル管理バックエンド

Scenario: 利用可能なスキル一覧を取得できる
  Given アプリケーションが起動している
  And .claude/skills/ ディレクトリに10個のスキルが存在する
  When Rendererがagent:scan-available-skillsを呼び出す
  Then 10個のスキルメタデータが返される
  And 各スキルにはid, name, description, path, triggersが含まれる

Scenario: スキルをインポートできる
  Given 利用可能なスキル一覧が取得済みである
  And スキルIDの配列を指定する
  When Rendererがagent:import-skills { skillIds }を呼び出す
  Then 指定したスキルがインポートされる
  And インポート設定がelectron-storeに永続化される

Scenario: インポート済みスキル一覧を取得できる
  Given 3つのスキルがインポート済みである
  When Rendererがagent:get-imported-skillsを呼び出す
  Then インポート済みの3つのスキルのみ返される

Scenario: インポート済みスキルを削除できる
  Given スキルがインポート済みである
  When Rendererがagent:remove-skill { skillId }を呼び出す
  Then スキルがインポート一覧から削除される
  And 設定が永続化される

Scenario: スキル詳細を取得できる
  Given スキルがインポート済みである
  When Rendererがagent:get-skill-detail { skillId }を呼び出す
  Then 指定したスキルの詳細情報が返される
  And anchorsの配列が含まれる

Scenario: SKILL.mdがないディレクトリは除外される
  Given .claude/skills/に無効なディレクトリがある（SKILL.mdなし）
  When 利用可能スキル一覧を取得する
  Then 無効なディレクトリは結果に含まれない

Scenario: アプリ再起動後もインポート設定が維持される
  Given 5つのスキルがインポート済みである
  When アプリケーションを再起動する
  And インポート済みスキル一覧を取得する
  Then 同じ5つのスキルが返される

Scenario: スキルパスを設定できる
  Given 設定画面でスキルパスを変更する
  When 利用可能スキル一覧を取得する
  Then 指定されたパスからスキルが読み込まれる

Scenario: パストラバーサル攻撃を防止する
  Given 悪意のあるパス（../../../etc/passwd）が指定された
  When スキル詳細を取得しようとする
  Then エラーが返される
  And ファイルアクセスは行われない

Scenario: IPC sender検証でDevToolsからの呼び出しを拒否する
  Given DevToolsコンソールからIPC呼び出しを試行する
  When agent:scan-available-skillsを呼び出す
  Then 認証エラーが返される
```

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク4: IPC契約の定義

**目的**: Main Process↔Renderer間のIPC契約を定義する

**実行手順**:

1. システム仕様を確認する:
   - `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`

2. 以下のIPCチャネルを定義する:

| チャネル名                    | 方向          | 引数                     | 戻り値            |
| ----------------------------- | ------------- | ------------------------ | ----------------- |
| `agent:scan-available-skills` | Renderer→Main | `{ basePath?: string }`  | `SkillScanResult` |
| `agent:get-imported-skills`   | Renderer→Main | なし                     | `Skill[]`         |
| `agent:import-skills`         | Renderer→Main | `{ skillIds: string[] }` | `ImportResult`    |
| `agent:remove-skill`          | Renderer→Main | `{ skillId: string }`    | `RemoveResult`    |
| `agent:get-skill-detail`      | Renderer→Main | `{ skillId: string }`    | `Skill \| null`   |

3. エラーレスポンス形式を定義する:
   ```typescript
   interface IPCError {
     code: string; // 'VALIDATION_ERROR', 'NOT_FOUND', 'AUTH_ERROR'
     message: string; // ユーザー向けメッセージ
     details?: unknown; // デバッグ情報（開発時のみ）
   }
   ```

**期待される成果物**:

- `outputs/phase-1/ipc-contract.md`

---

### タスク5: 要件定義ドキュメント統合

**目的**: 全要件を1つのドキュメントにまとめる

**実行手順**:

1. タスク1-4の成果物を統合する
2. `outputs/phase-1/requirements.md` を作成する
3. 以下のセクションを含める:
   - 機能要件
   - 非機能要件
   - SKILL.md解析仕様
   - 受け入れ基準
   - IPC契約
   - セキュリティ要件

**期待される成果物**:

- `outputs/phase-1/requirements.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                | 内容                   |
| ---------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| Skill構造仕様          | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md解析仕様       |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`        | IPC通信セキュリティ    |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`        | agentSlice設計パターン |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "skill"`

---

## 成果物

| 成果物           | パス                                         | 内容                   |
| ---------------- | -------------------------------------------- | ---------------------- |
| 機能要件         | `outputs/phase-1/functional-requirements.md` | 機能要件定義           |
| SKILL.md解析仕様 | `outputs/phase-1/skill-md-spec.md`           | 解析ルール定義         |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then形式    |
| IPC契約          | `outputs/phase-1/ipc-contract.md`            | IPC契約定義            |
| 要件定義（統合） | `outputs/phase-1/requirements.md`            | 全要件統合ドキュメント |

---

## 統合テスト連携

**Phase 1での必須アクション**: IPC接続要件・ファイルI/O要件を要件に明記

- [ ] IPCチャネル名と引数・戻り値の型を明確に定義
- [ ] ファイルI/O要件（対象ディレクトリ、除外パターン）を明記
- [ ] エラーレスポンス形式を統一

---

## 完了条件

- [ ] 機能要件が文書化されている
- [ ] 非機能要件が文書化されている
- [ ] SKILL.md解析仕様が定義されている
- [ ] 受け入れ基準がGiven-When-Then形式で定義されている
- [ ] IPC契約が定義されている
- [ ] セキュリティ要件が定義されている
- [ ] 全要件が `outputs/phase-1/requirements.md` に統合されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1 機能要件の定義: {{result}}
- タスク2 SKILL.md解析仕様の定義: {{result}}
- タスク3 受け入れ基準の定義: {{result}}
- タスク4 IPC契約の定義: {{result}}
- タスク5 要件定義ドキュメント統合: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-2-design.md`
