# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |

## 目的

デバッグコード削除の技術的設計を行い、削除対象の正確な範囲と副作用の有無を確定する。

## 実行タスク

- タスク1: 削除対象コードの行範囲と残すコードを確定する
- タスク2: 削除による副作用を分析し、影響なしの根拠を明文化する
- タスク3: persist 状態復旧の確認手順を設計する

### タスク1: 削除対象コードの特定

**目的**: 削除すべきコードの正確な範囲を確定する

**手順**:

1. `apps/desktop/src/renderer/App.tsx` の L45-61（コメント含む）を削除対象として特定
2. 削除後の L1 `import React, { useEffect } from "react"` について、`useEffect` が他の箇所で使用されているか確認（L71, L87, L100 で使用 → import は維持）
3. `sessionStorage` が他の箇所で使用されているか確認 → App.tsx 内ではデバッグコードのみ
4. `console.log` のデバッグ出力が他に影響しないことを確認

**削除対象**:

```
L45: // デバッグ用: 初回起動時にストレージをクリア（TODO: テスト完了後に削除）
L46-61: useEffect(() => { ... }, []);
```

**維持するコード**:

```
L63以降: useThemeInitializer() および auth 初期化ロジック
```

**期待される成果物**:

- 削除対象行の確定リスト

### タスク2: 副作用分析

**目的**: 削除による副作用がないことを証明する

**分析項目**:

| 項目                     | 分析結果                                    |
| ------------------------ | ------------------------------------------- |
| useEffect import         | L71, L87, L100 で使用 → 維持                |
| sessionStorage           | デバッグコードでのみ使用 → 影響なし         |
| localStorage.clear()     | Zustand persist の状態破壊が停止 → 正の効果 |
| window.location.reload() | 不要なリロードが停止 → 正の効果             |
| VITE_E2E_MODE チェック   | デバッグコード内でのみ使用のため影響なし    |
| skipAuth=true チェック   | デバッグコード内でのみ使用のため影響なし    |

### タスク3: persist状態復旧設計

**目的**: デバッグコード削除後、persist状態が正常に機能することを確認する設計

**確認ポイント**:

1. Zustand の `persist` ミドルウェアが `localStorage` にデータを保存する仕組みの確認
2. persist hardening（TASK-07）の `customStorage` が正常に動作することの確認
3. アプリ再起動後も persist 状態が保持されることの確認手順

**設計方針**:

- 削除のみで新規コード追加は不要
- persist の動作は既存実装で保証されている
- テストで動作確認を行う

## 参照資料

| 参照資料       | パス                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-1-requirements.md` |
| App.tsx        | `apps/desktop/src/renderer/App.tsx`                                                                   |
| Store定義      | `apps/desktop/src/renderer/store/index.ts`                                                            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                          | 内容                                                                      |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| IPC永続化設計      | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`   | localStorage/electron-store を跨ぐ永続化パターンと破壊影響                |
| 状態管理設計       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Zustand persist ミドルウェア設計・localStorage 永続化戦略                 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ・リトライ戦略・BROWSER_GET_LAST_WEB_PREFERENCES エラー対処 |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | デバッグコード管理・ロギング規約・TODO コメント運用                       |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | reload と storage 初期化競合の再発条件                                    |

## 統合テスト連携

- Phase 4 でデバッグコードが存在しないことを検証するテストを作成
- Phase 5 で実際の削除を実施
- Phase 11 で persist 状態保持の手動テストを実施

## 成果物

| 成果物 | パス                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 設計書 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md` |

## 完了条件

- [ ] 削除対象コードの範囲が確定していること
- [ ] 副作用分析が完了し、負の影響がないことを確認
- [ ] persist状態復旧の確認手順が設計されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 3: 設計レビューへ進む。
