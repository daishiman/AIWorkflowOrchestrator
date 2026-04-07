# ConversationPanel 孤立解消 - タスク指示書

## メタ情報

```yaml
task_id: TASK-UI-02
task_name: conversation-panel-orphan-resolution
category: UI コンポーネント統合
target_feature: SkillCreatorConversationPanel / ConversationalInterview 統合
priority: 高（P0）
scale: 中規模
status: 未実施（spec_created）
source: UI/UX ナビゲーション監査
created_date: 2026-04-06
step: TASK-UI-01 完了後に直列実行
dependencies:
  - TASK-UI-01（SkillLifecyclePanel 一次導線昇格）
```

| 項目         | 値                                                           |
| ------------ | ------------------------------------------------------------ |
| タスクID     | TASK-UI-02                                                   |
| タスク名     | ConversationPanel 孤立解消                                   |
| 分類         | UI コンポーネント統合                                        |
| 対象機能     | SkillCreatorConversationPanel / ConversationalInterview 統合 |
| 優先度       | 高（P0）                                                     |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施（spec_created）                                       |
| 発見元       | UI/UX ナビゲーション監査                                     |
| 発見日       | 2026-04-06                                                   |
| Step         | TASK-UI-01 完了後に直列実行                                  |
| 依存タスク   | TASK-UI-01（SkillLifecyclePanel 一次導線昇格）               |

---

## 1. Why

### 1.1 背景

`SkillCreatorConversationPanel.tsx` は会話型スキル作成 UI として完全実装済みだが、`App.tsx` にルートが存在せず、ユーザーがアプリ内から一切到達できない孤立状態にある。現在は Phase-11 デモ HTML からのみ参照されており、本番運用上は完全に死んだコードとなっている。

一方、`SkillLifecyclePanel` には既存の会話型 UI として `ConversationalInterview.tsx` が埋め込まれており、2 つの会話型 UI がコードも IPC パスも共有せずに並立している。`SkillCreatorConversationPanel` は `window.skillCreatorSessionAPI`（session IPC）を使用し、`ConversationalInterview` は runtime IPC パスを使用するという二重構造が生まれている。

TASK-UI-01 で `SkillLifecyclePanel` への一次導線が確立されたことにより、本タスクで `ConversationPanel` の孤立解消に着手できる状態になった。

### 1.2 問題点・課題

- `SkillCreatorConversationPanel.tsx` が `App.tsx` の `renderView()` switch にも `BrowserRouter` ルートにも登録されておらず、正規のナビゲーション経路が存在しない
- `store/types.ts` の `ViewType` union 型に `"skillCreatorConversation"` 相当のエントリがなく、`setCurrentView()` での遷移が型安全に行えない
- `window.skillCreatorSessionAPI`（session IPC）と `ConversationalInterview` が使用する runtime IPC の二重構造が存在し、どちらを主系とするかの設計方針が未決定
- `QuestionCard.tsx` などの共有可能なサブコンポーネントが `SkillCreatorConversationPanel` 専用として配置されており、`ConversationalInterview` 側から再利用されていない
- デモ HTML（Phase-11 向け）のみが `SkillCreatorConversationPanel` を参照しており、本番コードに孤立した参照が残存している

### 1.3 放置した場合の影響

- 完全実装済みのコンポーネントが永遠に死蔵され、開発コストが無駄になる
- session IPC と runtime IPC の二重構造が温存され、将来的な IPC 設計の複雑化につながる
- `QuestionCard` 等の共有コンポーネントが再利用されないまま、類似実装が乱立するリスクがある
- ナビゲーション断絶が残存し、ユーザーが会話型スキル作成フローに到達できないまま本番リリースされる可能性がある

---

## 2. What

### 2.1 達成目標

- `SkillCreatorConversationPanel` が正式なルートまたは統合先を持ち、アプリ内から到達可能になる
- session IPC（`window.skillCreatorSessionAPI`）と runtime IPC の使い分けが設計として明確化される
- `QuestionCard` 等の共有可能なコンポーネントが整理され、両 UI で再利用可能な状態になる
- デモ HTML の孤立した参照がクリーンアップされる
- 既存テストがすべて PASS する

### 2.2 最終ゴール

