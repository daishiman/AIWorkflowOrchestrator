# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 前提Phase  | -                  |
| 後続Phase  | Phase 2            |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

逆同期機能の詳細要件を定義し、受け入れ基準を明確化する。`index.html`から`structure.md`への逆変換に必要な機能要件・非機能要件を洗い出す。

## 背景

現在のslide-dependency-management機能は`structure.md`→`index.html`の片方向同期のみを実装しており、ユーザーが`index.html`を直接編集した場合、`structure.md`が更新されない問題がある。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**選定理由**: タスク指示書で指定されているスキル。Given-When-Then形式で受け入れ基準を定義するため。逆同期機能の動作仕様を明確にテスト可能な形式で記述する。

**Trigger条件**:

- 受け入れ基準の作成、ユーザーストーリーの仕様化、テスト可能な要件定義を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` - Given-When-Then形式の受け入れ基準

---

### スキル2: functional-non-functional-requirements（内蔵知識使用）

**選定理由**: 機能要件と非機能要件を分類し、要件定義書を作成するため。

**実行方法**:

1. ユーザー要求から機能要件（FR）を抽出
2. パフォーマンス・セキュリティ等の非機能要件（NFR）を定義
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md` - 機能・非機能要件定義書

---

## 参照資料

| 参照資料      | パス                                                                        | 内容               |
| ------------- | --------------------------------------------------------------------------- | ------------------ |
| タスク指示書  | `docs/30-workflows/unassigned-task/task-feat-slide-reverse-sync-001.md`     | タスクの背景と目的 |
| 現在の実装    | `apps/desktop/src/main/slide/`                                              | 既存コード         |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | Agent SDK連携仕様  |
| IPC設計       | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`        | Electron IPC設計   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                        | 内容                      |
| ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | Agent連携インターフェース |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン        |

---

## 成果物

| 成果物       | パス                                         | 内容                    |
| ------------ | -------------------------------------------- | ----------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件        |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Given-When-Then形式のAC |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・除外事項      |

---

## 統合テスト連携【必須】

接続要件（file-watcher/sync-manager/skill-executor）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                               |
| ---------------- | ------------------------------------------------------ |
| ファイル監視     | index.htmlの変更検知仕様（chokidar経由）               |
| Agent SDK接続    | Claude Codeへの差分解析リクエスト/レスポンス仕様       |
| IPC通信          | Main→Rendererの同期状態通知（SyncStatusIndicator連携） |
| 無限ループ防止   | changeContextMapの双方向対応仕様                       |

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある（Given-When-Then形式）
- [ ] FR/NFRが分類されている
- [ ] スコープ（含む/含まない）が定義されている
- [ ] 接続要件（ファイル監視/Agent SDK/IPC）が明記されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. acceptance-criteria-writingスキルの実行
3. 機能要件・非機能要件の抽出
4. 統合テスト連携の実施（接続要件明記）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 1
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 1 実行記録

### 使用スキル

- acceptance-criteria-writing: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 2: 設計

`docs/30-workflows/slide-reverse-sync/phase-2-design.md`
