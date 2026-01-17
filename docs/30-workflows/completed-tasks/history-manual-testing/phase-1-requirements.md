# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 1                      |
| Phase名    | 要件定義               |
| 前提Phase  | なし                   |
| 後続Phase  | Phase 11               |
| ステータス | 未実施                 |
| 作成日     | 2026-01-16             |
| 機能名     | history-manual-testing |

---

## 目的

手動テスト実施に必要なテスト要件、対象範囲、前提条件を明確化する。

## 背景

履歴UIコンポーネントの統合が完了し、実環境での動作確認が必要な状態。テスト実施前に、テスト対象・範囲・基準を明確にすることで、効率的かつ網羅的なテストを実施する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 前提条件確認

**目的**: テスト実施に必要な前提タスクが完了していることを確認する。

**実行手順**:

1. 以下の前提タスクの完了状態を確認する
   - task-req-history-integration-001（UI統合）
   - task-req-history-preload-001（preload設定）
   - task-req-history-ipc-001（IPCハンドラー）
   - history-service-db-integration（DB統合）
2. 各タスクのワークフローディレクトリでartifacts.jsonを確認
3. 未完了タスクがあれば、本タスクを中断し、未完了タスクの完了を待つ

**期待される成果物**:

- 前提条件確認結果（ドキュメント内に記載）

---

### タスク2: テスト対象の特定

**目的**: テスト対象となるコンポーネント・機能を特定する。

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`を確認
2. テスト対象コンポーネントをリストアップ
   - VersionHistory.tsx
   - VersionDetail.tsx
   - ConversionLogs.tsx
   - RestoreDialog.tsx
3. テスト対象カスタムフックをリストアップ
   - useVersionHistory.ts
   - useVersionDetail.ts
   - useConversionLogs.ts
   - useRestore.ts
4. IPCチャンネルをリストアップ
   - history:getFileHistory
   - history:getVersionDetail
   - history:getConversionLogs
   - history:restoreVersion

**期待される成果物**:

- テスト対象一覧（ドキュメント内に記載）

---

### タスク3: テスト範囲の定義

**目的**: テストのスコープ（含むもの・含まないもの）を明確化する。

**実行手順**:

1. 含むものを定義
   - 機能テスト（正常系11ケース）
   - エラーハンドリングテスト（異常系4ケース）
   - アクセシビリティテスト（4ケース）
   - レスポンシブテスト（複数画面サイズ）
2. 含まないものを定義
   - 自動テストの追加（既存テストは利用）
   - パフォーマンステスト（将来タスク）
   - ユニットテストの新規作成

**期待される成果物**:

- スコープ定義（ドキュメント内に記載）

---

### タスク4: テスト環境要件の整理

**目的**: テスト実施に必要な環境要件を整理する。

**実行手順**:

1. 必要なソフトウェア
   - Node.js（プロジェクト指定バージョン）
   - pnpmパッケージマネージャー
   - Electronデスクトップアプリ
2. 必要なテストデータ
   - テスト用ファイル（変換履歴があるもの）
   - テスト用ファイル（履歴がないもの）
3. 必要なツール
   - DevTools（Cmd+Option+I）
   - VoiceOver（アクセシビリティテスト用）
4. 起動コマンド
   - `pnpm --filter @repo/desktop dev`

**期待される成果物**:

- テスト環境要件（ドキュメント内に記載）

---

## 参照資料

| 参照資料            | パス                                                                       | 内容               |
| ------------------- | -------------------------------------------------------------------------- | ------------------ |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | コンポーネント仕様 |
| アクセシビリティ    | `.claude/skills/aiworkflow-requirements/references/ui-ux-advanced.md`      | WCAG要件           |
| 元タスク指示書      | `docs/30-workflows/unassigned-task/task-history-manual-testing.md`         | テストケース詳細   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                       | 内容                 |
| ------------------- | -------------------------------------------------------------------------- | -------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | テスト対象の仕様     |
| アクセシビリティ    | `.claude/skills/aiworkflow-requirements/references/ui-ux-advanced.md`      | アクセシビリティ要件 |

---

## 統合テスト連携【必須】

接続要件（IPC/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| IPC接続          | history:getFileHistory, history:getVersionDetail, history:getConversionLogs, history:restoreVersion |
| 認証フロー       | N/A（ローカルアプリのため認証なし）                                                                 |
| データフロー     | Renderer → Preload(contextBridge) → Main(IPC Handler) → HistoryService → SQLite DB                  |

---

## 成果物

| 成果物       | パス                                         | 内容               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | テスト要件の整理   |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | テスト範囲の明確化 |

---

## 完了条件

- [ ] 前提タスクの完了が確認されている
- [ ] テスト対象コンポーネント・フック・IPCチャンネルが特定されている
- [ ] テストスコープ（含むもの・含まないもの）が定義されている
- [ ] テスト環境要件が整理されている
- [ ] 要件定義書が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 前提条件確認の実施
3. テスト対象の特定の実施
4. テスト範囲の定義の実施
5. テスト環境要件の整理の実施
6. 統合テスト連携の確認
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 依存関係

- **前提**: なし（本タスクの起点）
- **後続**: Phase 11 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- 前提条件確認: {{result}}
- テスト対象の特定: {{result}}
- テスト範囲の定義: {{result}}
- テスト環境要件の整理: {{result}}

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

`docs/30-workflows/history-manual-testing/phase-11-manual-test.md`
