# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 12                                            |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

実装ガイド、システム仕様書更新、未タスク検出を実施する。Phase 12 は漏れが最も発生しやすい Phase であるため、全項目を逐次確認する。

## 実行タスク

- Task 1: 実装ガイド作成（Part 1: 中学生レベル概念説明、Part 2: 開発者向け技術詳細）
- Task 2: システム仕様書更新（spec-update-workflow.md 準拠）
- Task 3: documentation-changelog.md 作成
- Task 4: 未タスク検出

## 参照資料

| 資料名                  | パス                                                                           | 説明                   |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| Phase 12 チェックリスト | `.claude/rules/05-task-execution.md`                                           | Phase 12 必須項目      |
| 仕様書更新手順          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様書更新ワークフロー |
| 落とし穴集              | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P31, P43    |
| 実装コード              | `apps/desktop/src/main/ipc/index.ts`                                           | 実装内容の参照         |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### Task 1: 実装ガイド

#### Part 1: 中学生レベル概念説明

ファイル: `outputs/phase-12/implementation-guide.md`

**「お店のレジ」のたとえ:**

大きなショッピングモールを想像してください。このモールには30個のレジがあります。

**問題（修正前）:**
朝、お店を開ける時に30個のレジを順番に起動していきます。もし5番目のレジが故障していたら、5番目のレジでエラーが出てしまい、6番目以降のレジは起動すらできません。お客さんは1〜4番のレジしか使えません。

**解決策（修正後）:**
各レジを起動するときに「壊れていないかチェック」を入れます。もし5番目のレジが壊れていたら、「5番レジは故障中です」とメモして、6番目のレジの起動に進みます。結果として、5番以外の29個のレジは正常に使えます。

これが **Graceful Degradation（段階的な機能低下）** です。全体が止まるのではなく、壊れた部分だけが使えなくなり、残りは正常に動き続けます。

**技術用語との対応:**
| 日常の例え | 技術用語 |
| ---------------- | --------------------------- |
| ショッピングモール | Electron アプリケーション |
| レジ | IPC ハンドラ |
| レジの起動 | `registerXxxHandlers()` |
| 故障チェック | `try-catch` |
| 故障メモ | エラーログ出力 |

#### Part 2: 開発者向け技術詳細

ファイル: `outputs/phase-12/implementation-guide.md`（Part 1 に続けて記載）

**1. safeRegister パターン:**

```typescript
function safeRegister(
  handlerName: string,
  registerFn: () => void,
  failures: HandlerRegistrationFailure[],
): boolean {
  try {
    registerFn();
    return true;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[IPC] Failed to register ${handlerName}: ${errorMessage}`);
    failures.push({ handlerName, errorMessage, errorCode: 4001 });
    return false;
  }
}
```

**2. 戻り値型:**

```typescript
interface IpcHandlerRegistrationResult {
  successCount: number;
  failureCount: number;
  failures: HandlerRegistrationFailure[];
}
```

**3. テスト手法:**

- 各 `registerXxxHandlers` を `vi.mock` でモック化
- 特定のモックに `vi.fn().mockImplementation(() => { throw new Error("test"); })` を設定
- 後続ハンドラの呼び出しを `expect(registerXxx).toHaveBeenCalled()` で検証

**4. ログ構造:**

| レベル | フォーマット                                     | 出力条件              |
| ------ | ------------------------------------------------ | --------------------- |
| error  | `[IPC] Failed to register {name}: {message}`     | 個別ハンドラ失敗時    |
| warn   | `[IPC] {N}/{M} handlers failed to register`      | 1つ以上失敗で全体完了 |
| info   | `[IPC] All {N} handlers registered successfully` | 全成功時              |

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `api-ipc-system.md` にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `.claude/skills/task-specification-creator/LOGS.md` 更新（**2ファイル両方** — P1/P25対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] `api-ipc-system.md` の IPC ハンドラ登録パターンに Graceful Degradation を追記

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27対策）

#### Step 2: システム仕様更新

- [ ] `error-handling.md` にエラーコード 4001（IPC Handler Registration Failure）を追加
- [ ] `arch-electron-services.md` に Graceful Degradation パターンを記載
- [ ] `lessons-learned.md` に本タスクの教訓を追加

#### Step 3: IPC 契約検証（本タスクは IPC 修正のため実施）

- [ ] `registerAllIpcHandlers` の戻り値型変更が既存の IPC 契約に影響しないことを確認
- [ ] `unregisterAllIpcHandlers` が変更されていないことを確認

### Task 3: documentation-changelog.md

ファイル: `outputs/phase-12/documentation-changelog.md`

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録
- [ ] 全 Step 確認前に「完了」と記載しない（P4対策）

### Task 4: 未タスク検出

- [ ] `outputs/phase-12/unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了（P3/P38対策）:
  1. `unassigned-task/` に指示書作成
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

## 統合テスト連携

- 仕様書更新後、記載内容が実装と整合していることを検証する
- 実装ガイドのコードサンプルが実際の実装と一致していることを確認する

## 成果物

| 成果物               | パス                                          | 説明             |
| -------------------- | --------------------------------------------- | ---------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 + Part 2  |
| ドキュメント変更ログ | `outputs/phase-12/documentation-changelog.md` | 更新記録         |
| 未タスクレポート     | `outputs/phase-12/unassigned-task-report.md`  | 未タスク検出結果 |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル概念説明 — 「お店のレジ」のたとえ）が作成されている
- [ ] 実装ガイド Part 2（開発者向け技術詳細）が作成されている
- [ ] LOGS.md が2ファイル両方更新されている（P1/P25対策）
- [ ] SKILL.md が2ファイル両方更新されている（P29対策）
- [ ] topic-map.md が再生成されている（P2/P27対策）
- [ ] `error-handling.md` にエラーコード 4001 が追加されている
- [ ] documentation-changelog.md が作成されている
- [ ] 未タスクレポートが作成されている（0件でも必須）
- [ ] 全 Step を確認してから「完了」と記載している（P4対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成
