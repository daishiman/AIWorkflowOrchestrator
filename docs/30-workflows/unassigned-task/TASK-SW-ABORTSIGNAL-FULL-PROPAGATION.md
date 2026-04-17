# TASK-SW-ABORTSIGNAL-FULL-PROPAGATION - タスク指示書

## メタ情報

```yaml
issue_number: 2228
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-SW-ABORTSIGNAL-FULL-PROPAGATION            |
| タスク名     | AbortSignal伝播の完全化                         |
| 分類         | 改善                                            |
| 対象機能     | SkillCreator / キャンセル処理 / AbortController |
| 優先度       | 低                                              |
| 見積もり規模 | 中規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 12 / 技術負債洗い出し                     |
| 発見日       | 2026-04-16                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService.ts` では `TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL` にて `AbortController` が導入され、`createSkill()` メインフローの主要なスクリプト実行箇所（`executeScript` 経由）には `signal` が渡されている。しかし、スコープ外として後回しにされた箇所が残存しており、技術負債となっている。

具体的には以下のメソッド内でキャンセル信号が無視される経路が存在する。

- `validateSkillFallback()`: `validateSkill()` から signal なしで呼び出されており、ファイルシステムアクセス中もキャンセルが効かない
- `validateWithSchema()`: IPC ハンドラー（`skillCreatorHandlers.ts`）から signal なしで呼び出されており、スキーマ検証スクリプト実行中のキャンセルが無効
- `generateTaskSpecs()`: 実装上は signal が渡されているが、ファイルシステム書き込みフォールバック処理（`fs.writeFile`）に signal チェックが欠如
- `detectMode()`: `scriptExecutor.executeJson` を signal なしで呼び出しており、モード判定スクリプトのキャンセルが不可能
- `improveSkill()` / `forkSkill()` / `shareSkill()` / `scheduleSkill()` / `debugSkill()` / `generateDocs()` / `getStats()`: キャンセル機能自体が存在しない公開メソッド群（現時点では `currentAbortController` 管理外）

### 1.2 問題点・課題

1. **キャンセル後のファイルシステム書き込み**: ユーザーがキャンセルを実行しても `generateTaskSpecs` フォールバック内の `fs.writeFile` が実行され続け、不完全なタスク仕様書が生成されるリスクがある
2. **IPC 層での signal 断絶**: `validateWithSchema` は IPC ハンドラーから signal なしで呼ばれており、Electron の IPC 呼び出しレイヤーでキャンセルを伝播させることができない
3. **フォールバックパスの見落とし**: `validateSkillFallback` のようにエラー時のフォールバックパスは signal 伝播の見落としが起きやすい構造になっている

### 1.3 放置した場合の影響

- キャンセルを実行しても一部の処理が継続し、中途半端なファイルが生成される
- キャンセル後の状態が不整合になり、次の操作に影響が出る可能性がある
- `validateWithSchema` を IPC 経由で呼び出している箇所では、長時間実行するスクリプトを強制終了できない
- 将来的に並列実行やタイムアウト機能を追加する際に、signal 伝播の不完全さが障害になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.ts` 内のすべての非同期処理経路に `AbortSignal` を正しく伝播させ、キャンセル操作が確実にすべての処理を停止させることを保証する。

### 2.2 最終ゴール

1. `validateSkillFallback()` が signal を受け取り、ファイルアクセス前に `throwIfCancelled(signal)` を呼ぶ
2. `validateWithSchema()` が IPC ハンドラーから signal を受け取れるよう、呼び出し側を修正する（または将来の拡張に向けた設計整備）
3. `generateTaskSpecs()` のフォールバック書き込みパスで `throwIfCancelled(signal)` を呼ぶ
4. `detectMode()` が signal を受け取り `scriptExecutor.executeJson` に渡せる設計になっている
5. 各メソッドの signal チェックは「非同期操作の直前」に統一される

### 2.3 スコープ

**含むもの**:

- `validateSkillFallback()` への signal 追加と `throwIfCancelled` 追加
- `validateWithSchema()` の IPC 呼び出し経路の signal 伝播設計（実装または設計ドキュメント）
- `generateTaskSpecs()` フォールバックパスへの `throwIfCancelled` 追加
- `detectMode()` への signal パラメータ追加（オプショナル）
- 各修正箇所に対応するユニットテスト

**含まないもの**:

- `improveSkill()` / `forkSkill()` / `shareSkill()` 等の公開メソッドへの `AbortController` 管理機能追加（別タスクで実施）
- IPC プロトコル変更を伴う `validateWithSchema` の完全なキャンセル対応（IPC 層の改修は別タスク）
- `executeTasks()` メソッドへの signal 伝播（タスク実行フローは独立したキャンセル設計が必要）

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（signal 伝播修正）
- 対応するユニットテスト（`SkillCreatorService.test.ts` への新規テストケース追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL` が完了しており、`currentAbortController` ・`throwIfCancelled()` が実装済みであること
- `SkillCreatorService.ts` の全メソッドのシグネチャと呼び出しフローを把握していること
- `ScriptExecutor.execute()` と `ScriptExecutor.executeJson()` の signal 対応状況を確認済みであること

