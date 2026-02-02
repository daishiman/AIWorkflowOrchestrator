# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| Phase名    | 設計                     |
| 前提Phase  | Phase 1                  |
| 後続Phase  | Phase 3                  |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

権限ダイアログE2Eテストの技術設計を行う。Playwright + Vitest 構成でのテストアーキテクチャ、モック戦略、テストユーティリティを設計する。

## 背景

Phase 1 で定義した5つのテストケースを実装するためのテスト設計が必要。Electron環境でのE2Eテストは通常のWebアプリとは異なり、Main Process / Renderer Process 間のIPC通信をモックする必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストアーキテクチャ設計

**目的**: E2Eテストの全体構成を設計する

**実行手順**:

1. テスト環境構成を設計

   | レイヤー       | 技術            | 用途                     |
   | -------------- | --------------- | ------------------------ |
   | テストランナー | Vitest          | テスト実行・アサーション |
   | ブラウザ操作   | Playwright      | Electron起動・DOM操作    |
   | モック注入     | addInitScript   | electronAPI モック       |
   | フィクスチャ   | E2Eフィクスチャ | test-skill等             |

2. テストファイル構成を設計

   | ファイル                               | 内容                 |
   | -------------------------------------- | -------------------- |
   | `src/__tests__/skillPermission.e2e.ts` | メインテストファイル |
   | `src/__tests__/__fixtures__/skills/`   | テスト用スキル       |

3. テストライフサイクルを設計

   | フック     | 処理内容                             |
   | ---------- | ------------------------------------ |
   | beforeAll  | Electronアプリ起動、firstWindow取得  |
   | afterAll   | Electronアプリ終了                   |
   | beforeEach | スキルインポート・選択、状態リセット |
   | afterEach  | スクリーンショット保存（失敗時）     |

**期待される成果物**:

- `outputs/phase-2/test-architecture.md`: テストアーキテクチャ設計書

---

### タスク2: モック戦略設計

**目的**: electronAPI / skillAPI のモック方式を設計する

**実行手順**:

1. モック対象のAPI一覧を定義

   | API                          | モック方式           | 理由                 |
   | ---------------------------- | -------------------- | -------------------- |
   | `skillAPI.import`            | 成功レスポンス固定   | スキルインポート前提 |
   | `skillAPI.onPermission`      | イベントシミュレート | 権限リクエスト発火   |
   | `skillAPI.respondPermission` | 呼び出し検証         | 応答内容確認         |
   | `electronAPI.skill.*`        | addInitScript注入    | E2E環境用スタブ      |

2. Permission リクエストのシミュレーション方式を設計
   - `page.evaluate()` を使用して `skillAPI.onPermission` のコールバックを発火
   - または `window.dispatchEvent()` でカスタムイベント発火

3. rememberChoice 永続化のモック方式を設計
   - electron-store のモック
   - または in-memory storage の使用

**期待される成果物**:

- `outputs/phase-2/mock-strategy.md`: モック戦略設計書

---

### タスク3: テストケース詳細設計

**目的**: 各テストケースの具体的な実装設計を行う

**実行手順**:

1. TC-1: 権限ダイアログ表示

   | 項目     | 内容                                     |
   | -------- | ---------------------------------------- |
   | 前提条件 | test-skill がインポート・選択済み        |
   | 操作     | "Run dangerous command" を入力して Enter |
   | 検証     | `text="権限の確認が必要です"` が visible |
   | 待機戦略 | `toBeVisible({ timeout: 10000 })`        |

2. TC-2: ツール情報表示

   | 項目     | 内容                                          |
   | -------- | --------------------------------------------- |
   | 前提条件 | 権限ダイアログが表示されている                |
   | 操作     | なし（表示確認のみ）                          |
   | 検証     | `text="ツール:"` と `text="引数:"` が visible |

3. TC-3: 許可して続行

   | 項目     | 内容                                         |
   | -------- | -------------------------------------------- |
   | 前提条件 | 権限ダイアログが表示されている               |
   | 操作     | 「許可」ボタンをクリック                     |
   | 検証     | ダイアログが閉じ、`text="実行中"` が visible |

