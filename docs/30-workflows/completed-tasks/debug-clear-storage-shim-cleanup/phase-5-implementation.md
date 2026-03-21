# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 5                                           |
| Phase名    | 実装                                        |
| カテゴリ   | 改善                                        |
| ステータス | completed                                   |
| 前提Phase  | Phase 4                                     |
| 後続Phase  | Phase 6                                     |

## 目的

Phase 2 の変更計画に従い、`debug-clear-storage` に依存する残骸を repo 全体から削除・降格する。Phase 4 で作成した RED 状態のテストを GREEN に転換させる。

## 実行タスク

- タスク1: e2e global-setup の `debug-clear-storage` 関連コードを削除する
- タスク2: screenshot script の storage clear 前提コードを削除する
- タスク3: completed workflow docs の historical note 降格を実施する
- タスク4: `.claude/skills/` 内の workaround 説明を更新する
- タスク5: その他の stale comment / workaround を削除する

### タスク1: e2e global-setup の修正

**目的**: `apps/desktop/e2e/global-setup.ts` から `debug-clear-storage` 依存コードを除去する

**手順**:

1. `apps/desktop/e2e/global-setup.ts` を読み込む
2. `sessionStorage.setItem("debug-clear-storage", "done")` の行を削除する
3. `debug-clear-storage` を参照するコメントを削除する
4. 認証バイパス機構（`VITE_E2E_MODE` / `skipAuth`）が引き続き正常に機能することを確認する
5. 不要になった import や変数宣言があれば整理する

**変更の制約**:

- `skipAuth` / `dev-skip-auth` / `VITE_E2E_MODE` による認証バイパス機構は変更しない
- e2e テストの preflight で本当に必要な初期化処理は維持する
- 削除範囲は `debug-clear-storage` に直接関連するコードに限定する

### タスク2: screenshot script の修正

**目的**: screenshot script から `debug-clear-storage` / `localStorage.clear()` 前提のコードを除去する

**手順**:

1. Phase 1 の棚卸し結果から screenshot 関連の検出箇所を参照する
2. `localStorage.clear()` を前提とした storage clear コードを削除する
3. screenshot 取得に必要な初期化処理（bug path metadata 以外）は維持する
4. 苦戦1の教訓に従い、screenshot harness と bug path metadata を分離する

**変更の制約**:

- screenshot の基本取得機能は維持する
- CI/CD パイプラインへの影響がないことを確認する

### タスク3: completed workflow docs の降格

**目的**: 完了済みタスクの docs 内にある `debug-clear-storage` 前提の記述を historical note に降格する

**手順**:

1. `docs/30-workflows/completed-tasks/` 配下の関連ファイルを検索する
2. `debug-clear-storage` を前提とした記述を特定する
3. 記述を削除するのではなく、以下のフォーマットで historical note に降格する:

```markdown
> **Historical Note (2026-03-10)**: 以下の記述は `TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で
> 根本原因が解決済みのため、歴史的記録として残しています。現在のコードベースには該当するコードは存在しません。
```

4. `verify-unassigned-links.js` が PASS することを確認する（AC-4）

**変更の制約**:

- 完了済みタスクの成果物は削除しない（歴史的記録として価値がある）
- リンク整合性を壊さない

### タスク4: `.claude/skills/` 内の workaround 説明更新

**目的**: スキル定義内の `debug-clear-storage` に関する workaround 説明を現状に合わせて更新する

**手順**:

1. `.claude/skills/` 配下で `debug-clear-storage` を検索する
2. workaround として記述されている箇所を特定する
3. 以下のいずれかの対処を行う:
   - **解決済み記述**: `[解決済み]` プレフィックスを追加し、解決タスクID を付記する
   - **不要な記述**: 削除する
   - **教訓として有用な記述**: `lessons-learned.md` に移動またはリンクを追加する

**変更の制約**:

- スキルの挙動に影響する変更は行わない
- 教訓として有用な情報は削除ではなく適切な場所に移動する

### タスク5: その他の stale comment / workaround 削除

**目的**: タスク1〜4 以外の検出箇所（stale comment、TODO コメント等）を整理する

**手順**:

1. Phase 1 の棚卸し結果で未対処の検出箇所を確認する
2. 各箇所に対して削除/維持の判断を行う
3. `window.location.reload()` を `debug-clear-storage` と併用していたコメントがあれば削除する
4. 全変更完了後、`rg "debug-clear-storage" apps/ scripts/` で残存がないことを確認する

## 参照資料

| 参照資料       | パス                                                                           | 説明                     |
| -------------- | ------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/`          | 棚卸し結果・検出箇所一覧 |
| Phase 2 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/`          | 変更計画・副作用分析     |
| Phase 3 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-3/`          | 設計レビュー結果         |
| Phase 4 成果物 | Phase 4 のテストファイル群                                                     | RED 状態のテスト         |
| 親タスク成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/` | 親タスクの全Phase成果物  |

### システム仕様（aiworkflow-requirements）

> 実装時に以下のシステム仕様を参照し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                          | 内容                                                      |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| 状態管理設計     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Zustand persist 設計・DD-04/DD-05 persist 破壊検出ガード  |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | shared app shell での debug-only storage clear 禁止ルール |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | bug path metadata / screenshot harness 分離パターン       |
| E2Eテスト        | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`    | E2E テスト設計方針・preflight 設計                        |

## 統合テスト連携

- Phase 4 で作成した RED テストが全て GREEN に転換することを検証する
- タスク完了後、`pnpm --filter @repo/desktop exec vitest run` で全テスト PASS を確認する（P40 準拠）
- e2e テストが実行可能な環境では `pnpm --filter @repo/desktop e2e` も実行する
- Phase 6 でカバレッジ不足箇所のテスト追加を行う

## 成果物

| 成果物                                   | パス                                                      |
| ---------------------------------------- | --------------------------------------------------------- |
| e2e global-setup（修正済み）             | `apps/desktop/e2e/global-setup.ts`                        |
| screenshot script（修正済み）            | Phase 1 棚卸しで特定されたファイル群                      |
| completed workflow docs（降格済み）      | `docs/30-workflows/completed-tasks/` 配下の該当ファイル群 |
| `.claude/skills/` workaround（更新済み） | `.claude/skills/` 配下の該当ファイル群                    |

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。具体的なチェック項目はAIがタスク内容に応じて判断・適用する。

| 観点               | 適用判断                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| ローカルストレージ | localStorage / sessionStorage / Zustand persist が関係する場合（本タスク該当） |
| E2Eテスト          | e2e テストの前提条件が変更される場合（本タスク該当）                           |
| セキュリティ       | 認証バイパス機構が関係する場合（本タスク該当: skipAuth / VITE_E2E_MODE）       |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 完了条件

- [ ] Phase 4 の全 RED テストが GREEN に転換していること
- [ ] `rg "debug-clear-storage" apps/ scripts/` でソースコード内の残存が 0 件であること（AC-1）
- [ ] 不要な workaround / stale comment が削除または降格済みであること（AC-2）
- [ ] e2e global-setup が `debug-clear-storage` を前提とせず正常動作すること（AC-3）
- [ ] `verify-unassigned-links.js` が PASS すること（AC-4）
- [ ] `skipAuth` / `VITE_E2E_MODE` による認証バイパスが引き続き動作すること
- [ ] `pnpm --filter @repo/desktop exec vitest run` で全テスト PASS すること（AC-7）
- [ ] App.tsx / AuthGuard / safeInvoke に変更がないこと（スコープ外変更の排除）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。カバレッジ不足箇所のテスト追加を行う。
