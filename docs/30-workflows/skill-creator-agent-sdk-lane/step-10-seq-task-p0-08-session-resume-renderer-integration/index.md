# TASK-P0-08: session-resume-renderer-integration

## 概要

Claude Agent SDK V2 Preview のセッション永続化・復元機能（TASK-SDK-08 で実装済み）をレンダラー側に統合する。ユーザーがアプリを閉じた際の会話状態を復元可能にし、未完了セッションの検出・復元プロンプト・セッション情報表示を提供する。

本タスクが扱うのは、アプリ再起動やウィンドウ再オープンをまたぐ永続化済みセッションの検出・復元である。会話中の一時 UI 状態保持は TASK-P0-06 の責務とし、本タスクでは扱わない。

## メタ情報

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-P0-08                                                             |
| タスク種別 | 機能追加                                                               |
| 優先度     | P0 (High)                                                              |
| ステータス | spec_created                                                           |
| 上流ゲート | なし                                                                   |
| 依存タスク | TASK-RT-06（SDK message contract）, TASK-SDK-08 は別レーンでマージ済み |
| 後続タスク | なし                                                                   |
| 作成日     | 2026-03-29                                                             |
| 更新日     | 2026-03-29                                                             |

## 受入基準

| ID   | 基準                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | 未完了セッションが検出された場合、「前回のセッションを復元しますか？」プロンプトが表示される            |
| AC-2 | セッション復元を選択すると、前回の会話状態から継続できる                                                |
| AC-3 | セッション復元をスキップすると、新規セッションが開始される                                              |
| AC-4 | アクティブセッションの ID と経過時間が UI に表示される                                                  |
| AC-5 | 古いセッション（期限切れ）は自動的にクリーンアップされる                                                |
| AC-6 | `session_id` を保存し、SDK `resume` / `continue` の入力へ正しく再利用できる                             |
| AC-7 | manifest / source snapshot 差分時に resume 可否が判定され、非互換時は新規セッションへフォールバックする |
| AC-8 | IPC 経由でセッション一覧・詳細が取得できる                                                              |
| AC-9 | セッション復元フローのユニットテストとインテグレーションテストが存在する                                |

## スコープ

**含む**:

- レンダラー側のセッション検出・復元 UI コンポーネント
- IPC ハンドラー（セッション一覧取得、セッション詳細取得、セッション復元、セッション削除）
- `session_id` / provenance snapshot / manifest hash の保存・復元契約
- SDK `resume` / `continue` / `forkSession` への入力マッピング
- 復元プロンプトコンポーネント（モーダルまたはインラインバナー）
- セッションインジケーター（アクティブセッション ID、経過時間表示）
- SkillLifecyclePanel へのセッション復元フロー統合
- 期限切れセッションのクリーンアップロジック
- preload API へのセッション関連メソッド追加
- ユニットテスト・インテグレーションテスト

**含まない**:

- セッション永続化の main プロセス側実装（TASK-SDK-08 で実装済み）
- RuntimeSkillCreatorFacade のセッション管理ロジック変更
- 会話型インタビュー UI（TASK-P0-06 の責務）
- LLM アダプターのエラーハンドリング（TASK-RT-01 の責務）
- 同一アプリセッション内だけで閉じる一時 UI 状態保持（TASK-P0-06 の責務）

## 依存関係

| 種別       | 参照先                              | 役割                                 |
| ---------- | ----------------------------------- | ------------------------------------ |
| upstream   | TASK-SDK-08（別レーン、マージ済み） | セッション永続化・復元の main 側 API |
| upstream   | TASK-RT-06                          | `session_id` と SDK result 正規化    |
| upstream   | `../root-workflow-pack/index.md`    | lane 共通不変条件                    |
| downstream | なし                                |                                      |

## 現行コードアンカー

| ファイル                                                              | 現状の役割                               | TASK-P0-08 での扱い                         |
| --------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | スキル作成 UI のメインパネル             | セッション復元フローを統合                  |
| `apps/desktop/src/renderer/components/skill/`                         | スキル関連 UI コンポーネントディレクトリ | セッション復元 UI コンポーネントを新規追加  |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | Facade（セッション管理メソッドあり）     | セッション一覧・詳細の取得を IPC 経由で公開 |
| `apps/desktop/src/main/ipc/index.ts`                                  | IPC ハンドラー                           | セッション関連 IPC ハンドラーを追加         |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | preload API 定義                         | セッション関連メソッドを追加                |
| `packages/shared/src/types/skillCreator.ts`                           | 型定義                                   | セッション一覧・復元レスポンス型を追加      |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | main 側で既に実装済みのセッション永続化を、レンダラーから使いやすい形で公開し、UX として自然な復元フローを実現すること                    |
| 依存関係・責務境界   | main 側のセッション管理は TASK-SDK-08 で完了。本タスクは IPC 公開とレンダラー UI に閉じる。同一セッション内の一時状態は TASK-P0-06 に残す |
| 価値とコストの不均衡 | 会話の途中離脱→復帰は UX の要。IPC 層の薄いラッパーとレンダラーコンポーネントで実現可能                                                   |
| 改善優先順位         | 1. IPC ハンドラー追加 2. preload API 追加 3. 復元プロンプト UI 4. セッションインジケーター 5. クリーンアップ 6. テスト                    |
| 4条件評価            | 価値性: 高（UX 直結）/ 実現性: 高（main 側は実装済み）/ 整合性: 既存 Facade を IPC 公開 / 運用性: セッション TTL でクリーン               |

## ディレクトリ構成

```text
step-10-seq-task-p0-08-session-resume-renderer-integration/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## 実装者向けクイックガイド

### 着手条件

- TASK-SDK-08 がマージ済みでセッション永続化 API が利用可能
- `RuntimeSkillCreatorFacade.ts` のセッション管理メソッドを読了している
- `SkillLifecyclePanel.tsx` の現行 UI フローを把握している
- preload API のパターンを把握している

### 想定変更ポイント

- `apps/desktop/src/main/ipc/index.ts` — セッション関連 IPC ハンドラー追加
- `apps/desktop/src/preload/skill-creator-api.ts` — セッション関連メソッド追加
- `apps/desktop/src/renderer/components/skill/` — 復元 UI コンポーネント新規作成
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — 復元フロー統合
- `packages/shared/src/types/skillCreator.ts` — セッション一覧・復元レスポンス型追加

### 非対象

- main 側セッション永続化ロジック（TASK-SDK-08 で実装済み）
- 会話型インタビュー UI（TASK-P0-06）
- エラーハンドリング（TASK-RT-01/02）

### 完了イメージ

- アプリ起動時に未完了セッションが検出され、復元プロンプトが表示される
- 「復元」を選択すると前回の会話状態から継続される
- アクティブセッション ID と経過時間がパネル上に表示される
- 24時間以上経過したセッションは自動クリーンアップされる

### 並列実行メモ

- TASK-P0-08 は他タスクと独立して着手可能（TASK-SDK-08 はマージ済み）
- `SkillLifecyclePanel.tsx` の編集は TASK-RT-03 / TASK-P0-06 と競合する可能性あり
- `ipc/index.ts` の編集は TASK-RT-01 と競合する可能性あり

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
