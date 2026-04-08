# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 12                                          |
| Phase名    | ドキュメント更新                            |
| 前提Phase  | Phase 11                                    |
| 後続Phase  | Phase 13                                    |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

実装ガイド（Part 1・Part 2）、system-spec-update-summary、documentation-changelog、unassigned-task-detection、skill-feedback-report、phase12-task-spec-compliance-check の 6 成果物を揃え、`registerRuntimeSkillCreatorHandlers` が登録する 18 チャネル（public runtime 16 + auxiliary 2）の完全性を文書化する。

## 実行方針

- Task 12-1 を最初に完了させる
- Task 12-2〜12-5 は依存しない成果物を別々に出力できるため、各 Task を別 SubAgent に割り当てて並列実行する
- Task 12-6 は Task 12-1〜12-5 の成果物を突合する最終ゲートとして最後に実行する

---

## 実行タスク

### Task 12-1: 実装ガイドの作成

**目的**: 技術者・非技術者双方に伝わる 2 パート構成の実装ガイドを作成し、`outputs/phase-12/implementation-guide.md` に出力する。  
本タスクは NON_VISUAL のため、スクリーンショット参照は不要。Phase 11 の `outputs/phase-11/manual-test-result.md` を主証跡として参照する。

**進め方**: 下記 Part 1（中学生レベル）と Part 2（技術詳細）をこの順で記述する。見出し名はテンプレートどおり残す。

## Part 1

### なぜ必要か

名簿を作るしくみでは、同じ名前が二回書かれても気づきにくいことがある。気づかないままだと、いくつかの窓口が案内されない。だから、毎回名簿を見直して、重なりや抜けを見つける必要がある。

### 何をするか

受付名簿を作る本体を動かして、並んだ名前を集める。次に、順番をそろえて記録する。最後に、同じ名前が二回ないかを数え比べる。

### 日常の例え

学校の文化祭で各クラブの「相談窓口」を名簿管理する受付係を想像する。たとえば、同じクラブ名を 2 回書いてしまうと、後ろの行が使われなくなることがある。名簿チェック係が毎回重複と漏れを確認するのが今回のテストの役割。

### 今回作ったもの

| 日本語             | 英語                              | 役割                                |
| ------------------ | --------------------------------- | ----------------------------------- |
| 名簿チェックテスト | IPC handler registration snapshot | 18 個の窓口の重なりと抜けを見つける |
| 記録ファイル       | snapshot file                     | 登録一覧の記録を残す                |

---

## Part 2

### 型定義

`BrowserWindow` を最小スタブ化し、`string[]` で登録チャネルを保持する。

```typescript
type RegisteredChannel = string;
interface RuntimeHandlerContext {
  mainWindow: BrowserWindow;
  registered: RegisteredChannel[];
}
```

### APIシグネチャ

```typescript
function registerRuntimeSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  runtimeSkillCreatorService?: RuntimeSkillCreatorFacade,
  outputHandler?: SkillCreatorOutputHandler,
): void;
```

### 使用例

```typescript
vi.mock("electron", () => ({
  ipcMain: { handle: vi.fn() },
}));

const { registerRuntimeSkillCreatorHandlers } =
  await import("../creatorHandlers");
const { ipcMain } = await import("electron");

registerRuntimeSkillCreatorHandlers(mockMainWindow);

const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
  .map(([channel]) => channel as string)
  .sort();

expect(channels).toMatchSnapshot();
expect(new Set(channels).size).toBe(channels.length);
```

### エラーハンドリング

| ケース               | 挙動                                             | 呼び出し側対応     |
| -------------------- | ------------------------------------------------ | ------------------ |
| スナップショット差分 | テスト FAIL。意図変更時のみ `--update-snapshots` | 差分をレビュー     |
| 重複チャネル検出     | Set サイズ不一致で FAIL                          | 登録箇所を修正     |
| チャネル未登録       | 件数差分で FAIL                                  | 欠損チャネルを追加 |

### エッジケース

| ケース                         | 期待動作                       |
| ------------------------------ | ------------------------------ |
| public runtime 16 件の順序変更 | ソート済み配列で決定論的に比較 |
| auxiliary 2 件の欠損           | スナップショット差分で FAIL    |
| チャネル名リネーム             | スナップショット差分で FAIL    |
| 18 件を超える登録（誤追加）    | スナップショット差分で FAIL    |

### 設定項目と定数一覧

