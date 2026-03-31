# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 1                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

現状の `evaluate-ui-ux-playwright-e2e.ts` スクリプトおよびE2Eテストインフラの現状を分析し、
「動的・再利用可能なUI/UX 3層評価フレームワーク」の要件を確定する。

## 実行タスク

- 既存 E2E テストインフラの現状調査
- スケルトン箇所の特定と影響範囲の確認
- 動的テストフレームワークの受け入れ条件の定義
- テスト対象コンポーネントの優先度づけ
- 既存実装を patch で閉じるか再構成するかの判断基準を整理する

## 参照資料

| 資料名               | パス                                                                                 | 説明               |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| 既存 E2E スクリプト  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 現状把握           |
| 既存 Playwright 設定 | `apps/desktop/playwright.config.ts`                                                  | project 有無の確認 |
| 既存 E2E ヘルパー    | `apps/desktop/e2e/helpers/electron-app.ts`                                           | 再利用候補         |

## 実行手順

1. 対象ファイルの現状を確認する。
2. ハードコード箇所と影響範囲を洗い出す。
3. 受け入れ条件とスコープ外を固定する。
4. Phase 2 へ渡すための契約をまとめる。

## 統合テスト連携

- Phase 1 は統合テストの前提を固定する
- 実行結果は Phase 4 以降のテスト設計へ引き継ぐ

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                |
| ---------- | --------------------------------------- |
| 論理分析   | 要件と現状分析に矛盾がないか            |
| 構造分解   | FR / NFR / scope out が分離されているか |
| システム   | Phase 4 以降の前提が閉じているか        |
| 戦略・価値 | 新規画面追加時のコストが下がるか        |

## サブタスク管理

1. 現状調査
2. 受け入れ条件整理
3. 破棄判断基準整理
4. Phase 2 への引き継ぎ

## 現状分析

### 調査結果サマリー

| 調査項目                          | 現状                                                  | 問題/ギャップ                            |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| evaluate-ui-ux-playwright-e2e.ts  | multi_select 機能向けにハードコード（M11-1〜M11-4）   | 新機能への汎用性なし                     |
| playwright.config.ts プロジェクト | `chromium` のみ定義                                   | `ui-ux-layer1` / `ui-ux-layer2` が未定義 |
| 既存 E2E テスト数                 | 15 スペックファイル                                   | UI/UX品質評価専用スイートが存在しない    |
| Visual baseline 画像              | settings/skill 系スクリーンショットのみ存在           | SEM/VIS 系 baseline が未生成             |
| ANTHROPIC_API_KEY 依存            | テスト起動時に実APIキーを参照しようとする可能性あり   | CI環境でテストが失敗するリスク           |
| Electron 起動ヘルパー             | `apps/desktop/e2e/helpers/electron-app.ts` に実装済み | 既存実装を再利用できる                   |
| UIコンポーネント数                | 425個（Atoms/Molecules/Organisms）                    | 全対象は非現実的。優先対象の選定が必要   |

### 既存 E2E インフラの活用可能点

```
apps/desktop/e2e/
├── helpers/
│   └── electron-app.ts      ← launchElectronApp / closeElectronApp 再利用可能
├── mocks/
│   └── electronAPI.mock.ts  ← 23カテゴリのモック再利用可能
├── global-setup.ts           ← 認証モック / localStorage注入 再利用可能
└── pages/
    └── *.ts                  ← Page Object パターン再利用可能
```

### 動的テストフレームワークの要件ギャップ

現在の `evaluate-ui-ux-playwright-e2e.ts` は：

- テスト対象（セレクタ・URL）がソースコードにハードコードされている
- 新機能追加のたびに TypeScript ファイルを直接編集する必要がある
- 「どの画面を評価するか」の設定と「評価ロジック」が分離されていない

## 要件定義

### 機能要件

#### FR-001: Playwright プロジェクト分離

- `playwright.config.ts` に `ui-ux-layer1`（Semantic）と `ui-ux-layer2`（Visual）プロジェクトを追加
- 既存の `chromium` プロジェクトには影響を与えない
- `--project=ui-ux-layer1` / `--project=ui-ux-layer2` で個別実行できること

#### FR-002: 動的テスト対象設定

- テスト対象画面・コンポーネントを `test-targets.config.ts` に集約する
- 新しい画面を追加する際はこの設定ファイルのみを変更する
- 各テスト対象には以下の情報を含む：
  - `id`: テスト対象識別子（例: `chat-main`, `skill-list`）
  - `navigation`: 対象画面への移動方法（`url` または `action`）
  - `description`: テスト対象の説明
  - `layer1`: Layer 1 テストの有効/無効フラグ
  - `layer2`: Layer 2 テストの有効/無効フラグ
  - `semanticTargets`: 検証対象の ARIA ロール・属性リスト