4. TC-4: 拒否して停止

   | 項目     | 内容                                             |
   | -------- | ------------------------------------------------ |
   | 前提条件 | 権限ダイアログが表示されている                   |
   | 操作     | 「拒否」ボタンをクリック                         |
   | 検証     | ダイアログが閉じ、`text="キャンセル"` が visible |

5. TC-5: 選択記憶

   | 項目     | 内容                                            |
   | -------- | ----------------------------------------------- |
   | 前提条件 | 権限ダイアログが表示されている                  |
   | 操作1    | チェックボックスをクリック → 「許可」クリック   |
   | 操作2    | 同じコマンドを再実行                            |
   | 検証     | 2回目は権限ダイアログが表示されない             |
   | 待機戦略 | `waitForTimeout(1000)` 後に `not.toBeVisible()` |

**期待される成果物**:

- `outputs/phase-2/test-case-design.md`: テストケース詳細設計書

---

### タスク4: テストユーティリティ設計

**目的**: 再利用可能なテストヘルパーを設計する

**実行手順**:

1. ヘルパー関数を設計

   | 関数名                    | 用途                             |
   | ------------------------- | -------------------------------- |
   | `importAndSelectSkill`    | スキルインポート・選択           |
   | `triggerPermissionDialog` | コマンド入力で権限ダイアログ表示 |
   | `waitForPermissionDialog` | ダイアログ表示待機               |
   | `approvePermission`       | 「許可」クリック                 |
   | `denyPermission`          | 「拒否」クリック                 |
   | `checkRememberChoice`     | チェックボックス操作             |

2. テストデータ定数を設計

   | 定数名                   | 値                        |
   | ------------------------ | ------------------------- |
   | `TEST_SKILL_NAME`        | `"test-skill"`            |
   | `PERMISSION_TRIGGER_CMD` | `"Run dangerous command"` |
   | `DIALOG_TITLE_TEXT`      | `"権限の確認が必要です"`  |
   | `APPROVE_BUTTON_TEXT`    | `"許可"`                  |
   | `DENY_BUTTON_TEXT`       | `"拒否"`                  |

**期待される成果物**:

- `outputs/phase-2/test-utilities.md`: テストユーティリティ設計書

---

## 参照資料

| 参照資料         | パス                                                                              | 内容                   |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物   | `outputs/phase-1/`                                                                | 要件定義               |
| 元タスク仕様     | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-d-e2e-permission.md`   | テストコード雛形       |
| Vite E2E設定     | `apps/desktop/vite.e2e.config.ts`                                                 | E2E環境設定            |
| Permission型定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillPermissionRequest |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                                        | 内容                 |
| ------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | フィクスチャ設計原則 |
| 実装パターン  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン       |

---

## 成果物

| 成果物                   | パス                                   | 内容           |
| ------------------------ | -------------------------------------- | -------------- |
| テストアーキテクチャ設計 | `outputs/phase-2/test-architecture.md` | 全体構成       |
| モック戦略設計           | `outputs/phase-2/mock-strategy.md`     | API モック方式 |
| テストケース詳細設計     | `outputs/phase-2/test-case-design.md`  | 5ケース詳細    |
| テストユーティリティ設計 | `outputs/phase-2/test-utilities.md`    | ヘルパー関数   |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2での統合テスト連携アクション:**

- IPC通信モックが TASK-8C-A の統合テストパターンと整合しているか確認
- フィクスチャ利用方式が TASK-8C-E と一貫しているか確認

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点             | 適用判断                           | 仕様参照先                                   |
| ---------------- | ---------------------------------- | -------------------------------------------- |
| セキュリティ     | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX            | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ   | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                | 仕様参照先                                             |
| -------------------------- | ----------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合      | `aiworkflow-requirements: ui-ux-*.md`                  |
| IPC通信                    | Main-Renderer連携の場合 | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |

---

## 完了条件

- [ ] テストアーキテクチャ設計書が作成されている
- [ ] モック戦略設計書が作成されている
- [ ] 5件のテストケース詳細設計が完了している
- [ ] テストユーティリティ設計書が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: テストアーキテクチャ設計
3. 実行タスク2: モック戦略設計
4. 実行タスク3: テストケース詳細設計
5. 実行タスク4: テストユーティリティ設計
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

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/phase-03-design-review.md`