1. `App.tsx` の `renderView()` または BrowserRouter ルートに `SkillCreatorConversationPanel` のエントリが追加される（統合の場合は `ConversationalInterview` との統合でも可）
2. `store/types.ts` の `ViewType` が必要に応じて更新され、型安全な遷移が可能になる
3. session IPC と runtime IPC の主系・副系が設計レビューで決定・文書化される
4. `QuestionCard` 等の共有コンポーネントが整理される
5. `pnpm --filter @repo/desktop typecheck` および `pnpm --filter @repo/desktop lint` がエラーなし
6. `pnpm --filter @repo/desktop test` が全 PASS

### 2.3 スコープ

#### 含むもの

- `App.tsx` へのルート追加または `ConversationalInterview` との統合実装
- `store/types.ts` の `ViewType` 型更新（必要な場合）
- session IPC と runtime IPC の使い分け設計の明確化・文書化
- `QuestionCard` 等の共有コンポーネントの整理（再配置または再利用化）
- デモ HTML の孤立参照クリーンアップ
- 影響範囲のテスト維持・追加

#### 含まないもの

- 新規 IPC チャネルの設計（既存パスの整理のみ）
- `SkillLifecyclePanel` の全面再設計
- Electron メインプロセスの大規模改修
- `ConversationalInterview` 内のインタビューロジック変更

---

## 3. How（前提条件: TASK-UI-01 完了）

### 3.1 前提条件

- **TASK-UI-01 完了**: `SkillLifecyclePanel` への一次導線（`ViewType: "skillLifecycle"` + `renderView()` への登録）が実装済みであること
- `App.tsx` の現行ルーティング構造（`renderView()` switch + BrowserRouter ルート）が把握されていること
- `window.skillCreatorSessionAPI` の IPC 契約（`apps/desktop/src/preload/skill-creator-api.ts`）が把握されていること

### 3.2 現状アーキテクチャの理解

#### App.tsx のルーティング構造

`App.tsx` には 2 種類のルーティング機構がある：

1. **BrowserRouter ルート**（`/advanced/*`、`/chat/history/*` 等）: URL ベースの直接ルーティング。スタンドアロンビューや E2E テスト向けページに使用。
2. **`renderView()` switch 文**（ViewType ベース）: `store` の `currentView` に応じて描画コンポーネントを切り替える。メインアプリの画面遷移に使用。

`SkillCreatorConversationPanel` は現在どちらにも登録されていない。追加方法は以下の 2 択：

- **Option A**: `ViewType` に `"skillCreatorConversation"` を追加し、`renderView()` に case を追加する
- **Option B**: `ConversationalInterview` に統合し、`skillLifecycle` ビュー内での会話フローとして提供する

#### session IPC と runtime IPC の二重構造

```typescript
// SkillCreatorConversationPanel が使用（session IPC）
window.skillCreatorSessionAPI.onUserInputRequest(...)
window.skillCreatorSessionAPI.submitAnswer(...)

// ConversationalInterview が使用（runtime IPC）
// SkillLifecyclePanel 経由で runtime IPC パスを使用
```

どちらを主系とするかの方針が未決定のため、Phase 1 の比較分析で決定する必要がある。

### 3.3 推奨アプローチ

1. Phase 1 で 2 つの会話 UI の機能比較マトリクスを作成し、統合 or 分離の方針を決定する
2. Phase 2 で IPC 経路の選択と共有コンポーネント抽出設計を行う
3. Phase 3 の設計レビューゲートを通過してから実装に進む
4. Phase 5 でルート追加または統合実装とデモ HTML クリーンアップを行う

---

## 4. 実行手順

### Phase 1: 現状調査・比較分析

#### 目的

2 つの会話型 UI の機能・IPC 経路・コンポーネント構造を比較し、統合方針を決定する。

#### 手順

1. 以下のファイルを読み込み、機能・状態管理・IPC 呼び出しをリストアップする:
   - `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`
   - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
2. `apps/desktop/src/renderer/store/types.ts` の `ViewType` 型を確認し、追加候補の型名を検討する
3. `apps/desktop/src/renderer/App.tsx` の `renderView()` switch 全体を確認し、追加箇所を特定する
4. 以下を確認してデモ HTML の孤立参照を特定する:
   ```bash
   grep -rn "SkillCreatorConversationPanel" apps/desktop/
   ```
5. 機能比較マトリクスを作成する（質問表示・回答送信・進捗表示・エラーハンドリング・完了処理の各軸）

#### 成果物

- 機能比較マトリクス（2 UI の機能差異一覧）
- IPC 経路比較（session IPC vs runtime IPC の呼び出し箇所一覧）
- 統合 or 分離の方針案（根拠付き）

