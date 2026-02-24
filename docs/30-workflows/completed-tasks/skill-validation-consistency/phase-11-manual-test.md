# Phase 11: 手動テスト検証 — skill:ハンドラP42準拠バリデーション形式統一

## メタ情報

| 項目          | 内容                                                                               |
| ------------- | ---------------------------------------------------------------------------------- |
| タスクID      | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001                                            |
| タスク名      | skill:ハンドラP42準拠バリデーション形式統一                                        |
| Phase         | 11 — 手動テスト検証                                                                |
| 分類          | セキュリティ                                                                       |
| 優先度        | 中                                                                                 |
| 規模          | 小規模                                                                             |
| Issue         | #874                                                                               |
| 作成日        | 2026-02-24                                                                         |
| 前提Phase     | Phase 10（最終レビュー）PASS または MINOR 判定                                     |
| 後続Phase     | Phase 12（ドキュメント）                                                           |
| ステータス    | 未着手                                                                             |
| 前Phase成果物 | `outputs/phase-10/final-review-result.md`                                          |
| 機能名        | skill-validation-consistency                                                       |
| 成果物Dir     | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-11/` |

---

## 目的

Phase 5〜10 で実装・検証した P42 準拠3段バリデーション（型チェック→空文字列→トリム空文字列）が、実際の Electron アプリ上で期待通りに動作することを UIテスト・E2Eシナリオの手動実行により検証する。ユニットテストでは検出できない IPC 通信経路上のバリデーション挙動、Renderer 側のエラー表示、既存機能への回帰影響を確認する。

## 背景

本タスクはバックエンドの IPC ハンドラのバリデーション修正であり、UI の新規追加はない。そのため手動テストは以下に焦点を当てる:

1. **バリデーション動作確認**: DevTools から不正な引数で IPC を呼び出し、エラーが正しく throw されることを確認する
2. **回帰テスト**: 既存のスキル操作（一覧表示、詳細表示、実行、中止、分析、改善）が正常に動作することを確認する
3. **エラー表示確認**: Renderer 側でエラーが safeInvoke 経由で catch され、内部情報（スタックトレース・ファイルパス）が漏洩していないことを確認する

---

## 実行タスク

- 起動確認: 開発サーバーとDevTools利用可否を確認する。
- IPC手動検証: 不正入力に対するVALIDATION_ERRORを確認する。
- E2E回帰確認: 主要スキル操作の正常動作を確認する。
- UIエラー確認: safeInvoke経由のエラー表示と非漏洩を確認する。
- 結果集約: 手動テスト結果を集計し判定を確定する。

| #   | Step                                      | 説明                                                         |
| --- | ----------------------------------------- | ------------------------------------------------------------ |
| 1   | 開発サーバー起動                          | Electron 開発サーバーを起動し、DevTools を開く               |
| 2   | DevToolsコンソールからのIPC呼び出しテスト | 各ハンドラにスペースのみ入力を送信し、エラーが返ることを確認 |
| 3   | UI操作によるEnd-to-Endフロー確認          | 各スキル操作が正常に動作することを確認                       |
| 4   | エラーハンドリングUI確認                  | バリデーションエラー時のUIフィードバックを確認               |
| 5   | 手動テスト結果レポート                    | 全テスト結果を集約し、問題の有無を判定する                   |

---

## 参照資料

| 参照資料                  | パス                                                                                                     | 内容                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1要件定義           | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-1-requirements.md`                 | 機能要件FR1-FR3、テスト入力パターン |
| Phase 2設計               | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-2-design.md`                       | 詳細設計・検証観点                  |
| Phase 5実装               | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-5-implementation.md`               | 実装差分確認                        |
| Phase 6テスト拡充         | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-6-test-expansion.md`               | 追加テストケース確認                |
| Phase 7カバレッジ確認     | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-7-coverage-check.md`               | カバレッジ判定結果                  |
| Phase 8リファクタリング   | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-8-refactoring.md`                  | 品質改善内容確認                    |
| Phase 9品質保証           | `docs/30-workflows/completed-tasks/skill-validation-consistency/phase-9-quality-assurance.md`            | 品質ゲート判定                      |
| Phase 10レビュー結果      | `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-10/final-review-result.md` | 最終レビュー判定結果                |
| P42バリデーションパターン | `.claude/rules/06-known-pitfalls.md#p42`                                                                 | 3段バリデーション標準               |
| IPCセキュリティ原則       | `.claude/rules/04-electron-security.md#ipc-セキュリティ原則`                                             | エラー情報非漏洩の原則              |
| セキュリティ詳細          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                | スキルIPCセキュリティ仕様           |
| IPC契約チェック           | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                            | 手動検証時の契約ドリフト確認        |
| Skill API契約             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                        | Renderer呼び出しAPI仕様確認         |
| IPC API仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                     | IPCチャネル仕様の手動確認           |
| エラー分類                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                    | Validation Error分類基準            |