### 3.2 依存タスク

| タスクID                                | 関係   | 内容                                        |
| --------------------------------------- | ------ | ------------------------------------------- |
| TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL | 依存先 | `throwIfCancelled()` 実装が完了していること |

### 3.3 必要な知識

- `AbortSignal` / `AbortController` の Web API 仕様（MDN 参照）
- `signal.aborted` チェックのタイミング（非同期操作「実行前」に統一するパターン）
- `throwIfCancelled(signal)` ヘルパーの動作（`signal?.aborted` が `true` なら `DOMException(AbortError)` を throw）
- Node.js の `fs/promises` が `AbortSignal` を受け取れる操作（`fs.readFile` 等）
- `ScriptExecutor.executeJson()` が signal オプションを受け取れるかの確認方法

### 3.4 signal 伝播の設計原則

```
原則: signal チェックは「非同期操作の実行直前」に統一する

良い例:
  this.throwIfCancelled(signal);   // チェック
  await asyncOperation();          // 操作

悪い例（操作後にチェック）:
  await asyncOperation();
  this.throwIfCancelled(signal);   // 遅すぎる
```

signal 伝播パスの全体図:

```
createSkill()
  └─ signal (AbortController.signal)
      ├─ executeScript()          ← 伝播済み
      ├─ generateTaskSpecs()      ← signal 渡し済み、フォールバック内チェック欠如
      │    └─ fs.writeFile()      ← throwIfCancelled 追加が必要
      ├─ validateSkill()          ← signal 渡し済み
      │    └─ validateSkillFallback()  ← signal 未伝播 (要修正)
      └─ generateSkillMd()        ← 伝播済み

validateWithSchema()              ← IPC から signal なしで呼ばれている (設計改善)
detectMode()                      ← signal パラメータ未定義 (追加推奨)
```

### 3.5 推奨アプローチ

**validateSkillFallback の修正**:
シグネチャを `private async validateSkillFallback(skillDir: string, signal?: AbortSignal)` に変更し、`fs.access` 呼び出しの直前に `this.throwIfCancelled(signal)` を追加する。`validateSkill()` からの呼び出し箇所も signal を渡すよう修正する。

**generateTaskSpecs フォールバックパスの修正**:
`if (!result.success)` ブロック内の `fs.writeFile` 呼び出し直前に `this.throwIfCancelled(signal)` を追加する。

**validateWithSchema の IPC 経路の設計整備**:
まず `validateWithSchema` の呼び出し元（`skillCreatorHandlers.ts` 行441）を調査し、現状 signal なしで呼んでいることをコメントで明記する。完全な IPC signal 伝播は別タスクとして Issue を起票する。

**detectMode の signal 追加**:
`detectMode(request: string, signal?: AbortSignal)` にシグネチャを変更し、`scriptExecutor.executeJson` が signal オプションを受け取る場合は渡す。受け取れない場合は `throwIfCancelled(signal)` を呼び出し直前に配置するだけでよい。

---

## 4. 実行手順（Phase構成）

### Phase 1: 要件定義

- signal 伝播が欠如している全箇所を `SkillCreatorService.ts` から洗い出し一覧化する
- 各箇所について「修正対象 / スコープ外」を分類する
- 完了条件（AC-1〜AC-5）を検証可能な形で文書化する

### Phase 2: 設計

- signal 伝播パス全体図（上記 3.4 の図）を実際のコードを見て完成させる
- `ScriptExecutor.executeJson()` が signal を受け取れるかソースを確認し、受け取れない場合の代替策（直前 throwIfCancelled）を決定する
- `validateSkillFallback` のシグネチャ変更による影響範囲（呼び出し元の数）を確認する
- `validateWithSchema` の IPC 経路修正を本タスクに含めるか除外するかを決定し文書化する