#### 完了条件

- [ ] 2 つの UI の機能差異が全て特定されている
- [ ] session IPC と runtime IPC の呼び出し箇所が全て把握されている
- [ ] デモ HTML の孤立参照箇所が特定されている
- [ ] 統合 or 分離の方針案が作成されている

---

### Phase 2: 設計

#### 目的

Phase 1 の方針に基づき、ルート追加または統合の具体的な設計を行う。

#### 手順

1. **Option A（ルート追加）の場合**:
   - `ViewType` に追加する型名を確定する（例: `"skillCreatorConversation"`）
   - `App.tsx` の `renderView()` への追加箇所と、遷移トリガーとなる呼び出し元を設計する
   - session IPC を主系として維持する理由を文書化する
2. **Option B（統合）の場合**:
   - `ConversationalInterview` に取り込む機能範囲を設計する
   - session IPC と runtime IPC のどちらに統一するかを設計する
   - `QuestionCard` 等の共有コンポーネントの配置先を設計する
3. 共有コンポーネントの整理設計（`QuestionCard` 等を共通パスへ移動する場合、import パスの影響範囲を列挙する）
4. デモ HTML クリーンアップの範囲を設計する

#### 成果物

- 設計ドキュメント（採用 Option の根拠・変更ファイル一覧・IPC 経路設計）

#### 完了条件

- [ ] 採用 Option（A または B）が決定されている
- [ ] 変更対象ファイルと変更内容の概要が確定している
- [ ] IPC 経路の主系・副系が明確化されている
- [ ] 共有コンポーネントの整理方針が確定している

---

### Phase 3: 設計レビュー（ゲート）

#### 目的

Phase 2 の設計内容を検証し、実装に進む前に問題がないことを確認する。

#### 手順

1. 設計ドキュメントをレビューし、以下を確認する:
   - IPC 経路の選択が既存の IPC 契約（`ipc-contract-checklist.md`）に準拠しているか
   - `ViewType` の追加が既存テスト（`store/types.test.ts`、`navContract.test.ts` 等）に影響しないか
   - 共有コンポーネントの移動が既存の import パスを壊さないか
2. レビュー結果を以下の 4 段階で判定する:
   - **PASS**: 問題なし → Phase 4 へ進む
   - **MINOR**: 軽微な修正が必要 → 修正後 Phase 4 へ進む
   - **MAJOR**: 設計変更が必要 → Phase 2 に戻る
   - **CRITICAL**: 前提条件の見直しが必要 → Phase 1 に戻る

#### 完了条件

- [ ] レビュー判定が PASS または MINOR である
- [ ] MINOR の修正項目がある場合、修正内容が明確になっている

---

### Phase 4: テスト作成（Red フェーズ）

#### 目的

実装前にテストを先行作成し、受入条件を検証する Red テストを定義する。

#### 手順

1. ルーティング到達性テストを作成する:
   - `App.tsx` の `renderView()` が新しい ViewType で `SkillCreatorConversationPanel` または統合後のコンポーネントを返すこと
2. `ViewType` 型テストを更新する（`store/types.test.ts`）:
   - 追加した ViewType が型として受け入れられること
3. IPC 経路テストを作成または更新する:
   - session IPC または runtime IPC の呼び出しが期待通りに行われること
4. 共有コンポーネントテストを作成する（移動がある場合）:
   - 新しい import パスで `QuestionCard` 等が正常に動作すること
5. `pnpm --filter @repo/desktop test` を実行し、追加テストが Red であることを確認する

#### 完了条件

- [ ] ルーティング到達性テストが Red である
- [ ] 型テストが Red である（ViewType 追加の場合）
- [ ] IPC 経路テストが Red である
- [ ] 追加テストが全て Red であることが確認されている

---

### Phase 5: 実装

#### 目的

Phase 2 の設計に従い、ルート追加または統合を実装する。

#### 手順

1. **`store/types.ts` の更新**（Option A の場合）:
   - `ViewType` 型に `"skillCreatorConversation"` を追加する
2. **`App.tsx` の更新**:
   - `renderView()` の switch に `"skillCreatorConversation"` case を追加する（Option A）
   - または `ConversationalInterview` との統合実装を行う（Option B）
3. **共有コンポーネントの整理**（移動が必要な場合）:
   - `QuestionCard` 等を共通パスへ移動し、import パスを更新する
4. **デモ HTML のクリーンアップ**:
   - 孤立した参照を除去する
5. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する