| 名称                     | 値 / パス                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| public runtime channels  | 16 件 (`skill-creator:*` 系)                                                                          |
| auxiliary channels       | 2 件 (`SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API`, `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED`) |
| 登録総数                 | 18 件                                                                                                 |
| スナップショットファイル | `apps/desktop/src/main/ipc/__tests__/__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap`       |
| テストファイル           | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`                          |

### テスト構成

- `vi.mock("electron")` で `ipcMain.handle` を spy し、チャネル名を収集
- 収集結果をソートしてスナップショット比較 + Set 重複検出
- 18 チャネル（16 public runtime + 2 auxiliary）が揃っていることを確認

---

### Task 12-2: system spec update summary

**目的**: タスク完了情報と spec 同期結果を summary として記録する

**実行手順**:

1. Step 1-A: タスク完了後に `task-workflow-completed.md` へ完了記録を追加する
2. Step 1-B: 実装状況テーブルに本タスク完了を記録する
3. Step 1-C: 関連タスクテーブルのステータスを更新する
4. Step 2: 新規インターフェース追加なし → N/A
5. `artifacts.json` と `outputs/artifacts.json` の title/type/status/phase artifact 名 parity を確認し、ずれたまま PASS にしない
6. `outputs/phase-12/system-spec-update-summary.md` に Step 1-A〜Step 2 の結果を記録する

---

### Task 12-3: ドキュメント更新履歴

**目的**: 更新内容を `documentation-changelog.md` に記録する

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. Step 1-A〜1-C・Step 2 の結果を個別記録する

---

### Task 12-4: 未タスク検出レポート

**目的**: Phase 12 完了後に未タスクを検出し記録する（0 件でも出力必須）

**候補検討（事前定義）**:

| 候補ID                               | 内容                            | 判定               |
| ------------------------------------ | ------------------------------- | ------------------ |
| UT-IPC-EXECUTION-CHANNELS-PARITY-001 | Renderer 側チャネル一覧との突合 | 別タスクとして既存 |
| TASK-CREATOR-HANDLERS-AUDIT-001      | 全ハンドラの処理時間特性調査    | 別タスクとして既存 |

**実行手順**:

1. 実装中に発見した新規課題を列挙する
2. 既存タスクとの重複チェックを行う
3. `outputs/phase-12/unassigned-task-detection.md` に記録する

---

### Task 12-5: スキルフィードバックレポート

**目的**: `task-specification-creator` / `aiworkflow-requirements` の改善点を記録する（改善点なしでも出力必須）

**実行手順**:

1. 本タスクで使用した `task-specification-creator` と `aiworkflow-requirements` の評価を記録する
2. `outputs/phase-12/skill-feedback-report.md` に出力する

---

### Task 12-6: phase12-task-spec-compliance-check

**目的**: Task 12-1〜12-5 の全完了と planned wording 排除を最終確認する

**実行手順**:

1. Task 12-1〜12-5 の成果物が揃っていることを確認する
2. `validate-phase12-implementation-guide.js` で Part 1 / Part 2 の要件を確認する
3. `validate-phase-output.js` と `verify-all-specs.js` で workflow 全体の整合を確認する
4. `rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" outputs/phase-12/*.md` の結果が 0 件であることを確認する
5. `outputs/phase-12/phase12-task-spec-compliance-check.md` に判定結果を記録する

---

## 参照資料

| 参照資料        | パス                                                                               | 内容          |
| --------------- | ---------------------------------------------------------------------------------- | ------------- |
| unassigned task | `docs/30-workflows/unassigned-task/UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001.md` | 元の仕様      |
| 手動テスト結果  | `outputs/phase-11/manual-test-result.md`                                           | Phase 11 証跡 |

---

## 成果物

| 成果物                                  | パス                                                     | 説明                     |
| --------------------------------------- | -------------------------------------------------------- | ------------------------ |
| 実装ガイド                              | `outputs/phase-12/implementation-guide.md`               | Part 1・Part 2           |
| `system-spec-update-summary.md`         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜Step 2 の要約  |
| ドキュメント更新履歴                    | `outputs/phase-12/documentation-changelog.md`            | 更新内容の記録           |
| 未タスク検出レポート                    | `outputs/phase-12/unassigned-task-detection.md`          | 新規課題の一覧（0 件可） |
| スキルフィードバック                    | `outputs/phase-12/skill-feedback-report.md`              | skill 評価レポート       |
| `phase12-task-spec-compliance-check.md` | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全タスク完了確認         |

---

## 完了条件

- [ ] 実装ガイド（Part 1・Part 2）が完成している
- [ ] システム仕様書が更新されている
- [ ] `system-spec-update-summary.md` が出力されている
- [ ] ドキュメント更新履歴が記録されている
- [ ] 未タスク検出レポートが出力されている（0 件でも可）
- [ ] スキルフィードバックレポートが出力されている
- [ ] `phase12-task-spec-compliance-check.md` が出力されている
- [ ] `outputs/phase-12/` 配下に成果物が配置されている

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目             | 内容 |
| ---------------- | ---- |
| 実行日時         | -    |
| 実行者           | -    |
| 完了判定         | -    |
| 未タスク検出件数 | -    |
| 特記事項         | -    |
