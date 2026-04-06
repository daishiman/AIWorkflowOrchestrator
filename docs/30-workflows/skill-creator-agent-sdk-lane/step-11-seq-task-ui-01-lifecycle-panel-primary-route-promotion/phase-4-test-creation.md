# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| Phase名    | テスト作成                              |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 3: 設計レビュー                   |
| 次Phase    | Phase 5: 実装                           |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

Phase 2 の設計に基づき、ルーティング変更・ナビゲーション定義変更のテストを TDD アプローチで先行作成する。実装前にテストを書くことで、受入条件を検証可能な形に落とし込む。

## 実行タスク

### Task 1: ルーティングテスト作成

- メインナビゲーション「スキル作成」→ SkillLifecyclePanel への直接遷移テスト（AC-1 対応）
- SkillCreateWizard への既存導線維持テスト（AC-2 対応）
- SkillManagementPanel → LifecyclePanel 導線維持テスト（AC-2 対応）
- 不明なルートへの fallback テスト

### Task 2: normalizeSkillLifecycleView() テスト作成

- 新ルートからのアクセス時の正規化テスト（AC-3 対応）
- 既存ルートからのアクセス時の正規化テスト（AC-3 対応）
- 未定義ビュー値の fallback テスト
- エッジケース（null, undefined, 空文字）のテスト

### Task 3: ナビゲーション定義テスト作成

- `skillLifecycleJourney.ts` の一次導線エントリが存在することのテスト（AC-4 対応）
- ナビゲーション遷移パターンの整合性テスト
- デスクトップ/モバイル両方のナビゲーション定義テスト（AC-5 対応）

### Task 4: テストマトリクス作成

- テストケース一覧を `outputs/phase-4/test-matrix.md` にまとめる
- AC-1〜AC-6 との対応関係を明記する

## 参照資料

| 資料名                | パス                                                            | 説明                           |
| --------------------- | --------------------------------------------------------------- | ------------------------------ |
| Phase 2 設計文書      | `outputs/phase-2/design-document.md`                            | テスト対象の設計               |
| Phase 3 レビュー結果  | `outputs/phase-3/design-review-gate.md`                         | レビュー指摘事項の反映確認     |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                             | テスト対象のルート定義         |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | テスト対象のナビゲーション定義 |

## 実行手順

### ステップ1: テストファイル作成

1. ルーティングテストファイルを作成
2. `normalizeSkillLifecycleView()` のユニットテストを作成
3. ナビゲーション定義のユニットテストを作成

### ステップ2: テスト実行確認

1. 作成したテストが正しく fail することを確認（TDD: Red フェーズ）
2. テストの意図が明確であることを確認

### ステップ3: テストマトリクス文書化

1. テストケースと AC の対応表を作成

## 成果物

| 成果物           | パス                             | 説明                        |
| ---------------- | -------------------------------- | --------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | テストケース一覧、AC 対応表 |

## 完了条件

- [ ] ルーティングテストが作成されている
- [ ] normalizeSkillLifecycleView() テストが作成されている
- [ ] ナビゲーション定義テストが作成されている
- [ ] テストが正しく fail する（TDD Red フェーズ）
- [ ] AC-1〜AC-6 との対応表が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
