# Phase 1: 要件定義

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 1                               |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI   |
| 作成日   | 2026-03-23                      |
| 検出元   | TASK-SC-05-IMPROVE-LLM Phase 12 |
| 優先度   | Medium                          |

## 目的

`RuntimeSkillCreatorFacade.applyImprovement()` が Main Process に実装済みであるにもかかわらず、Renderer 側で改善提案を一覧表示・個別承認・適用する UI コンポーネントが存在しない問題を解決する。IPC ハンドラ `skill-creator:apply-improvement` の登録、Preload API への `applyImprovement` メソッド追加、および Renderer UI コンポーネントの新規作成を行う。

### P50: 既実装状態の調査

- `RuntimeSkillCreatorFacade.applyImprovement()` は `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L309-352 に実装済み（Main Process 側のみ）
- IPC ハンドラ `skill-creator:apply-improvement` は未登録（本タスクのスコープ）
- Preload API `applyRuntimeImprovement` は未実装（本タスクのスコープ）
- Renderer コンポーネントは未作成（本タスクのスコープ）
- 結論: IPC/Preload/Renderer の3層が未実装であり、新規実装タスクとして進行する

## 背景

- `RuntimeSkillCreatorFacade.applyImprovement()` は `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L309-352 に実装済み
- `RuntimeSkillCreatorImproveSuggestion` 型（section/before/after/reason）は `packages/shared/src/types/skillCreator.ts` L352-357 に定義済み
- `ApplyImprovementResult` 型（applied/skipped/skippedDetails/errors）は `packages/shared/src/types/skillCreator.ts` L371-376 に定義済み
- IPC チャンネル `SKILL_CREATOR_IMPROVE_SKILL` は登録済みだが、`applyImprovement` 専用のチャンネルは未登録
- Preload API の `skill-api.ts` には既存の `applyImprovements`（SkillImprover 用）が存在するが、Runtime Skill Creator 用の Preload API は `skill-creator-api.ts` に集約されており、`applyImprovement` は未実装

## 要件一覧

### FR-1: IPC ハンドラ登録

- `skill-creator:apply-improvement` チャンネルを `channels.ts` に追加する
- `creatorHandlers.ts` に `skill-creator:apply-improvement` ハンドラを登録する
- ハンドラは `RuntimeSkillCreatorFacade.applyImprovement(skillName, suggestions)` に委譲する
- P42 準拠の3段バリデーション（型チェック/空文字列/トリム空文字列）を `skillName` に適用する
- `suggestions` は `Array.isArray()` で実行時型検証する
- 各 suggestion の `section`/`before`/`after`/`reason` は `typeof === "string"` で検証する
- `ALLOWED_INVOKE_CHANNELS` ホワイトリストにチャンネルを追加する
- `suggestions` 配列の要素数が 100 を超える場合はバリデーションエラーを返す（DoS 防御）

### FR-2: Preload API 追加

- `skill-creator-api.ts` の Runtime Skill Creator セクションに `applyImprovement` メソッドを追加する
- メソッドシグネチャ: `applyImprovement(skillName: string, suggestions: RuntimeSkillCreatorImproveSuggestion[]) => Promise<ApplyImprovementResult>`
- `safeInvoke` を使用し、`IPC_CHANNELS` 定数でチャンネル名を参照する
- `preload/types.ts` の `ElectronAPI` 型定義に `applyImprovement` を追加する

### FR-3: 改善提案一覧コンポーネント

- `ImprovementProposalList` コンポーネント（organisms レベル）を新規作成する
- 各提案に以下を表示する:
  - `section`: セクション名（ヘッダー表示）
  - `before`: 変更前テキスト（赤系背景のコードブロック）
  - `after`: 変更後テキスト（緑系背景のコードブロック）
  - `reason`: 変更理由（説明テキスト）
- 各提案にチェックボックスを配置し、承認/拒否を個別に選択可能にする
- 「全選択」「全解除」ボタンを上部に配置する

### FR-4: 適用フロー UI

- 「選択した提案を適用」ボタンを配置する
- ボタン押下時、選択済みの提案のみを `applyImprovement` に送信する
- 適用中はローディングインジケーターを表示する
- 適用結果（applied 件数/skipped 件数/エラー詳細）をユーザーに表示する
- 0 件選択時はボタンを disabled にする

### FR-5: エラーハンドリング

- IPC 通信失敗時はエラーメッセージを表示する
- `applyImprovement` の `errors` 配列が空でない場合は個別エラーを表示する
- `skippedDetails` の各項目（section + reason）をスキップ理由として表示する

## 非機能要件

### NFR-1: セキュリティ

- IPC ハンドラで `validateIpcSender` による送信元検証を実施する
- エラーメッセージは `sanitizeErrorMessage` でサニタイズしてから Renderer に返す
- `suggestions` 配列の各要素を個別に型検証する（P48 準拠: non-null assertion 禁止）

### NFR-2: UI/UX

- Apple HIG 準拠のデザイン（角丸 8-12px、8px グリッド、繊細な影）
- ライト/ダークモード両対応（CSS 変数ベース）
- diff 表示は before/after の対比が一目で分かるレイアウトにする
- アニメーションは 200-300ms、ローディングフィードバックを提供する
- WCAG 2.1 AA 準拠（コントラスト比 4.5:1 以上）

### NFR-3: パフォーマンス

