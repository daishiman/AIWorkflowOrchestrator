# TASK-RALLY-002-MANUAL-VERIFY-001 RALLY-002 Electron実機 manual verification 再実施 - タスク指示書

## メタ情報

```yaml
issue_number: 2404
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-RALLY-002-MANUAL-VERIFY-001                                |
| タスク名     | RALLY-002 Electron実機 manual verification 再実施               |
| 分類         | 品質保証                                                        |
| 対象機能     | ConversationalInterview - restoredPendingRequest undo復元フロー |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-RALLY-002 Phase 11 環境制約記録                            |
| 発見日       | 2026-04-22                                                      |
| 関連タスク   | TASK-RALLY-002（前提完了）, RALLY-010〜013（後続）              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RALLY-002（restoredPendingRequest合成ルール明確化）において、静的検証（typecheck + ESLint）はPASSした。しかしworktree環境でのElectron起動制約により、Phase 11（インタラクティブな undo/restore フロー）の実機テストが未完了のまま完了扱いとなった。Phase 11 の「環境制約由来の追試項目」として `manual-test-result.md` に記録済みであるが、Electron実機での検証は行われていない。

### 1.2 問題点・課題

- worktree環境でのElectron起動制約により実機テストが未実施
- undo → restore → submit の連続フローが実際のElectron UIで正常動作するか未確認
- requestId drift（修正前の不具合）が実機で再現しないことの確認が必要

### 1.3 放置した場合の影響

RALLY-010〜013の後続実装時に、restore フローの仕様を誤って理解した実装が入り込む可能性がある。また、実機で requestId drift が再現した場合、後続タスクで発見されるため修正コストが増大する。

## 2. 何を達成するか（What）

### 2.1 目的

Electron実機で restoredPendingRequest の動作を手動検証し、RALLY-002の修正が意図通りに動作することを確認する。

### 2.2 最終ゴール

- undo → restore → submit フローが実機で正常動作することを確認する
- requestId が正しく引き継がれ、drift が発生しないことを DevTools で確認する
- 発見事項（問題があった場合）を文書化して後続タスクへ引き継ぐ

### 2.3 スコープ

#### 含むもの

- Electronアプリ起動（`pnpm --filter @repo/desktop dev`）
- ConversationalInterviewコンポーネントの手動操作テスト
- undo → restore → submit フローの動作確認
- DevToolsを使ったrequestId追跡
- 検証結果の文書化

#### 含まないもの

- 実装コードの変更
- 新規テストコードの追加
- RALLY-010〜013の作業着手

### 2.4 成果物

- `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-11-rerun/manual-test-result.md`（実機検証結果）
- `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-11-rerun/discovered-issues.md`（発見事項、0件でも作成）

## 3. どのように実行するか（How）

### 3.1 前提条件

- Electron開発環境が利用可能であること（`pnpm --filter @repo/desktop dev` が実行可能）
- mainブランチで `pnpm install` を実施済みであること（esbuild version mismatch 解消のため）
- DevToolsが使用可能であること（Console・Networkタブで requestId を確認）

### 3.2 依存タスク

- TASK-RALLY-002（前提完了）: restoredPendingRequest合成ルール明確化の実装が完了済みであること

### 3.3 必要な知識

- ConversationalInterview コンポーネントの動作仕様
- restoredPendingRequest の合成ルール（requestId 引き継ぎロジック）
- Electron DevTools の使い方（Console でのstate確認、Networkタブ）

### 3.4 推奨アプローチ

1. mainブランチで `pnpm install` を実施しesbuild version mismatchを解消する
2. `pnpm --filter @repo/desktop dev` でElectronアプリを起動する
3. スキル実行画面でConversationalInterviewコンポーネントを表示する
4. 入力 → undo → restore → submit のフローを手動テストする
5. requestIdが正しく引き継がれることをDevToolsのConsoleで確認する
6. 各操作ステップと観測結果を `manual-test-result.md` に記録する
7. 問題が発見された場合は `discovered-issues.md` に詳細を記載する

## 4. 実行手順

### Phase構成

| Phase   | 内容           | 成果物                                       |
| ------- | -------------- | -------------------------------------------- |
| Phase 1 | 環境準備       | Electronアプリ起動確認                       |
| Phase 2 | 手動テスト実施 | 操作ログ                                     |
| Phase 3 | 結果文書化     | manual-test-result.md / discovered-issues.md |

### Phase 1: 環境準備

#### 目的

worktree外のmain環境でElectronアプリを正常起動する。

#### 手順

1. mainブランチに切り替える（`git checkout main`）
2. `pnpm install` を実行してesbuild version mismatchを解消する
3. `pnpm --filter @repo/desktop dev` を実行してElectronアプリを起動する
4. アプリが正常起動したことを確認する

#### 成果物

Electronアプリが起動し、スキル実行画面にアクセス可能な状態。

#### 完了条件

`pnpm --filter @repo/desktop dev` が正常に起動し、UIが表示される。

### Phase 2: 手動テスト実施

#### 目的

ConversationalInterview コンポーネントの undo/restore フローを実機で検証する。

#### テストシナリオ

**シナリオ A: 基本的な undo → restore フロー**

1. スキル実行画面でConversationalInterviewコンポーネントを開く
2. 入力フィールドにテキストを入力する
3. undo操作を実行する（Ctrl+Z / Cmd+Z）
4. DevTools Console で restoredPendingRequest の状態を確認する
5. restore操作を実行する（入力復元ボタンまたは相当するUI操作）
6. requestId が修正前の値から変化していないことを確認する
7. submit を実行し、リクエストが正常に送信されることを確認する

**シナリオ B: requestId drift の非再現確認**

1. 新しい会話セッションを開始する
2. 複数回の undo → restore を繰り返す
3. 各操作後に DevTools Console で requestId をログ出力して確認する
4. requestId が途中で変わらないことを確認する（drift が発生しないこと）

**シナリオ C: エッジケース確認**

1. undo した状態でページリロードを行う
2. restore が正常に機能するか確認する
3. 異常終了や予期しない挙動がないかを確認する

#### 成果物

各シナリオの操作ログと観測結果。

#### 完了条件

全シナリオを実施し、Pass/Fail を記録する。

### Phase 3: 結果文書化

#### 目的

テスト結果を構造化して記録し、後続タスクへ引き継ぐ。

#### 手順

1. `outputs/phase-11-rerun/` ディレクトリを作成する
2. `manual-test-result.md` を作成し、以下の内容を記載する：
   - 実施日時・環境情報（OSバージョン、Electronバージョン）
   - 各シナリオの Pass/Fail 結果
   - 観測した requestId の値と遷移
   - スクリーンショットまたはConsoleログの抜粋
3. `discovered-issues.md` を作成し、発見した問題点を記載する（問題0件でも空ファイルではなく「問題なし」と明記）

#### 成果物

- `outputs/phase-11-rerun/manual-test-result.md`
- `outputs/phase-11-rerun/discovered-issues.md`

#### 完了条件

両ファイルが存在し、テスト結果が記録されている。

## 5. 苦戦箇所・注意点

### worktree環境でのesbuild version mismatch

worktree環境では `esbuild` version mismatch（ホスト0.21.5 vs バイナリ0.25.12）により `vitest` が実行できない。この問題はdependency解決レベルの問題であり、mainブランチで `pnpm install` し直すことで解消する。実機テストはworktree外のmain環境で実施すること。

具体的なエラーメッセージ（参考）:

```
Error: The esbuild JavaScript API cannot be used with the "esbuild" package it was bundled with.
```

### DevToolsでのrequestId確認方法

Electron DevTools の Console タブで以下のように確認する：

- React DevTools を使ったコンポーネントstate確認
- Console.log 出力でのrequestId値の追跡
- 修正前の requestId drift とは「undo後にrestoreするとrequestIdが新規生成される」挙動であり、修正後は元の requestId が維持される

### 後続タスクへの影響

`discovered-issues.md` に記載した問題は RALLY-010〜013 の実装者が参照するため、再現手順と影響範囲を明確に記述すること。問題がない場合も「検証済みで問題なし」と明記することが重要である。
