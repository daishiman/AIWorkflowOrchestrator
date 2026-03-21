# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 2                                           |
| Phase名    | 設計                                        |
| カテゴリ   | 改善                                        |
| ステータス | completed                                   |
| 前提Phase  | Phase 1                                     |
| 後続Phase  | Phase 3                                     |

## 目的

Phase 1 の棚卸し結果に基づき、各検出箇所への具体的な対処方法（削除 / 降格 / 維持）を設計し、変更順序と副作用分析を完了する。

## 実行タスク

- タスク1: 検出箇所ごとの具体的変更計画を策定する
- タスク2: 副作用分析を実施し、変更の安全性を証明する
- タスク3: e2e / screenshot script の設計変更を行う

### タスク1: 変更計画策定

**目的**: 棚卸し結果の各検出箇所に対し、具体的な変更内容を確定する

**手順**:

1. Phase 1 の分類結果を読み込む
2. 各検出箇所に対して以下を設計する:
   - **削除対象**: 削除行の範囲、残すコード、import整理の要否
   - **降格対象**: historical note のテンプレート文言、配置場所
   - **維持対象**: 維持理由の明文化
3. 変更の実行順序を決定する（依存関係を考慮）

**変更計画テーブル形式**:

| #   | ファイルパス    | 行範囲          | カテゴリ        | 対処           | 変更内容         | 依存関係           |
| --- | --------------- | --------------- | --------------- | -------------- | ---------------- | ------------------ |
| 1   | (Phase 1で確定) | (Phase 1で確定) | (Phase 1で確定) | 削除/降格/維持 | (具体的変更内容) | (他の変更への依存) |

### タスク2: 副作用分析

**目的**: 各変更が既存動作に悪影響を与えないことを証明する

**分析項目**:

| 分析対象                     | 確認内容                                                         |
| ---------------------------- | ---------------------------------------------------------------- |
| e2e テスト実行               | `debug-clear-storage` 関連の preflight 削除後も e2e が動作するか |
| screenshot script            | storage clear 前提の除去後もスクリーンショット取得が可能か       |
| completed workflow docs      | historical note 降格がリンク整合性に影響しないか                 |
| `.claude/skills/` 内の記述   | workaround 説明の削除/降格が他スキルに影響しないか               |
| `skipAuth` / `dev-skip-auth` | 既存の認証バイパス機構に影響しないか                             |

**各変更の安全性判定基準**:

- **安全**: 削除しても他のコード/テストに影響なし
- **要注意**: 削除すると関連テストの更新が必要
- **不可**: 削除すると本番動作に影響あり（維持対象に再分類）

### タスク3: e2e / screenshot script 設計変更

**目的**: `debug-clear-storage` に依存する e2e / screenshot のコードを現行前提に合わせて再設計する

**手順**:

1. `apps/desktop/e2e/global-setup.ts` の `sessionStorage.setItem("debug-clear-storage", "done")` の役割を分析する
2. 本当に必要な preflight（認証バイパス等）と不要な storage clear 前提を分離する
3. 不要な preflight は削除、必要な認証バイパスは `skipAuth` / `VITE_E2E_MODE` で代替する設計を行う
4. screenshot script が `localStorage.clear()` を前提としている箇所を特定し、代替設計を策定する

**設計方針**:

- `debug-clear-storage` への参照は全て除去する
- e2e の認証バイパスは `VITE_E2E_MODE` または `skipAuth=true` に統一する
- screenshot harness は bug path metadata と分離する（苦戦1の教訓適用）

## 参照資料

| 参照資料       | パス                                                                                                                                           | 説明                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/`                                                                          | 棚卸し結果・分類結果 |
| 親タスク設計書 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md`                                                | 親タスクの設計方針   |
| 苦戦カード     | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-fix-debug-clear-storage-shim-cleanup-001.md` | 苦戦1-3の教訓        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                          | 内容                                                      |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| 状態管理設計     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Zustand persist 設計・DD-04/DD-05 persist 破壊検出ガード  |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | shared app shell での debug-only storage clear 禁止ルール |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | bug path metadata / screenshot harness 分離パターン       |
| E2Eテスト        | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`    | E2E テスト設計方針・preflight 設計                        |

## 統合テスト連携

- Phase 4 で変更計画の各項目に対応するテストケースを設計する
- Phase 5 で設計に沿った変更を実施する
- Phase 6 で e2e / screenshot の統合テストを拡充する

## 成果物

| 成果物       | パス                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 設計書       | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/architecture-design.md`  |
| 変更計画書   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/change-plan.md`          |
| 副作用分析書 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/side-effect-analysis.md` |

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

- [ ] 全検出箇所に対する具体的変更計画が策定されていること
- [ ] 副作用分析が完了し、各変更の安全性が判定されていること
- [ ] e2e / screenshot script の設計変更が完了していること
- [ ] 変更の実行順序が確定していること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 3: 設計レビューへ進む。