#### 完了条件

- [ ] `SkillCreatorConversationPanel` がアプリ内から到達可能になっている
- [ ] `ViewType` の型安全性が維持されている
- [ ] TypeScript 型エラーなし
- [ ] デモ HTML の孤立参照が除去されている

---

### Phase 6: テスト拡充・Green フェーズ

#### 目的

Phase 4 で作成した Red テストを Green にし、実装の正確性を確認する。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行し、Phase 4 で作成したテストが Green であることを確認する
2. 失敗しているテストがある場合は実装を修正する
3. エッジケーステストを追加する:
   - session IPC がタイムアウトした場合のフォールバック挙動
   - `ViewType` が未知の値の場合の `renderView()` default case の動作

#### 完了条件

- [ ] Phase 4 の全テストが Green である
- [ ] 追加したエッジケーステストが Green である
- [ ] 既存テストのリグレッションなし

---

### Phase 7: カバレッジ確認

#### 目的

変更した範囲のテストカバレッジが基準を満たしていることを確認する。

#### 手順

1. カバレッジレポートを生成する:
   ```bash
   pnpm --filter @repo/desktop test --coverage
   ```
2. 以下のファイルのカバレッジを確認する:
   - `apps/desktop/src/renderer/App.tsx`（新規 case の Line Coverage）
   - `apps/desktop/src/renderer/store/types.ts`
   - 統合または追加したコンポーネントファイル

#### カバレッジ目標

| 指標              | 最低基準 |
| ----------------- | -------- |
| Line Coverage     | 80%      |
| Branch Coverage   | 60%      |
| Function Coverage | 80%      |

#### 完了条件

- [ ] 変更ファイルの Line Coverage が 80% 以上である
- [ ] カバレッジが低い箇所に対してテスト追加の方針が決まっている

---

### Phase 8: リファクタリング

#### 目的

実装コードの品質を向上させ、設計の意図が明確になるようリファクタリングする。

#### 手順

1. `App.tsx` の `renderView()` switch が肥大化していないか確認し、必要に応じてコンポーネント分割を検討する
2. IPC 経路の設計方針を示すコメントを追加する（なぜ session IPC または runtime IPC を選択したかの根拠）
3. 共有コンポーネントの命名・配置が設計ドキュメントと一致しているか確認する
4. 不要になったデモ HTML やコメントが除去されていることを確認する

#### 完了条件

- [ ] コードに IPC 経路選択の根拠コメントが記載されている
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] 不要コードが除去されている

---

### Phase 9: 品質保証

#### 目的

TypeScript 型チェック・lint・全テストの 3 点を通過し、品質を保証する。

#### 手順

