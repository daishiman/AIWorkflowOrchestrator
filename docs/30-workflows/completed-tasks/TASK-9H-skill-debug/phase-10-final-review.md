# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 10                         |
| Phase名    | 最終レビューゲート         |
| タスクID   | TASK-9H                    |
| 前提Phase  | Phase 9（品質保証）        |
| 後続Phase  | Phase 11（手動テスト検証） |
| ステータス | 未実施                     |
| 作成日     | 2026-02-27                 |
| 機能名     | TASK-9H-skill-debug        |

---

## 目的

全体品質・整合性を最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、セキュリティ・型安全性・IPC契約整合・アーキテクチャ・コード品質・テストの6観点で確認する。

## 背景

デバッグ機能は式評価（evaluate）を含むため、セキュリティリスクが通常のIPCハンドラーより高い。
最終レビューでは通常の品質観点に加え、式評価のサンドボックス化と入力バリデーションを重点的に検証する。
7つのIPCチャンネル全てがプロジェクトのセキュリティルール（04-electron-security.md）に準拠し、P42/P44/P45 の教訓が反映されていることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: セキュリティレビュー

**目的**: 全7チャンネルがプロジェクトのセキュリティ要件を満たし、式評価のサンドボックスが安全であることを確認する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillDebugger.ts` を読み込む
2. `apps/desktop/src/main/services/skill/DebugSession.ts` を読み込む
3. 7チャンネル全てで以下のセキュリティチェックを実施する
4. 式評価（`skill:debug:evaluate`）のサンドボックス実装を重点検証する
5. 問題があれば記録し、重要度を判定する

**セキュリティレビューマトリクス**:

| チャンネル                      | validateIpcSender | 引数バリデーション | sanitizeErrorMessage | getAllowedWindows | チャンネル定数参照 |
| ------------------------------- | ----------------- | ------------------ | -------------------- | ----------------- | ------------------ |
| `skill:debug:start`             | -                 | -                  | -                    | -                 | -                  |
| `skill:debug:command`           | -                 | -                  | -                    | -                 | -                  |
| `skill:debug:breakpoint:add`    | -                 | -                  | -                    | -                 | -                  |
| `skill:debug:breakpoint:remove` | -                 | -                  | -                    | -                 | -                  |
| `skill:debug:inspect`           | -                 | -                  | -                    | -                 | -                  |
| `skill:debug:evaluate`          | -                 | -                  | -                    | -                 | -                  |
| `skill:debug:event`             | -                 | -                  | -                    | -                 | -                  |

**P42準拠3段バリデーション検証**:

全7チャンネルの文字列引数が以下の3段バリデーションを実装していることを確認する:

| チャンネル                      | 型チェック(`typeof`) | 空文字列チェック(`=== ""`) | trim空文字列チェック(`.trim() === ""`) |
| ------------------------------- | -------------------- | -------------------------- | -------------------------------------- |
| `skill:debug:start`             | -                    | -                          | -                                      |
| `skill:debug:command`           | -                    | -                          | -                                      |
| `skill:debug:breakpoint:add`    | -                    | -                          | -                                      |
| `skill:debug:breakpoint:remove` | -                    | -                          | -                                      |
| `skill:debug:inspect`           | -                    | -                          | -                                      |
| `skill:debug:evaluate`          | -                    | -                          | -                                      |

**式評価サンドボックス検証**:

| 検証項目                           | 確認内容                                             | 結果 |
| ---------------------------------- | ---------------------------------------------------- | ---- |
| グローバルオブジェクトアクセス制限 | `process`, `require`, `__dirname` 等へのアクセス不可 | -    |
| ファイルシステムアクセス制限       | `fs`, `path` 等のモジュール使用不可                  | -    |
| ネットワークアクセス制限           | `fetch`, `http` 等のネットワーク操作不可             | -    |
| タイムアウト設定                   | 式評価に実行時間制限が設定されている                 | -    |
| エラーメッセージサニタイズ         | 評価エラーに内部パス情報が含まれない                 | -    |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク2: 型安全性・IPC契約整合レビュー

**目的**: Preload型定義とMainハンドラーの型が完全に整合し、P44/P45の教訓が反映されていることを確認する

**実行手順**:

1. `packages/shared/src/types/skill-debug.ts` の共有型定義を読み込む
2. `apps/desktop/src/preload/types.ts` のPreload型定義を読み込む
3. `apps/desktop/src/preload/channels.ts` のチャンネル定義を読み込む
4. 各ハンドラーの引数・戻り値型が全レイヤーで一致していることを確認する
5. 引数名のセマンティクスが実際の値と一致していることを確認する（P45対策）

**型整合性マトリクス**:

| チャンネル                      | Preload引数型 | Main引数型 | Preload戻り値型 | Main戻り値型 | 整合 |
| ------------------------------- | ------------- | ---------- | --------------- | ------------ | ---- |
| `skill:debug:start`             | -             | -          | -               | -            | -    |
| `skill:debug:command`           | -             | -          | -               | -            | -    |
| `skill:debug:breakpoint:add`    | -             | -          | -               | -            | -    |
| `skill:debug:breakpoint:remove` | -             | -          | -               | -            | -    |
| `skill:debug:inspect`           | -             | -          | -               | -            | -    |
| `skill:debug:evaluate`          | -             | -          | -               | -            | -    |
| `skill:debug:event`             | -             | -          | -               | -            | -    |

**P44/P45チェック（IPC契約ドリフト防止）**:

| チェック項目                              | 確認内容                                                                | 結果 |
| ----------------------------------------- | ----------------------------------------------------------------------- | ---- |
| ハンドラ引数形式とPreload呼び出し形式一致 | オブジェクト形式/文字列形式が全レイヤーで統一されている                 | -    |
| 引数名のセマンティクス一致                | 引数名（sessionId, skillName等）が実際に渡される値と一致                | -    |
| 共有型定義の使用                          | `packages/shared/src/types/skill-debug.ts` が全レイヤーで参照されている | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                                   | 更新状況 |
| ------------------------------------------ | -------- |
| `packages/shared/src/types/skill-debug.ts` | -        |
| `apps/desktop/src/preload/types.ts`        | -        |
| `apps/desktop/src/preload/channels.ts`     | -        |

**期待される成果物**:

- `outputs/phase-10/type-ipc-review.md`

---

### タスク3: アーキテクチャ整合性レビュー

**目的**: IPCチャンネルがホワイトリストに追加され、ハンドラーの登録・解除が正しく実装されていることを確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` と `ALLOWED_ON_CHANNELS` に7チャンネルが追加されていることを確認する
2. ハンドラーの `unregister` に7チャンネルの解除が実装されていることを確認する（P5対策）
3. レイヤー依存方向（Renderer → Preload → Main）が守られていることを確認する
4. SkillDebugger と DebugSession の責務分離を確認する

