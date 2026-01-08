# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase番号  | 1                                |
| Phase名    | 要件定義                         |
| 目的       | 目的・スコープ・受け入れ基準定義 |
| 前提Phase  | Phase 0（SDK調査・スキル作成）   |
| 後続Phase  | Phase 2（設計）                  |
| ステータス | 未実施                           |

---

## 目的

Agent SDK統合の詳細要件を定義する。

---

## 使用スキル

| スキル名                               | パス                                                             | 選定理由                                        |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| functional-non-functional-requirements | `.claude/skills/functional-non-functional-requirements/SKILL.md` | 機能要件・非機能要件の定義（Trigger: 要件定義） |
| acceptance-criteria-writing            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準の作成（Trigger: 受け入れ基準）     |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物               | 説明                        | 配置先                                   |
| -------------------- | --------------------------- | ---------------------------------------- |
| 要件定義書           | Agent SDK統合仕様           | `outputs/phase-1/requirements-spec.md`   |
| 受け入れ基準         | 機能別の受け入れ基準        | `outputs/phase-1/acceptance-criteria.md` |
| インターフェース仕様 | IPC通信インターフェース定義 | `outputs/phase-1/interface-spec.md`      |

---

## 実行手順

### Step 1: 機能要件の定義

functional-non-functional-requirementsスキルを使用して、機能要件を定義する。

**機能要件項目**:

1. Agent SDK初期化機能
2. スキル呼び出し機能（query API）
3. セッション管理機能（作成・再開）
4. IPC通信インターフェース
5. エラーハンドリング

### Step 2: 非機能要件の定義

**非機能要件項目**:

1. パフォーマンス（レスポンス時間）
2. セキュリティ（API Key管理）
3. 可用性（エラー時の復旧）
4. 保守性（コードの構造化）

### Step 3: 受け入れ基準の作成

acceptance-criteria-writingスキルを使用して、各機能の受け入れ基準を作成する。

**受け入れ基準フォーマット**:

```
Given: [前提条件]
When: [操作]
Then: [期待結果]
```

---

## 完了条件

- [ ] Agent SDK APIの利用パターンが明確化されている
- [ ] Electron IPC通信のインターフェースが定義されている
- [ ] 全機能の受け入れ基準が作成されている
- [ ] 非機能要件（パフォーマンス・セキュリティ）が定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

接続要件（API/認証/データフロー）を要件に明記すること:

- [ ] Agent SDK APIエンドポイント接続要件
- [ ] ANTHROPIC_API_KEY認証フロー
- [ ] Renderer → Main → Agent SDK → Main → Renderer のデータフロー

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                           | 内容                    |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| interfaces-llm          | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | LLMインターフェース仕様 |
| security-implementation | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ実装仕様    |

---

## スキルフィードバック記録

| スキル                                 | 結果    | 備考              |
| -------------------------------------- | ------- | ----------------- |
| functional-non-functional-requirements | pending | Phase完了後に記録 |
| acceptance-criteria-writing            | pending | Phase完了後に記録 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. functional-non-functional-requirementsスキルの実行
3. acceptance-criteria-writingスキルの実行
4. 統合テスト連携の実施
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 1
```

---

## 次のPhase

Phase 2: 設計

---

## 備考

- 本Phaseで定義した要件は後続Phaseの基準となる
- セキュリティ要件（API Key管理）は特に重要