- 提案リストは `React.memo` で不要な再レンダーを防止する
- 大量提案（20 件以上）でもスクロール性能を維持する

## 受入基準

- [ ] `skill-creator:apply-improvement` IPC チャンネルが `channels.ts` に定義されている
- [ ] `creatorHandlers.ts` にハンドラが登録され、P42 準拠バリデーションが実装されている
- [ ] `unregisterRuntimeSkillCreatorHandlers` でハンドラが解除される
- [ ] Preload API に `applyRuntimeImprovement` メソッドが追加されている
- [ ] `ALLOWED_INVOKE_CHANNELS` にチャンネルが追加されている
- [ ] 改善提案一覧が section/before/after/reason を diff 形式で表示する
- [ ] 個別提案の承認/拒否がチェックボックスで選択可能である
- [ ] 承認した提案のみが SKILL.md に適用される
- [ ] 適用結果（applied/skipped/errors）がユーザーに表示される
- [ ] 0 件選択時に「適用」ボタンが disabled になる
- [ ] ライト/ダークモード両対応している
- [ ] 全テストが PASS する

## 修正対象ファイル

### 既存ファイル（修正）

| ファイルパス                                    | 修正内容                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_APPLY_IMPROVEMENT` チャンネル定義追加 + `ALLOWED_INVOKE_CHANNELS` 追加 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `skill-creator:apply-improvement` ハンドラ登録 + unregister 追加                      |
| `apps/desktop/src/preload/skill-creator-api.ts` | `applyRuntimeImprovement` メソッド追加                                                |
| `apps/desktop/src/preload/types.ts`             | `ElectronAPI` 型に `applyImprovement` 追加（該当セクションが存在する場合）            |
| `apps/desktop/src/preload/types.ts`             | `ElectronAPI` 型定義に `applyRuntimeImprovement` メソッドの型追加                     |

### 新規ファイル

| ファイルパス                                                              | 内容                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalList.tsx`  | 改善提案一覧コンポーネント（organisms）               |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalItem.tsx`  | 改善提案個別アイテム（molecules）                     |
| `apps/desktop/src/renderer/components/skill/ImprovementApplyResult.tsx`   | 適用結果表示コンポーネント（molecules）               |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | 改善提案パネル（organisms / 状態管理 + 接続ポイント） |

## 参照パターン（既知の落とし穴）

| パターンID | タイトル                   | 適用箇所                                          |
| ---------- | -------------------------- | ------------------------------------------------- |
| P23        | API 二重定義の型管理       | Preload/Main 型定義同時更新                       |
| P32        | 型定義の二箇所同時更新     | shared/types + preload/types                      |
| P42        | trim バリデーション漏れ    | IPC ハンドラの skillName 検証                     |
| P44        | IPC インターフェース不整合 | ハンドラ引数形式と Preload 呼び出し形式の一致確認 |
| P47        | CSS 変数テスト戦略         | diff 表示スタイルのテスト                         |
| P48        | non-null assertion 禁止    | IPC レスポンスの安全な型検証                      |
| P60        | IPC 応答形式不一致         | wrapper 形式 `{ success, data, error }` の統一    |
| P65        | dead-end namespace         | 既存 `skill-creator:*` namespace への統合         |

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L309-352（applyImprovement 実装）
- `packages/shared/src/types/skillCreator.ts` L352-376（型定義）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（既存 runtime ハンドラパターン）
- `apps/desktop/src/preload/channels.ts`（チャンネル定義）
- `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`（既存 UI パターン参照）
- `.claude/rules/01-architecture.md`（UI/UX デザイン哲学）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）

## 成果物

- 本ファイル（`phase-01-requirements.md`）

## 統合テスト連携

本 Phase（要件定義）では統合テスト対象を特定する:

- IPC ハンドラ ↔ Preload API の引数形式一致テスト（P44 準拠）
- Preload API → Renderer コンポーネントの Props 型互換テスト
- 統合テスト（I-1 ~ I-3）で E2E フロー検証

## 多角的チェック観点

| 観点           | 適用判断                        | 仕様参照先                                          |
| -------------- | ------------------------------- | --------------------------------------------------- |
| セキュリティ   | IPC ハンドラ入力検証            | `aiworkflow-requirements: security-electron-ipc.md` |
| UI/UX          | diff 表示 + Apple HIG 準拠      | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ | 3層分離（IPC/Preload/Renderer） | `aiworkflow-requirements: architecture-*.md`        |
| IPC通信        | チャンネル定義 + ホワイトリスト | `aiworkflow-requirements: api-*.md`                 |
| Preload        | contextBridge API 公開          | `aiworkflow-requirements: security-api-electron.md` |

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成:

1. 参照資料の確認（既存ハンドラパターン + 型定義の所在確認）
2. P50 既実装状態の調査
3. 要件抽出（FR-1 ~ FR-5, NFR-1 ~ NFR-3）
4. 受入基準の定義
5. 修正対象ファイルの特定

## タスク100%実行確認

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 完了条件

- [x] 要件一覧（FR-1 ~ FR-5）が定義されている
- [x] 非機能要件（NFR-1 ~ NFR-3）が定義されている
- [x] 受入基準がチェックリスト形式で記載されている
- [x] 修正対象ファイル・新規ファイルが列挙されている
- [x] 参照パターン（P23/P32/P42/P44/P47/P48/P60/P65）が特定されている

## 次の Phase

Phase 2: 設計
