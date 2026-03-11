# Phase 5: 実装

## メタ情報

| 項目         | 内容                    |
| ------------ | ----------------------- |
| Phase        | 5                       |
| Phase名      | 実装                    |
| 前提Phase    | Phase 4                 |
| 後続Phase    | Phase 6                 |
| ステータス   | completed               |
| 作成日       | 2026-03-11              |
| 担当SubAgent | SubAgent-B / SubAgent-C |

## 目的

`DashboardView` をホーム画面仕様へ更新し、
view-local components と既存 atoms で実装を完了できる手順を固定する。

## 実行タスク

- Container 整理: `DashboardView/index.tsx` を container 化する
- View-local 分割: components / helper を追加する
- UI 差し替え: 旧統計 UI を削除し、新 UI を接続する

## 参照資料

| 参照資料           | パス                                                                         | 内容                                  |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------- |
| Phase 2仕様        | `phase-2-design.md`                                                          | container / local component 設計      |
| Phase 2成果物      | `outputs/phase-2/*.md`                                                       | 実装設計                              |
| Phase 4仕様        | `phase-4-test-creation.md`                                                   | RED で定義したケース                  |
| Atoms 実装パターン | `.agents/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`  | SuggestionBubble / EmptyState 制約    |
| UI構造ルール       | `.agents/skills/aiworkflow-requirements/references/arch-ui-components.md`    | atom / molecule / organism 境界       |
| ディレクトリ構造   | `.agents/skills/aiworkflow-requirements/references/directory-structure.md`   | view-local components / helper 配置先 |
| 状態管理           | `.agents/skills/aiworkflow-requirements/references/arch-state-management.md` | selector 利用                         |
| エラーハンドリング | `.agents/skills/aiworkflow-requirements/references/error-handling.md`        | fallback UI 方針                      |
| セキュリティ原則   | `.agents/skills/aiworkflow-requirements/references/security-principles.md`   | 新規 IPC / Preload 追加禁止           |

## 実行手順

### ステップ1: container を整理する

- `useDisplayName` と dashboard state の取得を `DashboardView` に集約する
- suggestion definitions と route handlers を helper / container に閉じる

### ステップ2: UI を差し替える

- 旧 header / stats / recent activity panel を削除する
- GreetingHeader / SuggestionSection / RecentTimeline / EmptyState を接続する

### ステップ3: 導線を固定する

- CTA は既存 `setCurrentView` のみを呼ぶ
- 共有 nav contract は変更しない

## 統合テスト連携

| 観点   | 内容                                |
| ------ | ----------------------------------- |
| 見た目 | skeleton / empty / normal の 3 状態 |
| 導線   | CTA クリック後の `setCurrentView`   |
| 境界   | `dashboard` ID と表示文言の分離     |

## 多角的チェック観点

| 観点               | 適用判断                                                  | 仕様参照先                                          |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------- |
| UI/UX              | 画面差し替えのため適用                                    | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ     | component 境界実装のため適用                              | `aiworkflow-requirements: architecture-*.md`        |
| セキュリティ       | 既存 Renderer 契約の内側で閉じるため適用                  | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | loading / empty / invalid data の UI に適用               | `aiworkflow-requirements: error-handling.md`        |
| アクセシビリティ   | button / time / region 実装確認で適用                     | `aiworkflow-requirements: testing-accessibility.md` |
| テスタビリティ     | container / helper / component を分離して実装するため適用 | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物       | パス                                        | 内容     |
| ------------ | ------------------------------------------- | -------- |
| 実装計画     | `outputs/phase-5/implementation-plan.md`    | 実装順序 |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更概要 |

## 完了条件

- [x] 旧統計 UI が削除対象として明記されている
- [x] 新 component 配置と接続順が定義されている
- [x] selector 利用と route 境界が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. container 実装
3. component 実装
4. 導線接続
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] コード成果物の配置先が `apps/desktop/src/renderer/...` と明記されている
- [x] 実装サマリー成果物が定義されている
- [x] `artifacts.json` の Phase 5 記述と整合している

## 次のPhase

Phase 6: テスト拡充