**アーキテクチャチェックリスト**:

| チェック項目                | 確認内容                                                           | 結果 |
| --------------------------- | ------------------------------------------------------------------ | ---- |
| ALLOWED_INVOKE_CHANNELS追加 | 6つのinvokeチャンネルが追加されている                              | -    |
| ALLOWED_ON_CHANNELS追加     | `skill:debug:event` イベントチャンネルが追加されている             | -    |
| ハンドラー登録              | 7チャンネルのハンドラーが登録されている                            | -    |
| ハンドラー解除              | 7チャンネルの `ipcMain.removeHandler()` が実装されている           | -    |
| レイヤー依存方向            | Renderer → Preload → Main の一方向依存                             | -    |
| contextBridge経由           | Renderer からの API アクセスが contextBridge 経由                  | -    |
| SkillDebugger責務           | デバッグセッションのライフサイクル管理に限定されている             | -    |
| DebugSession責務            | 個別セッションの状態管理（ブレークポイント、変数）に限定されている | -    |
| 同時セッション制限          | 複数デバッグセッションの並行実行が仕様どおり制限されている         | -    |

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

| テスト分類           | テストケース数 | 全PASS |
| -------------------- | -------------- | ------ |
| 正常系テスト         | -              | -      |
| 異常系テスト         | -              | -      |
| セキュリティテスト   | -              | -      |
| 境界値テスト         | -              | -      |
| 式評価サンドボックス | -              | -      |

**コード品質チェック**:

| チェック項目         | 基準                                 | 結果 |
| -------------------- | ------------------------------------ | ---- |
| ESLint               | エラー 0件                           | -    |
| TypeScript型チェック | エラー 0件                           | -    |
| any型使用            | 0件                                  | -    |
| 命名規則             | boolean は is/has/can プレフィックス | -    |
| テスト間状態リーク   | 各テストで状態リセット済み           | -    |

**期待される成果物**:

- `outputs/phase-10/quality-coverage-review.md`

---

### タスク5: 要件充足レビュー

**目的**: Phase 1 で定義された全ての機能要件（FR）と非機能要件（NFR）が実装されていることを確認する

**実行手順**:

1. Phase 1 の要件仕様を読み込む
2. 各FR/NFRに対して実装箇所を特定する
3. 要件と実装の対応を記録する
4. 未実装要件がある場合は重要度を判定する

**要件充足マトリクス**:

| 要件ID | 要件内容                      | 実装箇所          | 充足 |
| ------ | ----------------------------- | ----------------- | ---- |
| FR-1   | デバッグセッション開始/停止   | SkillDebugger     | -    |
| FR-2   | ブレークポイント設定/解除     | DebugSession      | -    |
| FR-3   | ステップ実行（Over/Into/Out） | DebugSession      | -    |
| FR-4   | 変数インスペクション          | DebugSession      | -    |
| FR-5   | 式評価                        | DebugSession      | -    |
| FR-6   | デバッグイベント通知          | skill:debug:event | -    |
| NFR-1  | 式評価のサンドボックス化      | -                 | -    |
| NFR-2  | 同時セッション数制限          | -                 | -    |

**期待される成果物**:

- `outputs/phase-10/requirements-review.md`

---