1. TypeScript 型チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. ESLint を実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
3. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```
4. 以下を手動で確認する:
   - `store/types.ts` の `ViewType` に追加した型が既存の `navContract.test.ts` と整合している
   - `ConversationPanel` への遷移トリガーが `SkillCenterView` または `SkillLifecyclePanel` から呼び出し可能な状態になっている
   - デモ HTML への参照が `grep -rn "SkillCreatorConversationPanel"` で正規ファイルのみを返す

#### 完了条件

- [ ] typecheck エラーなし
- [ ] lint エラーなし
- [ ] 全テスト PASS

---

### Phase 10: 最終レビュー（ゲート）

#### 目的

受入条件 AC-1〜AC-5 の総合判定を行い、本タスクの完了を判断する。

#### 手順

1. 受入条件チェックリストを確認する（下記「完了条件チェックリスト」参照）
2. レビュー判定を行う:
   - **PASS**: AC-1〜AC-5 が全て満たされている → Phase 11 へ進む
   - **MINOR**: 軽微な修正が必要 → 修正後 Phase 11 へ進む
   - **MAJOR**: 実装変更が必要 → Phase 8 に戻る

#### 完了条件

- [ ] AC-1〜AC-5 が全て満たされている
- [ ] レビュー判定が PASS または MINOR である

---

### Phase 11: 手動テスト

#### 目的

実際のアプリ動作で `SkillCreatorConversationPanel` へ到達できることを確認する。

#### 手順

1. アプリを起動する:
   ```bash
   pnpm --filter @repo/desktop dev
   ```
2. 以下の手動テストを実施する:
   - `SkillCenterView` または `SkillLifecyclePanel` から会話型スキル作成フローへ遷移できること
   - 到達した画面でユーザー入力（質問への回答）が送信できること
   - 完了後に適切な画面に遷移すること
3. スクリーンショットを撮影し `outputs/phase-11/` に保存する

#### 完了条件

- [ ] 正規ルートから `SkillCreatorConversationPanel` 相当の画面に到達できる
- [ ] 質問・回答フローが動作する
- [ ] スクリーンショットが保存されている

---

### Phase 12: ドキュメント更新

#### 目的

実装内容をドキュメントに反映し、後続開発者が参照できる状態にする。

#### 手順

1. `docs/30-workflows/unassigned-task/TASK-UI-02-conversation-panel-orphan-resolution.md` のステータスを `completed` に更新する
2. IPC 経路の設計方針（session IPC vs runtime IPC の使い分け）を `.agents/skills/aiworkflow-requirements/references/` 配下の該当ドキュメントに反映する
3. 新しい `ViewType` が追加された場合、`navContract` 関連ドキュメントを更新する

#### 完了条件

- [ ] タスク仕様書のステータスが `completed` に更新されている
- [ ] IPC 経路設計方針が参照ドキュメントに反映されている

---

### Phase 13: PR 作成

#### 目的

変更内容を Pull Request としてまとめる。

#### 手順

1. 変更内容を確認する:
   ```bash
   git diff --stat
   git status
   ```
2. PR を作成する（ユーザー承認後）。タイトル:
   `feat(ui): TASK-UI-02 ConversationPanel 孤立解消 — ルート追加 / ConversationalInterview 統合`

#### 完了条件

- [ ] PR が作成されている（ユーザー承認後）
- [ ] CI が全 PASS している

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: `SkillCreatorConversationPanel` が正式なルートを持つ、または `ConversationalInterview` と統合され、アプリ内から到達可能になっている
- [ ] AC-2: session IPC（`window.skillCreatorSessionAPI`）と runtime IPC の使い分けが設計として明確化・文書化されている
- [ ] AC-3: `QuestionCard` 等の共有可能なコンポーネントが整理され、再利用可能な状態になっている
- [ ] AC-4: デモ HTML の孤立した参照がクリーンアップされている
- [ ] AC-5: 既存テストが全て PASS している

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `pnpm --filter @repo/desktop test` が全 PASS
- [ ] 変更ファイルの Line Coverage が 80% 以上

---

## 6. 検証方法

### テストコマンド

```bash
# App.tsx のルーティングテスト
pnpm --filter @repo/desktop test App

# ViewType / store 型テスト
pnpm --filter @repo/desktop test store/types

# ナビゲーション契約テスト
pnpm --filter @repo/desktop test navContract

# 全テスト（リグレッション確認）
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### テストケース一覧

| テストID | 内容                                                                            | 期待結果                                                             |
| -------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| T-UI2-01 | `renderView()` が `"skillCreatorConversation"` で ConversationPanel を返す      | `SkillCreatorConversationPanel` または統合コンポーネントが描画される |
| T-UI2-02 | `ViewType` に `"skillCreatorConversation"` が含まれる                           | TypeScript 型エラーなし                                              |
| T-UI2-03 | session IPC の `onUserInputRequest` が呼び出されること                          | モックで呼び出し確認                                                 |
| T-UI2-04 | `QuestionCard` が新しい import パスで正常に動作する                             | レンダリングテスト PASS                                              |
| T-UI2-05 | デモ HTML への `SkillCreatorConversationPanel` 参照が正規ファイルにのみ存在する | `grep` で孤立参照なし                                                |

### 手動確認手順

1. デモ HTML の孤立参照がクリーンアップされていることを確認する:
   ```bash
   grep -rn "SkillCreatorConversationPanel" apps/desktop/src/
   ```
2. `ViewType` 追加後に `normalizeSkillLifecycleView()` の影響がないことを確認する:
   ```bash
   grep -n "normalizeSkillLifecycleView" apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts
   ```

---

## 7. リスクと対策