### Phase 3: 設計レビュー

- Phase 2 の設計内容を独立レビュー
- signal チェックのタイミング（実行前統一）が徹底されているか確認
- フォールバックパスで signal が見落とされていないか確認
- PASS / MINOR / MAJOR / CRITICAL を判定（MAJOR 以上は Phase 2 差し戻し）

### Phase 4: テスト作成（fail-first）

- AC-1: `validateSkillFallback` がキャンセル済み signal を受け取ったとき AbortError を throw することを検証するテスト
- AC-2: `generateTaskSpecs` のフォールバックパスで、`fs.writeFile` 実行前にキャンセル済み signal を受け取ったとき AbortError を throw することを検証するテスト
- AC-3: `validateSkill` にキャンセル済み signal を渡したとき、フォールバック経路でも AbortError が伝播することを検証するテスト
- AC-4: `detectMode` に signal を渡せることを型レベルで確認するテスト（コンパイルエラーが出ないこと）
- AC-5: 既存の正常フロー（signal なし・キャンセルなし）に回帰影響がないことを確認するテスト

### Phase 5: 実装

以下の順番で実装する（依存関係の末端から順に修正する）:

1. `validateSkillFallback(skillDir, signal?)` にシグネチャ変更 → `throwIfCancelled(signal)` を追加
2. `validateSkill()` から `validateSkillFallback()` を呼ぶ際に `signal` を渡すよう修正
3. `generateTaskSpecs()` のフォールバック `fs.writeFile` 直前に `throwIfCancelled(signal)` を追加
4. `detectMode(request, signal?)` にシグネチャ変更 → 実行前 `throwIfCancelled(signal)` を追加（executeJson への伝播が可能なら追加）
5. `validateWithSchema` の IPC 呼び出し箇所にコメントで「signal 未伝播 (TODO: 別タスクで対応)」を追記

### Phase 6: テスト拡充

- signal が `undefined` のとき（通常呼び出し）に既存動作が変わらないエッジケーステスト
- signal が `aborted: false` のとき（未キャンセル）に正常実行されることを検証するテスト
- `validateSkill` の正常パス（`validate_all.js` 成功）でフォールバックが呼ばれないことを検証するテスト

### Phase 7: カバレッジ確認

- 修正した4箇所（`validateSkillFallback`・`generateTaskSpecs` フォールバック・`validateSkill` 呼び出し箇所・`detectMode`）のブランチカバレッジを確認
- `signal.aborted === true` / `false` / `undefined` の3パターンを全てカバーしているか確認

### Phase 8: リファクタリング

- signal チェックのパターンを一定にし、コードの一貫性を高める
- `throwIfCancelled` の呼び出し前後にコメントを追記し、なぜそこでチェックするかを明示する
- 「signal 未伝播 TODO」コメントの形式を統一する

### Phase 9: 品質保証

- `pnpm --filter @repo/desktop typecheck` を実行して型エラーがないことを確認
- `pnpm --filter @repo/desktop lint` を実行して ESLint 警告・エラーがないことを確認
- `pnpm --filter @repo/desktop test` を実行して全テスト PASS を確認

### Phase 10: 最終レビュー

- AC-1〜AC-5 とテストの対応表を再確認
- signal 伝播パス全体図と実装が一致しているか確認
- PASS / MINOR は Phase 11 へ、MAJOR は Phase 8 に差し戻し

### Phase 11: 手動テスト

- スキル作成フローを開始し、`validateSkillFallback` が呼ばれるシナリオ（`validate_all.js` が存在しない環境を模倣）でキャンセルが動作することを確認
- `generateTaskSpecs` オプションを有効にした状態でスキル作成中にキャンセルし、中途半端なタスク仕様書が生成されないことを確認

### Phase 12: ドキュメント更新

AbortSignal 伝播設計についての中学生レベル概念説明:

**AbortSignal とは何か（中学生向け解説）**:

コンビニのレジで注文した後、「やっぱりキャンセルします」と言うことを想像してください。

- **AbortController** = キャンセルボタンを持っている人（ユーザー）
- **AbortSignal** = 「キャンセルされたかどうか」を伝える手紙
- **signal.aborted** = 手紙に「キャンセル済み」と書いてあるかどうか

問題は、この手紙をレジ担当だけに渡して、倉庫担当や配送担当に渡さないと、注文は取り消せてもバックヤードでは準備が続いてしまうことです。