---

## 実行手順

### Step 1: 開発サーバー起動

**目的**: Electron 開発サーバーを起動し、手動テストの実行環境を準備する

**実行手順**:

1. ターミナルで以下のコマンドを実行し、Electron 開発サーバーを起動する:

```bash
pnpm --filter @repo/desktop dev
```

2. アプリウィンドウが表示されたら、メニューバーから `View > Toggle Developer Tools` を選択するか、`Cmd+Option+I`（macOS）で DevTools を開く
3. DevTools の Console タブを選択する
4. 以下のコマンドを Console に入力し、skill API が利用可能であることを確認する:

```javascript
// skill API が利用可能か確認
typeof window.electronAPI.skill;
// 期待結果: "object"
```

5. `"object"` と表示されれば準備完了。`"undefined"` の場合はアプリの起動に失敗しているため、ターミナルのエラーログを確認する

**確認項目**:

| #   | 確認項目               | 操作                                                | 期待結果                         | 結果 | 備考 |
| --- | ---------------------- | --------------------------------------------------- | -------------------------------- | ---- | ---- |
| 0-1 | 開発サーバー正常起動   | `pnpm --filter @repo/desktop dev` を実行            | エラーなくアプリウィンドウが表示 | -    | -    |
| 0-2 | DevTools が開ける      | `Cmd+Option+I` を押す                               | DevTools パネルが表示される      | -    | -    |
| 0-3 | skill API アクセス可能 | Console で `typeof window.electronAPI.skill` を入力 | `"object"` と表示される          | -    | -    |

---

### Step 2: DevToolsコンソールからのIPC呼び出しテスト

**目的**: 各ハンドラにスペースのみ入力・空文字列・非文字列型を送信し、P42 準拠バリデーションが IPC 通信経路上で正しく機能することを確認する。正常入力でハンドラが正常動作することも確認する。

**実行手順**:

1. DevTools Console で以下のテストケースを1つずつ実行する
2. 各テストケースで `VALIDATION_ERROR` を含むエラーが返されることを確認する
3. 正常入力でハンドラが正常動作する（エラーなく resolve する）ことも確認する
4. テスト結果を以下のテーブルに記録する

#### 2-1. バリデーションエラーテスト（不正入力の拒否）

各コマンドを DevTools Console にコピー&ペーストして実行する。`.catch(e => console.log(e))` でエラー内容を確認する。

