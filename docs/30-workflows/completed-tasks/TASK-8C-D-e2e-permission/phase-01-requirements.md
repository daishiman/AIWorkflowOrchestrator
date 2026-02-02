# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 前提Phase  | -                        |
| 後続Phase  | Phase 2                  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

権限確認ダイアログのE2Eテスト要件を定義する。PlaywrightとVitestを使用し、ユーザーが権限ダイアログと対話するフロー全体を検証する。

## 背景

TASK-7Dで ChatPanel 統合が完了し、TASK-8C-Eで E2Eテストフィクスチャが整備された。権限ダイアログのE2Eテストは、スキル実行時にツールが権限確認を必要とする際の「許可」「拒否」「選択記憶」フローをエンドツーエンドで検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 依存タスク完了状況の確認

**目的**: E2Eテスト実装に必要な前提条件が整っていることを確認する

**実行手順**:

1. TASK-7D（ChatPanel統合）の完了状況を確認
   - ChatPanel に PermissionDialog が統合されているか
   - Store-direct パターンで pendingPermission が処理されているか

2. TASK-8C-E（テストフィクスチャ）の完了状況を確認
   - `apps/desktop/src/__tests__/__fixtures__/skills/` にフィクスチャが存在するか
   - test-skill に allowedTools が定義されているか（権限テストトリガー用）

3. 既存E2E設定の確認
   - `apps/desktop/vite.e2e.config.ts` の設定内容
   - E2Eテスト用モック注入方式（addInitScript）

**期待される成果物**:

- `outputs/phase-1/dependency-check.md`: 依存タスク確認結果

---

### タスク2: 機能要件定義

**目的**: E2Eテストで検証すべき機能要件を明確化する

**実行手順**:

1. テストケース一覧を定義（5ケース）

   | TC   | テスト名           | 検証内容                                   |
   | ---- | ------------------ | ------------------------------------------ |
   | TC-1 | 権限ダイアログ表示 | ツール実行時に権限ダイアログが表示される   |
   | TC-2 | ツール情報表示     | ツール名・引数が正しく表示される           |
   | TC-3 | 許可して続行       | 「許可」クリックで実行が継続する           |
   | TC-4 | 拒否して停止       | 「拒否」クリックでキャンセル/エラーになる  |
   | TC-5 | 選択記憶           | チェックボックスで次回以降ダイアログ非表示 |

2. 各テストケースの前提条件・期待結果を詳細化

3. テストデータ要件を定義
   - 使用フィクスチャ: `test-skill`
   - 権限確認をトリガーするコマンド入力

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`: 機能要件定義書

---

### タスク3: 非機能要件定義

**目的**: E2Eテストの品質・性能要件を定義する

**実行手順**:

1. テスト安定性要件
   - 非同期待機: ダイアログ表示まで最大10秒待機
   - フレーキーテスト回避: waitForSelector, waitForLoadState 使用

2. テスト独立性要件
   - 各テストケースは独立して実行可能
   - beforeEach でスキルインポート・選択を初期化

3. アクセシビリティテスト要件
   - ARIA属性（role="alertdialog"）の存在確認
   - キーボードナビゲーション（Tab, Enter, Escape）

4. パフォーマンス要件
   - 各テストケース実行時間: 30秒以内
   - 全体実行時間: 3分以内

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md`: 非機能要件定義書

---

### タスク4: 受け入れ基準定義

**目的**: テスト完了を判断するための基準を定義する

**実行手順**:

1. テスト実装受け入れ基準
   - 5件のテストケースが全て実装されている
   - 全テストが Playwright + Vitest で実行可能

2. 品質受け入れ基準
   - 全テストが PASS（CI環境含む）
   - ESLint / TypeScript エラーなし
   - フレーキーテスト発生率 0%

3. ドキュメント受け入れ基準
   - テストケース一覧がドキュメント化されている
   - 実行方法が README に記載されている

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`: 受け入れ基準定義書

---

## 参照資料

| 参照資料            | パス                                                                              | 内容                            |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| 元タスク仕様        | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-d-e2e-permission.md`   | テストケース概要                |
| E2Eテスト仕様       | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`        | E2Eテスト戦略・フィクスチャ仕様 |
| Agent SDK Skill仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Permission型定義                |
| E2Eフィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skills/`                                 | テスト用スキル                  |
| Vite E2E設定        | `apps/desktop/vite.e2e.config.ts`                                                 | E2E環境設定                     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                              | 内容                            |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| E2Eテスト仕様    | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`        | E2Eテスト戦略                   |
| Permission型定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillPermissionRequest/Response |

---

## 成果物

| 成果物             | パス                                             | 内容              |
| ------------------ | ------------------------------------------------ | ----------------- |
| 依存タスク確認結果 | `outputs/phase-1/dependency-check.md`            | 前提条件確認      |
| 機能要件定義書     | `outputs/phase-1/functional-requirements.md`     | 5テストケース詳細 |
| 非機能要件定義書   | `outputs/phase-1/non-functional-requirements.md` | 品質・安定性要件  |
| 受け入れ基準定義書 | `outputs/phase-1/acceptance-criteria.md`         | 完了判定基準      |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1での統合テスト連携アクション:**

- 権限ダイアログ→Main Process IPC通信の検証ポイントを明記
- フィクスチャスキルがPermission要求をトリガーする条件を定義
- 既存IPC統合テスト（TASK-8C-A）との関係を整理

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

---

## 完了条件

- [ ] 依存タスク確認結果が作成されている
- [ ] 機能要件定義書が作成されている（5テストケース詳細）
- [ ] 非機能要件定義書が作成されている
- [ ] 受け入れ基準定義書が作成されている
- [ ] フィクスチャ利用方針が明確化されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: 依存タスク完了状況の確認
3. 実行タスク2: 機能要件定義
4. 実行タスク3: 非機能要件定義
5. 実行タスク4: 受け入れ基準定義
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-02-design.md`