今回のタスクは、「キャンセルの手紙をすべての担当者（メソッド）に確実に届ける」ことが目的です。

**なぜ「実行前チェック」に統一するのか**:

非同期処理は「始まったら止まらない」性質があります。キャンセルチェックを「実行後」に行うと、長時間の処理が完了するまで待たされます。「実行前」にチェックすることで、無駄な処理を開始する前に止めることができます。

- 修正ファイル一覧をこの仕様書の outputs/ 以下に記録する
- `validateSkillFallback` / `generateTaskSpecs` / `detectMode` それぞれの修正意図をコードコメントで明記する

### Phase 13: PR 作成

- ブランチ名: `fix/abortsignal-full-propagation`
- コミットメッセージ: `fix(SkillCreatorService): AbortSignal伝播の完全化 (TASK-SW-ABORTSIGNAL-FULL-PROPAGATION)`
- PR タイトル: `fix(skill-creator): AbortSignal full propagation in SkillCreatorService`
- PR 本文に変更概要・テスト方法・関連 Issue を記述する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `validateSkillFallback(skillDir, signal?)` が signal を受け取り、ファイルアクセス前に `throwIfCancelled(signal)` を呼ぶ
- [ ] AC-2: `generateTaskSpecs()` のフォールバックパスで `fs.writeFile` 実行前に `throwIfCancelled(signal)` が呼ばれる
- [ ] AC-3: `validateSkill()` から `validateSkillFallback()` を呼ぶ際に signal が正しく渡される
- [ ] AC-4: `detectMode()` が `signal?: AbortSignal` パラメータを受け取れる（型エラーなし）
- [ ] AC-5: signal なし / `aborted: false` の既存呼び出しパターンで動作が変わらない

### 品質要件

- [ ] 修正箇所のユニットテストカバレッジが signal 有/無の両パターンをカバーしている
- [ ] TypeScript 型エラーなし（`pnpm typecheck` PASS）
- [ ] ESLint 警告・エラーなし（`pnpm lint` PASS）
- [ ] 既存テストスイートが全て PASS

### ドキュメント要件

- [ ] 各修正箇所に「signal チェックをここで行う理由」のコメントが追記されている
- [ ] `validateWithSchema` の IPC 経路の signal 未伝播箇所に TODO コメントが追記されている
- [ ] Phase 1-13 の成果物が outputs/ 以下に生成されている

---

## 6. 検証方法

### テストケース

| テストID | 対象メソッド          | 入力条件                                                 | 期待結果                                                                               | 備考                                       |
| -------- | --------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| TC-01    | validateSkillFallback | キャンセル済み signal（`aborted: true`）を渡す           | AbortError が throw される                                                             | ファイルアクセス前にチェックされること     |
| TC-02    | validateSkillFallback | signal なし（既存呼び出しパターン）                      | 通常通りファイルチェックが実行される                                                   | 回帰テスト                                 |
| TC-03    | generateTaskSpecs     | `result.success: false` かつキャンセル済み signal        | `fs.writeFile` 実行前に AbortError が throw される                                     | フォールバックパスのみ対象                 |
| TC-04    | generateTaskSpecs     | `result.success: false` かつ未キャンセル signal          | `fs.writeFile` が実行されフォールバックファイルが生成される                            | 正常フォールバックの回帰テスト             |
| TC-05    | validateSkill         | `validate_all.js` が失敗し、キャンセル済み signal を渡す | フォールバック経路でも AbortError が伝播する                                           | フォールバック呼び出し時の signal 伝播確認 |
| TC-06    | validateSkill         | `validate_all.js` が成功する                             | フォールバックが呼ばれず正常終了する（回帰）                                           | 正常パスへの影響なし確認                   |
| TC-07    | detectMode            | signal パラメータを渡す（型確認）                        | TypeScript コンパイルエラーが出ない                                                    | 型レベルの確認                             |
| TC-08    | detectMode            | キャンセル済み signal を渡す                             | `executeJson` 実行前に AbortError が throw される（または executeJson 内で処理される） | チェックタイミングの確認                   |
| TC-09    | createSkill（統合）   | `generateTasks: true` でスキル作成を開始しすぐキャンセル | フォールバック仕様書ファイルが生成されない                                             | エンドツーエンドのキャンセル確認           |

---

## 7. リスクと対策

