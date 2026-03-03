# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 10                        |
| Phase名    | 最終レビュー              |
| タスクID   | UT-UI-05A-GETFILETREE-001 |
| 前提Phase  | Phase 9（品質検証）       |
| 後続Phase  | Phase 11（手動テスト）    |
| ステータス | 未実施                    |
| 作成日     | 2026-03-03                |
| 機能名     | getfiletree-ipc           |
| Issue      | #948                      |

---

## 目的

多角的品質・整合性検証を行い、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、機能完全性・セキュリティ・IPC契約整合性・型安全性・コード品質の5観点で確認する。

## 背景

`skill:getFileTree` は新規IPCチャンネルの追加であり、セキュリティ境界に位置する。
Preload → Main → SkillFileManager の通信経路で、パストラバーサル攻撃やsender検証が正しく機能していることを保証する必要がある。
既存の `skillFileHandlers.ts` への追加であるため、既存ハンドラーとの一貫性も検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能完全性チェック

**目的**: `skill:getFileTree` が仕様通りに動作することを確認する

**実行手順**:

1. Phase 1（要件定義）の受入基準を読み込む
2. Phase 5（実装）の実装レポートを読み込む
3. 各受入基準が実装に反映されていることを検証する

**機能完全性チェックマトリクス**:

| 受入基準                                             | 実装ファイル                                          | 確認結果 |
| ---------------------------------------------------- | ----------------------------------------------------- | -------- |
| `skill:getFileTree` チャンネルが定義されている       | `preload/channels.ts`                                 | -        |
| Main Process ハンドラーが登録されている              | `main/ipc/skillFileHandlers.ts`                       | -        |
| SkillFileManager に getFileTree メソッドがある       | `main/services/skill/SkillFileManager.ts`             | -        |
| Preload API に getFileTree が公開されている          | `preload/skill-api.ts`                                | -        |
| 型定義に SkillFileTreeNode が定義されている          | `preload/types.ts`                                    | -        |
| useFileTree フックの型キャスト（as）が解消されている | `renderer/views/SkillEditorView/hooks/useFileTree.ts` | -        |
| ディレクトリ構造を再帰的に取得できる                 | テスト結果で確認                                      | -        |
| ファイルの name, path, type, children が含まれる     | テスト結果で確認                                      | -        |

**期待される成果物**:

- `outputs/phase-10/functional-completeness.md`

---

### タスク2: セキュリティレビュー

**目的**: `skill:getFileTree` ハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillFileHandlers.ts` の `skill:getFileTree` ハンドラーを読み込む
2. 以下のセキュリティチェック項目を全て検証する
3. `apps/desktop/src/preload/skill-api.ts` の Preload API 側もレビューする
4. 問題があれば記録し、重要度を判定する

**セキュリティレビューマトリクス**:

| チェック項目           | 内容                                                   | 確認結果 |
| ---------------------- | ------------------------------------------------------ | -------- |
| validateIpcSender      | 送信元ウィンドウの検証が実装されている                 | -        |
| P42: 3段バリデーション | typeof → 空文字列 → trim空文字列 の3段チェック         | -        |
| パストラバーサル対策   | スキル名にパストラバーサル文字列が含まれていないか検証 | -        |
| sanitizeErrorMessage   | エラーメッセージから内部情報が漏洩しない               | -        |
| getAllowedWindows      | 許可ウィンドウリストが正しく設定されている             | -        |
| チャンネル定数参照     | ハードコード文字列ではなく IPC_CHANNELS 定数を使用     | -        |

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

### タスク3: IPC契約整合性チェック

**目的**: ipc-contract-checklist.md Phase 1-6 に準拠した契約整合性を確認する

**実行手順**:

1. ハンドラー側の引数形式を確認する
2. Preload 側の呼び出し形式を確認する
3. 両者が一致していることを検証する
4. 引数名のセマンティクスが実際の値と一致していることを確認する（P45対策）

**IPC契約整合性チェックリスト**:

| チェック項目                        | 確認内容                                                       | 確認結果 |
| ----------------------------------- | -------------------------------------------------------------- | -------- |
| チャンネル名定義                    | `IPC_CHANNELS` に `SKILL_GET_FILE_TREE` が定義されている       | -        |
| ハンドラー引数形式                  | `skillName: string` 形式で受け取る                             | -        |
| Preload呼び出し形式                 | `safeInvoke(IPC_CHANNELS.SKILL_GET_FILE_TREE, skillName)` 形式 | -        |
| 引数名セマンティクス一致（P45対策） | `skillName` パラメータに実際のスキル名が渡される               | -        |
| 戻り値型一致                        | Main → Preload → Renderer で `SkillFileTreeNode[]` が一貫      | -        |
| エラーレスポンス形式                | サニタイズされたエラーオブジェクトを返す                       | -        |

**期待される成果物**:

- `outputs/phase-10/ipc-contract-review.md`

---

### タスク4: 型安全性チェック

**目的**: 型定義の整合性と型キャストの解消を確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` の `SkillFileTreeNode` 型定義を読み込む
2. `SkillAPI` インターフェースに `getFileTree` メソッドが追加されていることを確認する
3. `useFileTree.ts` フックの型キャスト（`as`）が解消されていることを確認する
4. 型不整合がある場合は記録する

**型安全性チェックマトリクス**:

