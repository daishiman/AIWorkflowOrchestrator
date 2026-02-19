# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 10                          |
| Phase名    | 最終レビューゲート          |
| タスクID   | TASK-9A-B                   |
| 前提Phase  | Phase 9（品質保証）         |
| 後続Phase  | Phase 11（手動テスト検証）  |
| ステータス | 完了                        |
| 作成日     | 2026-02-19                  |
| 機能名     | TASK-9A-B-ipc-file-handlers |

---

## 目的

全体品質・整合性を最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、セキュリティ・型安全性・アーキテクチャ・コード品質・テストの5観点で確認する。

## 背景

IPCハンドラーはセキュリティ境界に位置するため、最終レビューでは通常の品質観点に加え、セキュリティ観点を重点的に検証する。
6つのファイル編集チャンネルが全てプロジェクトのセキュリティルール（04-electron-security.md）に準拠していることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: セキュリティレビュー

**目的**: 全6ハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を読み込む
2. 6ハンドラー全てで以下のセキュリティチェックを実施する
3. `apps/desktop/src/preload/skill-api.ts` のPreload API側もレビューする
4. 問題があれば記録し、重要度を判定する

**セキュリティレビューマトリクス**:

| チャンネル            | validateIpcSender | validatePath | sanitizeErrorMessage | getAllowedWindows | チャンネル定数参照 |
| --------------------- | ----------------- | ------------ | -------------------- | ----------------- | ------------------ |
| `skill:readFile`      | -                 | -            | -                    | -                 | -                  |
| `skill:writeFile`     | -                 | -            | -                    | -                 | -                  |
| `skill:createFile`    | -                 | -            | -                    | -                 | -                  |
| `skill:deleteFile`    | -                 | -            | -                    | -                 | -                  |
| `skill:listBackups`   | -                 | -            | -                    | -                 | -                  |
| `skill:restoreBackup` | -                 | -            | -                    | -                 | -                  |

**パストラバーサル攻撃パターン検証**:

| 攻撃パターン                 | テスト有無 | 期待される動作                       |
| ---------------------------- | ---------- | ------------------------------------ |
| `../../../etc/passwd`        | -          | エラーを返しファイルにアクセスしない |
| `..\\..\\windows\\system32`  | -          | エラーを返しファイルにアクセスしない |
| `./../../sensitive`          | -          | エラーを返しファイルにアクセスしない |
| `%2e%2e%2f`（URLエンコード） | -          | エラーを返しファイルにアクセスしない |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク2: 型安全性レビュー