| #   | ハンドラ           | テスト項目               | DevTools 入力コマンド                                                  | 期待結果                                                                          | 結果 | 備考 |
| --- | ------------------ | ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- | ---- |
| 1   | `skill:get-detail` | 空文字列の拒否           | `window.electronAPI.skill.getDetail("").catch(e => console.log(e))`    | `{ code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     | -    | -    |
| 2   | `skill:get-detail` | スペースのみ文字列の拒否 | `window.electronAPI.skill.getDetail("   ").catch(e => console.log(e))` | `{ code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     | -    | -    |
| 3   | `skill:get-detail` | 非文字列（数値）の拒否   | `window.electronAPI.skill.getDetail(123).catch(e => console.log(e))`   | `{ code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     | -    | -    |
| 4   | `skill:execute`    | 空文字列の拒否           | `window.electronAPI.skill.execute("").catch(e => console.log(e))`      | `{ code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     | -    | -    |
| 5   | `skill:execute`    | スペースのみ文字列の拒否 | `window.electronAPI.skill.execute("   ").catch(e => console.log(e))`   | `{ code: "VALIDATION_ERROR", message: "skillId must be a non-empty string" }`     | -    | -    |
| 6   | `skill:abort`      | 空文字列の拒否           | `window.electronAPI.skill.abort("").catch(e => console.log(e))`        | `{ code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` | -    | -    |
| 7   | `skill:abort`      | スペースのみ文字列の拒否 | `window.electronAPI.skill.abort("   ").catch(e => console.log(e))`     | `{ code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` | -    | -    |
| 8   | `skill:get-status` | 空文字列の拒否           | `window.electronAPI.skill.getStatus("").catch(e => console.log(e))`    | `{ code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` | -    | -    |
| 9   | `skill:get-status` | スペースのみ文字列の拒否 | `window.electronAPI.skill.getStatus("   ").catch(e => console.log(e))` | `{ code: "VALIDATION_ERROR", message: "executionId must be a non-empty string" }` | -    | -    |
| 10  | `skill:analyze`    | 空文字列の拒否           | `window.electronAPI.skill.analyze("").catch(e => console.log(e))`      | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   | -    | -    |
| 11  | `skill:analyze`    | スペースのみ文字列の拒否 | `window.electronAPI.skill.analyze("   ").catch(e => console.log(e))`   | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   | -    | -    |
| 12  | `skill:improve`    | 空文字列の拒否           | `window.electronAPI.skill.improve("").catch(e => console.log(e))`      | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   | -    | -    |
| 13  | `skill:improve`    | スペースのみ文字列の拒否 | `window.electronAPI.skill.improve("   ").catch(e => console.log(e))`   | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }`   | -    | -    |

#### 2-2. 正常入力テスト（正常な文字列で正常動作）

正常な文字列引数を渡した場合に、バリデーションを通過してハンドラが正常に動作する（reject ではなく resolve する）ことを確認する。

| #   | ハンドラ           | テスト項目 | DevTools 入力コマンド                                                                                          | 期待結果                                                     | 結果 | 備考 |
| --- | ------------------ | ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---- | ---- |
| 14  | `skill:get-detail` | 正常入力   | `window.electronAPI.skill.getDetail("test-skill").then(r => console.log(r)).catch(e => console.log(e))`        | resolve する（スキル未存在の場合はビジネスエラーで resolve） | -    | -    |
| 15  | `skill:abort`      | 正常入力   | `window.electronAPI.skill.abort("test-execution-id").then(r => console.log(r)).catch(e => console.log(e))`     | resolve する（実行未存在の場合はビジネスエラー）             | -    | -    |
| 16  | `skill:get-status` | 正常入力   | `window.electronAPI.skill.getStatus("test-execution-id").then(r => console.log(r)).catch(e => console.log(e))` | resolve する（実行未存在の場合は null）                      | -    | -    |

---

### Step 3: UI操作によるEnd-to-Endフロー確認

**目的**: UI からの通常操作で各スキル機能が正常に動作することを確認する。バリデーション追加による回帰影響がないことを検証する。

**実行手順**:

以下の各テストケースを順番に実施する。操作前にアプリが正常に起動していることを確認すること。

#### 3-1. スキル詳細取得（get-detail）

| #   | テスト項目     | 前提条件               | 操作手順                                                                                 | 期待結果                                       | 結果 | 備考 |
| --- | -------------- | ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | ---- | ---- |
| 17  | スキル一覧表示 | アプリ起動済み         | 1. 左サイドバーのスキル管理メニューをクリック<br>2. スキル一覧画面が表示されることを確認 | インポート済みスキルが正常に表示される         | -    | -    |
| 18  | スキル詳細表示 | スキルがインポート済み | 1. スキル一覧から任意のスキルをクリック<br>2. スキル詳細パネルが表示されることを確認     | スキル名、説明、ファイル一覧が正常に表示される | -    | -    |

#### 3-2. スキル実行（execute）

| #   | テスト項目 | 前提条件               | 操作手順                                                                                                                | 期待結果                                   | 結果 | 備考 |
| --- | ---------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---- | ---- |
| 19  | スキル実行 | スキルがインポート済み | 1. スキル詳細画面で「実行」ボタンをクリック<br>2. 実行ダイアログが表示された場合は確認<br>3. 実行が開始されることを確認 | スキルが正常に実行開始される（エラーなし） | -    | -    |

#### 3-3. スキル中止（abort）

| #   | テスト項目 | 前提条件       | 操作手順                                                                                   | 期待結果                 | 結果 | 備考 |
| --- | ---------- | -------------- | ------------------------------------------------------------------------------------------ | ------------------------ | ---- | ---- |
| 20  | スキル中止 | スキルが実行中 | 1. 実行中のスキルの「中止」ボタンをクリック<br>2. 中止確認ダイアログが表示された場合は確認 | スキルが正常に中止される | -    | -    |

#### 3-4. スキルステータス取得（get-status）

| #   | テスト項目     | 前提条件                 | 操作手順                                                                              | 期待結果                                               | 結果 | 備考 |
| --- | -------------- | ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---- | ---- |
| 21  | ステータス表示 | スキルが実行中または完了 | 1. 実行中/完了のスキルの詳細画面を開く<br>2. ステータス表示が更新されていることを確認 | 実行状態（running/completed/failed）が正常に表示される | -    | -    |

#### 3-5. スキル分析（analyze）

| #   | テスト項目 | 前提条件               | 操作手順                                                                         | 期待結果                         | 結果 | 備考 |
| --- | ---------- | ---------------------- | -------------------------------------------------------------------------------- | -------------------------------- | ---- | ---- |
| 22  | スキル分析 | スキルがインポート済み | 1. スキル詳細画面で「分析」ボタンをクリック<br>2. 分析結果が表示されることを確認 | スキル分析結果が正常に表示される | -    | -    |

#### 3-6. スキル改善（improve）

| #   | テスト項目 | 前提条件               | 操作手順                                                                         | 期待結果                         | 結果 | 備考 |
| --- | ---------- | ---------------------- | -------------------------------------------------------------------------------- | -------------------------------- | ---- | ---- |
| 23  | スキル改善 | スキルがインポート済み | 1. スキル詳細画面で「改善」ボタンをクリック<br>2. 改善提案が表示されることを確認 | スキル改善提案が正常に表示される | -    | -    |

---

### Step 4: エラーハンドリングUI確認

**目的**: バリデーションエラー時に Renderer 側でエラーが safeInvoke の catch ブロックで処理され、ユーザーにはサニタイズされたエラーメッセージのみが表示され、内部情報（スタックトレース・ファイルパス・ハンドラ名）が漏洩しないことを確認する

**実行手順**:

1. DevTools Console からバリデーションエラーを意図的に発生させる
2. エラーが Renderer 側でどのようにハンドリングされるか観察する
3. エラーレスポンスに内部情報（スタックトレース、ファイルパス）が含まれていないことを確認する

| #   | テスト項目                             | 操作手順                                                                                                                                       | 期待結果                                                             | 結果 | 備考 |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---- | ---- |
| 24  | エラーレスポンスにスタックトレースなし | DevTools で `window.electronAPI.skill.getDetail("").catch(e => console.log(JSON.stringify(e)))` を実行                                         | `code` と `message` のみ。`stack` プロパティやファイルパスを含まない | -    | -    |
| 25  | エラーメッセージに内部パス情報なし     | DevTools で各ハンドラ（abort, getStatus, analyze, improve）へ空文字列を送信し、`catch(e => console.log(JSON.stringify(e)))` でエラー全文を確認 | ファイルシステムパスや内部クラス名が含まれていない                   | -    | -    |
| 26  | 存在しないスキル詳細取得               | DevTools で `window.electronAPI.skill.getDetail("nonexistent-skill-name").then(r => console.log(r)).catch(e => console.log(e))` を実行         | エラーが返される（VALIDATION_ERROR ではなくビジネスエラー）          | -    | -    |
| 27  | Main Process ログ確認                  | 不正引数での IPC 呼び出し後、ターミナルの Main Process ログを確認する                                                                          | バリデーションエラーがログに記録されている                           | -    | -    |

---

### Step 5: 手動テスト結果レポート

**目的**: Step 1〜4 の全テスト結果を集約し、手動テストの総合判定を行う

**実行手順**:

1. テストケース #0-1〜#27 の結果を集計する
2. PASS / FAIL の件数を算出する
3. FAIL がある場合は severity（Critical / Major / Minor）を判定する
4. 総合判定を記録する
5. 成果物（4ファイル）を作成する

**テスト結果集計テーブル**:

| テストカテゴリ                          | テスト件数 | PASS | FAIL | 未実施 |
| --------------------------------------- | ---------- | ---- | ---- | ------ |
| Step 1: 環境準備（#0-1〜#0-3）          | 3          | -    | -    | -      |
| Step 2: バリデーションエラー（#1〜#13） | 13         | -    | -    | -      |
| Step 2: 正常入力（#14〜#16）            | 3          | -    | -    | -      |
| Step 3: E2Eフロー（#17〜#23）           | 7          | -    | -    | -      |
| Step 4: エラーハンドリング（#24〜#27）  | 4          | -    | -    | -      |
| **合計**                                | **30**     | -    | -    | -      |

**問題一覧テーブル**（FAIL があった場合に記入）:

| #   | テスト番号 | 問題概要 | severity (Critical/Major/Minor) | 対応方針 |
| --- | ---------- | -------- | ------------------------------- | -------- |
| -   | -          | -        | -                               | -        |

**総合判定基準**:

| 判定条件          | 次のアクション                                         |
| ----------------- | ------------------------------------------------------ |
| 全テスト PASS     | Phase 12（ドキュメント）へ進行                         |
| Minor 問題のみ    | 未タスク仕様書候補としてリストアップし Phase 12 へ進行 |
| Major 問題あり    | Phase 差し戻し判断を記録し、該当 Phase へ戻る          |
| Critical 問題あり | Phase 1 へ戻り要件再確認                               |

**手動テスト総合判定**: -

**期待される成果物**:

- `outputs/phase-11/validation-test-result.md` — Step 2 バリデーションテスト結果
- `outputs/phase-11/regression-test-result.md` — Step 3 E2E 回帰テスト結果
- `outputs/phase-11/security-test-result.md` — Step 4 セキュリティテスト結果
- `outputs/phase-11/manual-test-summary.md` — 全 Step 手動テスト総括

---

## 統合テスト連携【必須】

> 手動テストで検出された問題は Phase 12 の未タスク検出で処理する

| 確認項目                   | 基準                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| バリデーションエラーテスト | 6ハンドラ x 空文字列・スペース・数値 = 13件 全て VALIDATION_ERROR |
| 正常入力テスト             | 正常な文字列でバリデーション通過・resolve                         |
| E2E 回帰テスト             | スキル一覧・詳細・実行・中止・ステータス・分析・改善 全て正常動作 |
| セキュリティテスト         | エラーレスポンスにスタックトレース・内部パスなし                  |

---

## 多角的チェック観点

| #   | 観点              | 確認ポイント                                                                           | Step   | 結果 |
| --- | ----------------- | -------------------------------------------------------------------------------------- | ------ | ---- |
| 1   | P42バリデーション | 6ハンドラで空文字列・スペースのみ入力が VALIDATION_ERROR で拒否される                  | Step 2 | -    |
| 2   | 正常動作          | 正常な文字列入力でバリデーションを通過し、ハンドラが正常に動作する                     | Step 2 | -    |
| 3   | 回帰影響          | 既存の UI 操作（一覧・詳細・実行・中止・ステータス・分析・改善）に影響がない           | Step 3 | -    |
| 4   | セキュリティ      | エラーレスポンスに内部情報（スタックトレース、ファイルパス、クラス名）が含まれていない | Step 4 | -    |
| 5   | エラーメッセージ  | バリデーションエラーメッセージがパラメータ名を正確に反映している                       | Step 2 | -    |
| 6   | IPC通信経路       | DevTools → Preload → Main → Preload → DevTools の往復で正しいエラーオブジェクトが返る  | Step 2 | -    |

---

## 成果物

| #   | 成果物                   | パス                                         | 内容                          |
| --- | ------------------------ | -------------------------------------------- | ----------------------------- |
| 1   | バリデーションテスト結果 | `outputs/phase-11/validation-test-result.md` | Step 2 の全テスト結果         |
| 2   | 回帰テスト結果           | `outputs/phase-11/regression-test-result.md` | Step 3 の E2E テスト結果      |
| 3   | セキュリティテスト結果   | `outputs/phase-11/security-test-result.md`   | Step 4 のセキュリティ確認結果 |
| 4   | 手動テスト総括           | `outputs/phase-11/manual-test-summary.md`    | 全 Step の結果集約と総合判定  |

---

## 完了条件チェックリスト

- [ ] Step 1: 開発サーバーが正常に起動し、DevTools から skill API にアクセスできる（#0-1〜#0-3）
- [ ] Step 2: 6ハンドラ x 空文字列・スペース文字列・数値の全バリデーションテスト PASS（#1〜#13）
- [ ] Step 2: 正常入力テスト PASS（#14〜#16）
- [ ] Step 3: 正常系回帰テスト全 PASS（#17〜#23）
- [ ] Step 4: エラーハンドリングが safeInvoke の catch ブロックで処理され、サニタイズされたエラーメッセージのみ表示される（#24〜#27）
- [ ] Step 4: エラーレスポンスに内部情報（スタックトレース、ファイルパス）が含まれていない
- [ ] Step 5: 全30テストケースの結果が記録されている
- [ ] Step 5: 発見された問題がある場合、severity（Critical / Major / Minor）と対応方針が記録されている
- [ ] Step 5: Critical / Major 問題がない場合のみ Phase 12 へ進む
- [ ] 成果物（4ファイル）が全て生成されている
- [ ] **本Phase内の全Step（5 Step）を100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全Step（Step 1〜5）を100%実行完了
- [ ] 各Stepを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 11 ステータスを `completed` に更新
- [ ] 発見された Critical / Major 問題がある場合、Phase 差し戻し判断を記録
- [ ] Minor 問題は未タスク仕様書候補としてリストアップ（Phase 12 Task 4 で処理）

---

## 依存関係

| 方向 | Phase / タスク           | 内容                               |
| ---- | ------------------------ | ---------------------------------- |
| 前提 | Phase 10（最終レビュー） | PASS または MINOR 判定             |
| 後続 | Phase 12（ドキュメント） | 手動テスト結果を未タスク検出に活用 |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-validation-consistency/phase-12-documentation.md`