### タスク6: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜5の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                         | 次のアクション                                      |
| -------- | -------------------------------------------- | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                     | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）             | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能影響）     | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（サンドボックス突破リスク） | Phase 1 へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順**:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**戻り先決定基準**:

| 問題の種類                    | 戻り先                |
| ----------------------------- | --------------------- |
| サンドボックス要件の未充足    | Phase 1（要件定義）   |
| IPCインターフェース設計の問題 | Phase 2（設計）       |
| テスト設計の不足              | Phase 4（テスト作成） |
| 実装の問題（ロジックエラー）  | Phase 5（実装）       |
| コード品質の問題              | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| レビュー観点      | 結果 | 指摘事項 |
| ----------------- | ---- | -------- |
| セキュリティ      | -    | -        |
| 型安全性/IPC契約  | -    | -        |
| アーキテクチャ    | -    | -        |
| コード品質/テスト | -    | -        |
| 要件充足          | -    | -        |
| **最終判定**      | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料              | パス                                                                    | 内容             |
| --------------------- | ----------------------------------------------------------------------- | ---------------- |
| Phase 5 実装成果物    | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                 | 実装検証対象     |
| SkillDebugger実装     | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                 | デバッグサービス |
| DebugSession実装      | `apps/desktop/src/main/services/skill/DebugSession.ts`                  | セッション管理   |
| 共有型定義            | `packages/shared/src/types/skill-debug.ts`                              | デバッグ型定義   |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                                 | Preload API実装  |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                                     | 型定義           |
| チャンネル定数        | `apps/desktop/src/preload/channels.ts`                                  | チャンネル定義   |
| テストファイル        | `apps/desktop/src/main/services/skill/__tests__/SkillDebugger*.test.ts` | テストコード     |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-report.md`                                     | 品質検証結果     |
| Phase 1要件仕様       | `outputs/phase-1/requirements-definition.md`                            | 要件             |
| Phase 2設計           | `outputs/phase-2/architecture-design.md`                                | 設計             |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容             |
| ------------------ | --------------------------------------------------------------------------------- | ---------------- |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC セキュリティ |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 全体構成         |
| IPC Agent仕様      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャネル仕様  |
| Skill I/F仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型契約仕様       |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 契約検証基準     |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                              | P42/P44/P45      |

---

## 実行手順

1. タスク1〜タスク5の順でレビューを実施し、各観点の結果を個別成果物へ記録する。
2. タスク6で総合判定（PASS/MINOR/MAJOR/CRITICAL）を確定する。
3. 判定が MINOR の場合は未タスク化手順を実行し、後続 Phase へ引き継ぐ。

---

## 成果物

| 成果物                   | パス                                          | 内容                   |
| ------------------------ | --------------------------------------------- | ---------------------- |
| セキュリティレビュー     | `outputs/phase-10/security-review.md`         | セキュリティ検証結果   |
| 型安全性/IPC契約レビュー | `outputs/phase-10/type-ipc-review.md`         | 型・IPC整合性確認結果  |
| アーキテクチャレビュー   | `outputs/phase-10/architecture-review.md`     | 構成検証結果           |
| 品質・カバレッジレビュー | `outputs/phase-10/quality-coverage-review.md` | コード品質・テスト結果 |
| 要件充足レビュー         | `outputs/phase-10/requirements-review.md`     | 要件対応確認結果       |
| 最終判定                 | `outputs/phase-10/final-review-result.md`     | 判定結果               |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目           | 基準                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| 全テスト           | 100% パス                                                                     |
| IPC連携            | 7チャンネル全て正常動作確認済み                                               |
| セキュリティテスト | 式評価サンドボックス・sender検証・エラーサニタイズ・3段バリデーション確認済み |

---

## 多角的チェック観点

| 観点           | 確認ポイント                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------ |
| 機能要件充足   | 7チャンネル（start, command, breakpoint:add, breakpoint:remove, inspect, evaluate, event）全実装 |
| セキュリティ   | validateIpcSender全チャンネル実施、式評価サンドボックス化、P42準拠3段バリデーション              |
| 型安全性       | Preload型・Main型・共有型の完全整合、P44/P45準拠の引数命名統一                                   |
| アーキテクチャ | ホワイトリスト追加、unregister更新、レイヤー依存方向、責務分離（SkillDebugger/DebugSession）     |
| テスト網羅性   | 正常系・異常系・セキュリティ・式評価サンドボックステスト全カバー                                 |
| コード品質     | ESLint 0件、typecheck 0件、命名規則、SOLID原則準拠                                               |

---

## 完了条件

- [ ] セキュリティレビューで全7チャンネルが要件を満たしている
- [ ] 式評価サンドボックスが安全であることが確認されている
- [ ] P42準拠の3段バリデーションが全チャンネルで実装されている
- [ ] 型安全性レビューで型不整合がない（P44/P45準拠）
- [ ] アーキテクチャレビューでホワイトリスト・登録/解除が正しい
- [ ] テストカバレッジ目標を達成している（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全FR/NFRが実装されている
- [ ] ESLint エラー 0件
- [ ] TypeScript型チェック エラー 0件
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9H-skill-debug/phase-11-manual-testing.md`