| リスク                                                                                       | 影響度 | 発生確率 | 対策                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| session IPC と runtime IPC の統一が困難で設計コストが予想以上に高くなる                      | 高     | 中       | Phase 1 で機能比較マトリクスを作成し、統合が困難な場合は Option A（分離維持 + ルート追加）を選択する。無理な統合はしない                       |
| `ViewType` への型追加が `navContract.test.ts` / `store/types.test.ts` の既存テストを壊す     | 中     | 高       | Phase 4 でテストを先行作成し、型追加の影響範囲を事前に把握する。`normalizeSkillLifecycleView` の対象に新型を含めるか慎重に判断する             |
| `QuestionCard` の移動が既存の `SkillCreatorConversationPanel` テスト・スナップショットを壊す | 中     | 中       | Phase 2 の設計段階で影響範囲をリストアップし、移動先のパスを確定してから実装する。移動をやめて in-place 再利用化のみにする選択肢も残す         |
| `App.tsx` の `renderView()` が既に複数の case で肥大化しており、追加が可読性を下げる         | 低     | 高       | Phase 8 のリファクタリングで switch 内部のコンポーネント抽出を検討する。ただし本タスクのスコープ内に留め、全面リファクタリングは別タスクとする |
| TASK-UI-01 が完了していない状態で着手した場合、一次導線との競合が発生する                    | 高     | 低       | TASK-UI-01 の完了を事前に確認する。`skillLifecycle` ViewType が `App.tsx` に登録済みであることを前提条件チェックとして Phase 1 に含める        |

---

## 8. 苦戦箇所と知見（重要）

### 苦戦箇所 1: session IPC と runtime IPC の二重構造

`window.skillCreatorSessionAPI`（session IPC）と `ConversationalInterview` が使用する runtime IPC（`SkillLifecyclePanel` 経由）は、呼び出し元も型定義も完全に異なる。どちらを主系とするかを決めずに実装を始めると、IPC 経路が 3 本以上になるリスクがある。

**知見**: Phase 1 の比較分析で「どちらが将来的な機能拡張に適しているか」を判断基準として設計方針を決定すること。判断が困難な場合は、既存の runtime IPC に寄せる方が `SkillLifecyclePanel` との整合性が高い。

### 苦戦箇所 2: `store/types.ts` の ViewType 追加と既存テストの整合

`ViewType` union 型への追加は、`normalizeSkillLifecycleView()`（`navigation/skillLifecycleJourney.ts`）・`navContract.test.ts`・`App.renderView.viewtype.test.tsx` 等、複数のテストファイルに影響する。型追加後にこれらのテストが壊れる可能性が高い。

**知見**: Phase 4 のテスト先行作成で影響ファイルを全て特定してから実装に進むこと。特に `normalizeSkillLifecycleView()` が新型を受け入れるかどうかを確認すること（追加した型を `skillLifecycle` に正規化する必要がある場合は、同関数への追加も必要になる）。

### 苦戦箇所 3: `App.tsx` の renderView() と BrowserRouter の二重管理

`App.tsx` には `renderView()` switch（ViewType ベース）と BrowserRouter ルート（URL ベース）の 2 種類のルーティングが存在する。`SkillCreatorConversationPanel` をどちらに追加するかで、到達方法とテスト方法が変わる。

**知見**: メインアプリフローとして `SkillCenterView` や `SkillLifecyclePanel` からの遷移を想定する場合は `renderView()` への追加（Option A）が適切。開発・デバッグ用途のみなら BrowserRouter の `/advanced/*` ルートへの追加でも十分。用途を明確にしてから実装すること。

---

## 9. 依存関係

### 上流依存

| タスク     | 説明                                                       |
| ---------- | ---------------------------------------------------------- |
| TASK-UI-01 | `SkillLifecyclePanel` への一次導線昇格。本タスクの前提条件 |

### 参照資料

| ドキュメント                 | パス                                                                                                  | 内容                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| UI/UX ナビゲーション契約     | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                               | ルーティング・ナビゲーション設計の正本             |
| Skill Creator Service 仕様   | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`           | SkillCreatorService・IPC パターンの仕様            |
| IPC 契約チェックリスト       | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                         | IPC 修正時の Main/Preload/型定義 同時更新チェック  |
| スキル実行 IPC セキュリティ  | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`                        | パストラバーサル防止・コマンドインジェクション防止 |
| テスト標準化                 | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | コンポーネントテストの標準化                       |
| ConversationPanel 実装       | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`                | 孤立中の実装済みコンポーネント                     |
| ConversationalInterview 実装 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                              | runtime IPC 側の既存会話型 UI                      |
| App.tsx（ルーティング定義）  | `apps/desktop/src/renderer/App.tsx`                                                                   | ルート未追加の現状コード                           |
| ViewType 型定義              | `apps/desktop/src/renderer/store/types.ts`                                                            | union 型。追加が必要                               |
| session IPC API 定義         | `apps/desktop/src/preload/skill-creator-api.ts`                                                       | ConversationPanel が依存する IPC 定義              |