| リスク                                                                                                   | 影響度 | 発生確率 | 対策                                                                                                                            |
| -------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `validateSkillFallback` のシグネチャ変更で呼び出し元が型エラーになる                                     | 中     | 低       | `signal?: AbortSignal` をオプショナルにすることで後方互換性を保つ。Phase 9 の typecheck で確認                                  |
| `ScriptExecutor.executeJson()` が signal オプションを受け取れず、detectMode の修正が中途半端になる       | 中     | 中       | `ScriptExecutor.executeJson` のシグネチャを Phase 2 で確認。受け取れない場合は `throwIfCancelled` の直前配置のみで対応          |
| `generateTaskSpecs` フォールバックに `throwIfCancelled` を追加することで、正常時のフォールバックも止まる | 低     | 低       | signal チェックは `result.success === false` ブランチ内にのみ追加し、正常パスへの影響なしを TC-04 で確認する                    |
| フォールバックパスのテストがモック設計の都合で書きにくい                                                 | 低     | 中       | `fs/promises` を vi.mock でモックする。`executeScript` の戻り値に `success: false` を設定してフォールバックを強制的に発火させる |
| `validateWithSchema` の IPC signal 未伝播が本タスク後も残留してレビューで指摘される                      | 低     | 中       | スコープ外であることを PR 本文と TODO コメントに明記し、別 Issue を起票する                                                     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL.md`（AbortController 導入の元タスク）

### 関連ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（修正対象）
  - `validateSkillFallback()` (L1194-L1202): signal 未伝播のフォールバックメソッド
  - `generateTaskSpecs()` (L929-L953): フォールバック fs.writeFile 前の signal チェック欠如
  - `validateSkill()` (L478-L501): フォールバック呼び出し時に signal を渡していない箇所
  - `validateWithSchema()` (L510-L521): IPC 経由で signal なしで呼ばれる公開メソッド
  - `detectMode()` (L141-L146): signal パラメータが未定義
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` (L441): `validateWithSchema` を signal なしで呼ぶ IPC ハンドラー
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（テスト追加先）

---

## 9. 備考（苦戦箇所【記入必須】）

### 苦戦箇所

| 項目                                              | 内容                                                                                                                                                                                                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| signal 伝播パスの図化が必須                       | どこで `throwIfCancelled()` を呼ぶかは、コードを読んだだけでは判断が難しい。まず伝播パス全体図（3.4 節参照）を紙やドキュメントに図化してから実装に入ること。図化なしで実装すると、フォールバックパスや条件分岐の深い箇所での見落としが発生しやすい                          |
| signal.aborted の確認タイミングは「実行前」に統一 | 「実行後」にチェックする実装（`await doSomething(); throwIfCancelled(signal);`）は、長時間処理が完了するまで無駄に待つ。すべてのチェックを「非同期操作の直前」に配置することを徹底すること。既存コードでも `throwIfCancelled` 後に `await` がある箇所を見本として参照できる |
| ScriptExecutor.executeJson の signal 対応確認     | `executeScript` は `{ signal }` を受け取れるが、`executeJson` が同様のオプションを受け取れるかはソースを見ないと分からない。Phase 2 で必ず確認し、受け取れない場合は `throwIfCancelled` を直前に配置する代替策を選択すること                                                |
| フォールバックパスの見落とし防止                  | `validateSkillFallback` のように「エラー時のフォールバックメソッド」は signal 伝播の見落としが発生しやすい。「正常パス」だけでなく「エラーパス・フォールバックパス」すべてに signal が届いているかを伝播パス図でチェックすること                                            |
| validateWithSchema の IPC 経路問題                | IPC ハンドラー側（`skillCreatorHandlers.ts`）から signal を渡すには、IPC プロトコルの変更（Electron の `ipcMain.handle` に渡せる情報の制約）が伴う可能性がある。本タスクでは TODO コメントの追記にとどめ、完全対応は IPC 層の設計を含む別タスクに委ねること                 |
| オプショナル signal と型安全性                    | `signal?: AbortSignal` のオプショナルパラメータ追加は後方互換性を保つが、「signal を渡すべき呼び出し元が渡し忘れても型エラーにならない」という問題がある。将来的に必須化するかどうかを Phase 2 の設計判断として明記しておくこと                                             |

### 発見経緯

`TASK-SC-11-ABORT-CONTROLLER-PLAN-CANCEL` の実装時に、実装スコープを「主要フロー（createSkill メインライン）への signal 伝播」に限定したため、フォールバックパス・公開メソッド・IPC 経由の呼び出しへの signal 伝播が後回しになった。Phase 12 技術負債洗い出しにより本タスクとして独立化した（2026-04-16）。