| チェック項目                                     | ファイル                                              | 確認結果 |
| ------------------------------------------------ | ----------------------------------------------------- | -------- |
| SkillFileTreeNode 型が定義されている             | `preload/types.ts`                                    | -        |
| SkillAPI.getFileTree メソッドが型定義にある      | `preload/types.ts`                                    | -        |
| useFileTree で型キャスト（as）が使用されていない | `renderer/views/SkillEditorView/hooks/useFileTree.ts` | -        |
| SkillFileManager.getFileTree の戻り値型が一致    | `main/services/skill/SkillFileManager.ts`             | -        |
| pnpm typecheck が全てパスする                    | TypeScript コンパイル結果                             | -        |

**期待される成果物**:

- `outputs/phase-10/type-safety-review.md`

---

### タスク5: コード品質チェック

**目的**: 既存パターンとの一貫性およびエラーハンドリングの品質を確認する

**実行手順**:

1. `skillFileHandlers.ts` の既存ハンドラー（readFile, writeFile 等）とのパターン一貫性を確認する
2. エラーハンドリングが `Result<T, E>` パターンまたはサニタイズ済みエラーを返していることを確認する
3. 命名規則（boolean は `is`/`has` プレフィックス等）が守られていることを確認する
4. 未使用 import がないことを確認する

**コード品質チェックリスト**:

| チェック項目                 | 確認内容                                           | 確認結果 |
| ---------------------------- | -------------------------------------------------- | -------- |
| 既存ハンドラーとの構造一貫性 | 他の skill:\* ハンドラーと同じ構造で実装されている | -        |
| エラーハンドリングパターン   | try-catch + sanitizeErrorMessage が使用されている  | -        |
| バリデーションパターン       | 他のハンドラーと同じ3段バリデーション              | -        |
| Lint エラーなし              | `pnpm lint` がパスする                             | -        |
| 未使用 import なし           | ESLint の no-unused-imports がパスする             | -        |

**期待される成果物**:

- `outputs/phase-10/code-quality-review.md`

---

## 多角的チェック観点テーブル

| 観点           | 該当性 | 重要度 | 確認タスク |
| -------------- | ------ | ------ | ---------- |
| セキュリティ   | 必須   | 高     | タスク2    |
| IPC契約整合性  | 必須   | 高     | タスク3    |
| 型安全性       | 必須   | 高     | タスク4    |
| アーキテクチャ | 必須   | 中     | タスク5    |
| UI/UX          | 非該当 | -      | -          |
| パフォーマンス | 低     | 低     | -          |

---

## 参照資料

| 資料名                | パス                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| Phase 9 成果物        | `outputs/phase-9/quality-report.md`                                           |
| Phase 1 要件定義      | `phase-1-requirements.md`                                                     |
| Phase 5 実装レポート  | `outputs/phase-5/implementation-report.md`                                    |
| セキュリティルール    | `.claude/rules/04-electron-security.md`                                       |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          |

依存Phase参照: Phase 1, Phase 2, Phase 5

---

## レビューゲート判定基準

| 判定     | 条件                                                         | 対応                                           |
| -------- | ------------------------------------------------------------ | ---------------------------------------------- |
| PASS     | 全5タスクで問題なし                                          | Phase 11 へ進む                                |
| MINOR    | 軽微な問題のみ（コメント不足、命名改善等）                   | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | セキュリティ・型安全性・IPC契約に問題あり                    | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | パストラバーサル未防御、sender未検証等の重大セキュリティ問題 | Phase 1 へ戻り要件再確認                       |

---

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 10 の定義/成果物と api-ipc-agent.md を照合する         |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物               | パス                                          |
| -------------------- | --------------------------------------------- |
| 機能完全性レビュー   | `outputs/phase-10/functional-completeness.md` |
| セキュリティレビュー | `outputs/phase-10/security-review.md`         |
| IPC契約レビュー      | `outputs/phase-10/ipc-contract-review.md`     |
| 型安全性レビュー     | `outputs/phase-10/type-safety-review.md`      |
| コード品質レビュー   | `outputs/phase-10/code-quality-review.md`     |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     |

---

## 完了条件

- [ ] タスク1: 全受入基準が実装に反映されていることを確認した
- [ ] タスク2: セキュリティレビューマトリクスの全項目を確認した
- [ ] タスク2: パストラバーサル攻撃パターンの全テストを確認した
- [ ] タスク3: IPC契約整合性チェックリストの全項目を確認した
- [ ] タスク4: 型安全性マトリクスの全項目を確認した
- [ ] タスク4: useFileTree の型キャスト（as）が存在しないことを確認した
- [ ] タスク5: 既存ハンドラーとの構造一貫性を確認した
- [ ] タスク5: Lint エラーがないことを確認した
- [ ] レビューゲート判定を実施し結果を `outputs/phase-10/final-review-result.md` に記録した
- [ ] MINOR 指摘がある場合は全て未タスク仕様書に変換した

---

## 次Phase

| レビュー結果 | 次Phase                           |
| ------------ | --------------------------------- |
| PASS         | Phase 11（手動テスト）へ進む      |
| MINOR        | 未タスク化後 Phase 11 へ進む      |
| MAJOR        | 影響範囲に応じて Phase 1-5 へ戻る |
| CRITICAL     | Phase 1 へ戻り要件再確認          |