**目的**: Preload型定義とMainハンドラーの型が完全に整合していることを確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` の新規追加型を読み込む
2. `apps/desktop/src/main/ipc/skillHandlers.ts` のハンドラー引数・戻り値型と比較する
3. `packages/shared/src/ipc/channels.ts` のチャンネル型定義と `apps/desktop/src/preload/channels.ts` の整合性を確認する
4. 型不整合がある場合は記録する

**型整合性マトリクス**:

| メソッド      | Preload引数型 | Main引数型 | Preload戻り値型 | Main戻り値型 | 整合 |
| ------------- | ------------- | ---------- | --------------- | ------------ | ---- |
| readFile      | -             | -          | -               | -            | -    |
| writeFile     | -             | -          | -               | -            | -    |
| createFile    | -             | -          | -               | -            | -    |
| deleteFile    | -             | -          | -               | -            | -    |
| listBackups   | -             | -          | -               | -            | -    |
| restoreBackup | -             | -          | -               | -            | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 更新状況 |
| -------------------------------------- | -------- |
| `packages/shared/src/ipc/channels.ts`  | -        |
| `apps/desktop/src/preload/types.ts`    | -        |
| `apps/desktop/src/preload/channels.ts` | -        |

**期待される成果物**:

- `outputs/phase-10/type-safety-review.md`

---

### タスク3: アーキテクチャ整合性レビュー

**目的**: IPCチャンネルがホワイトリストに追加され、ハンドラーの登録・解除が正しく実装されていることを確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に6チャンネルが追加されていることを確認する
2. `unregisterSkillHandlers()` に6チャンネルの `ipcMain.removeHandler()` が追加されていることを確認する
3. レイヤー依存方向（Renderer → Preload → Main）が守られていることを確認する
4. `packages/shared/src/ipc/channels.ts`（正本）と `apps/desktop/src/preload/channels.ts` のチャンネル値が一致していることを確認する

**アーキテクチャチェックリスト**:

| チェック項目                       | 確認内容                                               | 結果 |
| ---------------------------------- | ------------------------------------------------------ | ---- |
| ホワイトリスト追加                 | `ALLOWED_INVOKE_CHANNELS` に6チャンネル追加済み        | -    |
| ハンドラー登録                     | `registerSkillHandlers()` に6ハンドラー追加済み        | -    |
| ハンドラー解除                     | `unregisterSkillHandlers()` に6チャンネル追加済み      | -    |
| チャンネル定数（正本と副本の一致） | `packages/shared` と `apps/desktop` のチャンネル値一致 | -    |
| レイヤー依存方向                   | Renderer → Preload → Main の一方向依存                 | -    |
| contextBridge経由                  | Renderer からの API アクセスが contextBridge 経由      | -    |
| writeFile後のスキル再スキャン      | writeFile ハンドラーで scanAvailableSkills が呼ばれる  | -    |

**期待される成果物**:

- `outputs/phase-10/architecture-review.md`

---

### タスク4: コード品質・テストカバレッジレビュー

**目的**: コード品質基準とテストカバレッジ目標を達成していることを確認する

**実行手順**:

1. Phase 9 の品質ゲート結果を読み込む
2. カバレッジ基準との照合を行う
3. テストケースの網羅性を確認する（正常系・異常系・セキュリティ）
4. コード品質基準（命名規則、重複、型安全性）の達成を確認する

**テストカバレッジサマリー**:

| 指標              | 目標 | 実績 | 判定 |
| ----------------- | ---- | ---- | ---- |
| Line Coverage     | 80%  | -    | -    |
| Branch Coverage   | 60%  | -    | -    |
| Function Coverage | 80%  | -    | -    |

**テストケース分類確認**:

| テスト分類         | テストケース数 | 全PASS |
| ------------------ | -------------- | ------ |
| 正常系テスト       | -              | -      |
| 異常系テスト       | -              | -      |
| セキュリティテスト | -              | -      |
| 境界値テスト       | -              | -      |

**期待される成果物**:

- `outputs/phase-10/quality-coverage-review.md`

---

### タスク5: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                     | 次のアクション                                      |
| -------- | ---------------------------------------- | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                 | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能影響） | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（データ漏洩リスク）     | Phase 1 へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順**:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**戻り先決定基準**:

| 問題の種類                    | 戻り先                |
| ----------------------------- | --------------------- |
| セキュリティ要件の未充足      | Phase 1（要件定義）   |
| IPCインターフェース設計の問題 | Phase 2（設計）       |
| テスト設計の不足              | Phase 4（テスト作成） |
| 実装の問題（ロジックエラー）  | Phase 5（実装）       |
| コード品質の問題              | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| レビュー観点      | 結果 | 指摘事項 |
| ----------------- | ---- | -------- |
| セキュリティ      | -    | -        |
| 型安全性          | -    | -        |
| アーキテクチャ    | -    | -        |
| コード品質/テスト | -    | -        |
| **最終判定**      | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料              | パス                                                         | 内容                   |
| --------------------- | ------------------------------------------------------------ | ---------------------- |
| IPCハンドラー実装     | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | Main Processハンドラー |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                      | Preload API実装        |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                          | 型定義                 |
| チャンネル定数        | `apps/desktop/src/preload/channels.ts`                       | チャンネル定義         |
| 共有チャンネル定数    | `packages/shared/src/ipc/channels.ts`                        | 共有チャンネル定義     |
| テストファイル        | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード           |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-gate-result.md`                     | 品質検証結果           |
| Phase 1要件仕様       | `outputs/phase-1/requirements-specification.md`              | 要件                   |
| Phase 2設計           | `outputs/phase-2/design-document.md`                         | 設計                   |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容             |
| ------------------ | ---------------------------------------------------------------------------- | ---------------- |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC セキュリティ |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | 全体構成         |

---

## 成果物

| 成果物                   | パス                                          | 内容                   |
| ------------------------ | --------------------------------------------- | ---------------------- |
| セキュリティレビュー     | `outputs/phase-10/security-review.md`         | セキュリティ検証結果   |
| 型安全性レビュー         | `outputs/phase-10/type-safety-review.md`      | 型整合性確認結果       |
| アーキテクチャレビュー   | `outputs/phase-10/architecture-review.md`     | 構成検証結果           |
| 品質・カバレッジレビュー | `outputs/phase-10/quality-coverage-review.md` | コード品質・テスト結果 |
| 最終判定                 | `outputs/phase-10/final-review-result.md`     | 判定結果               |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目           | 基準                                                   |
| ------------------ | ------------------------------------------------------ |
| 全テスト           | 100% パス                                              |
| IPC連携            | 6チャンネル全て正常動作確認済み                        |
| セキュリティテスト | パストラバーサル・sender検証・エラーサニタイズ確認済み |

---

## 多角的チェック観点

| 観点           | 確認ポイント                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------- |
| 機能要件充足   | 6チャンネル（readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup）全実装 |
| セキュリティ   | validateIpcSender, validatePath, sanitizeErrorMessage 全ハンドラー実施                       |
| 型安全性       | Preload型とMainハンドラー型の完全整合                                                        |
| アーキテクチャ | ホワイトリスト追加、unregister更新、レイヤー依存方向                                         |
| テスト網羅性   | 正常系・異常系・セキュリティテスト全カバー                                                   |
| コード品質     | 命名規則、重複排除、SOLID原則準拠                                                            |

---

## 完了条件

- [ ] セキュリティレビューで全6ハンドラーが要件を満たしている
- [ ] 型安全性レビューで型不整合がない
- [ ] アーキテクチャレビューでホワイトリスト・登録/解除が正しい
- [ ] テストカバレッジ目標を達成している
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-11-manual-test.md`