#### FR-003: Layer 1 Semantic テスト（SEM-001〜007）

| テストID | 検証内容                                                                          | 優先度 |
| -------- | --------------------------------------------------------------------------------- | ------ |
| SEM-001  | インタラクティブ要素に `role` 属性が存在する                                      | 高     |
| SEM-002  | ボタン・リンクに `aria-label` または可視テキストが存在する                        | 高     |
| SEM-003  | フォーム要素に `aria-describedby` または `label` が関連付けられている             | 高     |
| SEM-004  | `Tab` キーで全インタラクティブ要素にフォーカス移動できる                          | 高     |
| SEM-005  | `tabindex` の順序が視覚的な並びと一致している                                     | 中     |
| SEM-006  | モーダル・ダイアログが開いている間、背後の要素がフォーカス不可になる              | 中     |
| SEM-007  | エラー状態時に `aria-live` または `role="alert"` でスクリーンリーダーに通知される | 中     |

#### FR-004: Layer 2 Visual regression テスト（VIS-001〜007）

この 7 件は Phase 4 の `test-targets.config.ts` 初期対象と 1:1 で対応させる。

| テストID | 検証内容                                   | 閾値             |
| -------- | ------------------------------------------ | ---------------- |
| VIS-001  | チャット画面のフルページスクリーンショット | maxDiffPixels=50 |
| VIS-002  | スキル一覧画面                             | maxDiffPixels=50 |
| VIS-003  | 設定画面（一般タブ）                       | maxDiffPixels=50 |
| VIS-004  | サイドバーナビゲーション                   | maxDiffPixels=30 |
| VIS-005  | エラー表示コンポーネント                   | maxDiffPixels=20 |
| VIS-006  | ローディング状態                           | maxDiffPixels=20 |
| VIS-007  | ダークモード（テーマ切り替え後）           | maxDiffPixels=50 |

#### FR-005: APIキー非依存

- テスト実行時に `ANTHROPIC_API_KEY=dummy` を自動設定する
- LLM を呼び出すパスは electronAPI モックでスタブ化する
- API キーが未設定でもテスト全体が完走すること

### 非機能要件

| NFR-ID  | 要件                                                                   |
| ------- | ---------------------------------------------------------------------- |
| NFR-001 | Layer 1 テスト実行時間: 1画面あたり 10秒以内                           |
| NFR-002 | Layer 2 テスト実行時間: 1画面あたり 15秒以内（スクリーンショット込み） |
| NFR-003 | CI 環境（GitHub Actions）で安定して完走すること                        |
| NFR-004 | baseline 画像はリポジトリにコミットし、PR でレビュー可能であること     |
| NFR-005 | 新しい対象画面の追加に要する変更は `test-targets.config.ts` のみ       |

### スコープ外

- Layer 3 AI UX 評価（LLM を使った自動評価）は本タスクのスコープ外
- パフォーマンステスト（ロード時間計測）はスコープ外
- モバイル / レスポンシブ対応のビジュアルテストはスコープ外

## 受け入れ条件

```
Given: AIWorkflowOrchestrator デスクトップアプリが起動している
When: pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer1 を実行する
Then: SEM-001〜007 の全テストが PASS する

Given: Visual baseline 画像が初回生成済みである
When: pnpm --filter @repo/desktop test:e2e -- --project=ui-ux-layer2 を実行する
Then: VIS-001〜007 の全テストが PASS する（閾値内の差分）

Given: test-targets.config.ts に新しい対象画面エントリを追加した
When: テストを実行する
Then: 追加した画面に対して SEM/VIS テストが自動的に実行される

Given: ANTHROPIC_API_KEY が設定されていない環境
When: テストスイートを実行する
Then: 全テストが正常に完走する（API キーエラーで中断しない）
```

## 成果物

| 成果物                   | パス                                      | 説明                         |
| ------------------------ | ----------------------------------------- | ---------------------------- |
| 現状分析レポート         | outputs/phase-1/current-state-analysis.md | スケルトン箇所・インフラ調査 |
| 要件定義書（本ファイル） | phase-1-requirements.md                   | FR/NFR・受け入れ条件         |

## 完了条件

- [x] 既存 E2E インフラの現状分析が完了している
- [x] `playwright.config.ts` に `ui-ux-layer1` / `ui-ux-layer2` が未定義であることを確認した
- [x] SEM-001〜007 / VIS-001〜007 の要件が定義されている
- [x] 動的テスト対象設定（`test-targets.config.ts`）の要件が明確である
- [x] APIキー非依存の要件が定義されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 現状分析と要件定義が矛盾なくまとまっている
- [ ] Phase 2 へ渡す受け入れ条件が固定されている
- [ ] patch / 再構成の判断基準が残っている

## 次のPhase

Phase 2: 設計
