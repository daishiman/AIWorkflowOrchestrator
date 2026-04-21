# TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL - タスク指示書

## メタ情報

| 項目           | 内容                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| タスクID       | TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL                                          |
| タスク名       | progress filter-by-id パターンの水平展開                                              |
| 分類           | リファクタリング（横断調査 + 選択的実装）                                             |
| 対象機能       | `skill-creator:progress` 以外の単一ブロードキャスト IPC 受信系                        |
| 優先度         | 中（混線リスクの顕在化に備える予防的タスク）                                          |
| 見積もり規模   | 中規模（調査の結果次第で小規模〜中規模に変動）                                        |
| ステータス     | unassigned                                                                            |
| 起票タイミング | FUP-02 完了後、Phase 11 NV-03（類似 emit 経路の横断調査）で対象受信系が特定された時点 |
| 発見元         | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID Phase 12 未タスク検出（候補 2）                 |
| 発見日         | 2026-04-20                                                                            |
| depends_on     | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID（完了済み）                                     |
| 関連タスク     | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID / TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED     |

---

## 1. ユーザー要求の要約

`useStreamingProgress` に導入した **filter-by-planId パターン**（`options.planId` と `progress.planId` の両方が指定されているときのみ mismatch を skip し、どちらか未指定なら全通知を受け入れる後方互換方式）を、`skill-creator:progress` 以外の単一ブロードキャスト IPC 受信系へ横展開する。対象受信系が実在することを横断調査で確認した上で、必要な受信 Hook へ `options.planId`（または同等の識別子）フィルタを導入し、混線リスクを予防する。

---

## 2. なぜこのタスクが必要か（Why）

### 2.1 背景

TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID では、`skill-creator:progress` チャンネルに `planId` / `requestId` を optional 付与し、`useStreamingProgress` 受信側で filter-by-planId パターンを実装した。これにより同一チャンネル上で複数の createSkill 実行が並行しても、UI が別実行の進捗で混線しない契約（L-STREAM-FUP-05）が成立した。

しかし、Electron アプリ全体を見渡すと `webContents.send` / `ipcMain.emit` を経由する**単一ブロードキャスト型の push IPC** は `skill-creator:progress` だけではない可能性が高い。execution progress、audit log stream、workflow event 通知など、将来複数並行呼び出しが発生しうる受信系でも同様の混線リスクが潜在している。

### 2.2 問題点・課題

- FUP-02 で策定した filter-by-planId 契約は `skill-creator:progress` に閉じた実装であり、他チャンネルへ体系的に展開されていない。
- 類似受信系が複数並行呼び出しされた際、受信側 Hook が識別子を持たないと別実行の payload を誤ってストアに反映する混線バグが発生する。
- `useStreamingProgress` のロジックを個別コピーすると、将来 `required 化`（FUP-03）へ移行する際に修正箇所が分散する。
- 対象受信系の洗い出し自体が未実施で、現時点では「展開すべき受信系が何個あるか」も不明である。

### 2.3 放置した場合の影響

- 将来 execution progress や audit log stream を並行呼び出す UI フロー（例: バックグラウンド workflow とフォアグラウンド skill 生成の同時進行）が追加された際、受信側で混線バグが発生し、再現困難な UX 不具合として発現する。
- filter-by-planId パターンが `useStreamingProgress` だけに閉じたまま、チーム内で「progress 系 IPC の標準契約」として定着しない。
- FUP-03（`planId` required 化）時、水平展開先が特定されていないと破壊的変更の影響範囲を見積もれない。

---

## 3. 何を達成するか（What）

### 3.1 目的

`skill-creator:progress` 以外の単一ブロードキャスト IPC 受信系を洗い出し、混線リスクのある受信 Hook に filter-by-id パターンを適用することで、**チャンネル多重化なしで並行呼び出しを安全に処理できる横断基盤**を確立する。

### 3.2 真の論点

- 単一ブロードキャスト IPC チャンネルの混線リスクは `skill-creator:progress` だけの問題か、それとも execution / audit 等にも共通の潜在問題か？
- filter ロジックを共通 helper（例: `createBroadcastFilter({ key: 'planId' })`）に抽出すべきか、それとも受信 Hook 側のインラインロジックとして残すべきか？
- 後方互換 3 条件（sender 未設定 / receiver 未設定 / 両方設定時の一致・不一致）は全受信系で同一契約とするか、チャンネルごとに方針を変えるか？

### 3.3 価値とコスト

| 観点     | 内容                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 価値     | 並行呼び出し時の UI 混線を予防。progress 系 IPC に一貫した識別子契約を定着させ、FUP-03（required 化）の影響範囲見積もりを容易にする。               |
| コスト   | 横断調査に工数を要する。対象受信系が 0 件の場合は「調査結果として記録 + close」で済むが、複数見つかった場合は受信系ごとに同等の filter 実装が必要。 |
| 不確実性 | 対象受信系の存在数と実装パターンの揃い具合により、実装粒度が小規模〜中規模に揺れる。                                                                |

### 3.4 最終ゴール

1. `webContents.send` / `ipcMain.emit` を経由する単一ブロードキャスト IPC チャンネルを洗い出した調査レポートが残っている。
2. 対象受信系ごとに「filter 水平展開する / 現状維持」の判断根拠が文書化されている。
3. 展開対象と判定された受信 Hook に `options.planId`（または同等識別子）フィルタが導入され、FUP-02 と同じ後方互換 3 条件を満たすテストが追加されている。
4. 共通 helper 化の要否判定が明文化されている（呼び出し元数と実装パターンの揃い具合で判断）。

### 3.5 スコープ

#### 含むもの

- 単一ブロードキャスト IPC チャンネルの横断洗い出し（`webContents.send` / `ipcMain.emit` / `BrowserWindow.webContents.send` / runtime facade の emit 経路）。
- 対象受信系ごとの混線リスク評価（並行呼び出し可能性 / 識別子の必要性）。
- 展開対象への `options.planId`（または同等キー）フィルタ導入、受信 Hook の `UseXxxOptions` 型拡張。
- 後方互換 3 条件テスト（sender 未設定 / receiver 未設定 / 両方設定時の一致 / 両方設定時の不一致）の追加。
- filter helper 共通化の要否判定（呼び出し元数と実装パターンの揃い具合を根拠に決定）。
- 判定結果の `lessons-learned-stream-001-progress-callback.md` への契約追記。

#### 含まないもの

- progress チャンネル自体の多重化（別チャンネル案）。
- サービス境界の再設計、runtime facade の構造刷新。
- `planId` を required 化する変更（FUP-03 の守備範囲）。
- `skill-creator:progress` への追加変更（FUP-02 で完了済み）。

### 3.6 成果物

| 種別                    | 成果物                                                                 | 配置先                                                                                              |
| ----------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 横断調査レポート        | 対象 IPC チャンネル一覧と混線リスク評価                                | `docs/30-workflows/TASK-SC-08-FUP-04-PROGRESS-FILTER-HORIZONTAL/outputs/phase-1/investigation.md`   |
| 実装（条件付き）        | 展開対象受信 Hook の filter 導入差分                                   | `apps/desktop/src/renderer/hooks/`（調査結果次第）                                                  |
| テスト                  | 後方互換 3 条件テスト                                                  | `apps/desktop/src/renderer/hooks/__tests__/`                                                        |
| 共通 helper（条件付き） | filter-by-id helper（呼び出し元 2 箇所以上かつパターン一致時のみ作成） | `apps/desktop/src/renderer/hooks/` または `packages/shared/`                                        |
| 契約追記                | filter-by-id 契約の横展開記録                                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md` |

---

## 4. 現状整理

### 4.1 FUP-02 で実装済みの内容

- `SkillCreatorProgress` 型に `planId?: string` / `requestId?: string` を追加（`apps/desktop/src/preload/skill-creator-api.ts`）。
- Main 側 `sendSkillCreatorProgress` が `planId` / `requestId` を payload に載せて `webContents.send` 発火（`apps/desktop/src/main/ipc/skillCreatorHandlers.ts`）。
- `useStreamingProgress(options?: { planId?: string })` で filter-by-planId を実装（`apps/desktop/src/renderer/hooks/useStreamingProgress.ts`）。
- 後方互換 3 条件テスト + エッジケース（空文字 / undefined 厳密区別）追加。

### 4.2 他受信系の調査状況

- **未調査**。FUP-02 本体のスコープ外だったため、NV-03（類似 emit 経路の洗い出し）以降に残されている。
- 現時点で類似候補として想定されているのは以下（要確認）:
  - `execution:progress` 系（workflow 実行進捗、もし存在すれば）
  - `audit:log` / `audit:stream` 系（監査ログストリーム、もし存在すれば）
  - Runtime Facade 経由の onProgress コールバックを IPC に橋渡しする他の経路

---

## 5. 対象候補の調査観点

### 5.1 洗い出し対象

| 経路                                                | grep パターン                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `webContents.send` 経由の単一ブロードキャスト       | `grep -REn 'webContents\.send\(' apps/desktop/src/main/`                     |
| `ipcMain.emit` / runtime facade の emit             | `grep -REn 'ipcMain\.emit\|emitProgress\|onProgress' apps/desktop/src/main/` |
| preload 側 `safeOn` / `ipcRenderer.on` リスナー登録 | `grep -REn 'safeOn\|ipcRenderer\.on' apps/desktop/src/preload/`              |
| renderer 側 Hook で `api.on*` を購読している箇所    | `grep -REn 'api\.on[A-Z]' apps/desktop/src/renderer/hooks/`                  |

### 5.2 各候補の評価観点

- 当該チャンネルは**単一プロセス内で並行呼び出しされうるか**？ されないなら識別子不要。
- payload に既に ID 系フィールドが含まれているか？ 含まれていれば filter キー選定が容易。
- 受信側 Hook の `Options` 型が存在するか、それとも引数なし Hook か？ 引数なしの場合は `options.planId` 追加と合わせて Hook API の破壊的変更になっていないか確認。
- 現時点で混線バグが報告されているか？ されていれば優先的に展開。

### 5.3 判定マトリクス

| 並行呼び出し可能性 | 既存 Options 型 | 判定                                  |
| ------------------ | --------------- | ------------------------------------- |
| あり               | あり            | filter 水平展開対象（実装フェーズへ） |
| あり               | なし            | Options 型追加含めて水平展開対象      |
| なし               | -               | 現状維持（調査結果に根拠を記録）      |
| 不明               | -               | さらに NV-03 で確認 / 暫定で現状維持  |

---

## 6. 変更対象ファイル想定

調査結果次第で確定。想定される変更箇所:

- `apps/desktop/src/renderer/hooks/<該当 Hook>.ts` … `options.planId` フィルタ追加、`useEffect` 依存配列調整。
- `apps/desktop/src/renderer/hooks/__tests__/<該当 Hook>.test.ts` … 後方互換 3 条件テスト追加。
- `apps/desktop/src/preload/<該当 API>.ts` … payload 型に `planId?: string` を追加（送信側改修が必要な場合）。
- `apps/desktop/src/main/ipc/<該当 Handler>.ts` … 送信時 `planId` 付与（送信側改修が必要な場合）。
- `apps/desktop/src/renderer/hooks/createBroadcastFilter.ts`（新設、共通化判定結果が Yes のとき）。
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md` … 横展開結果を L-STREAM-FUP-05 に追記。

---

## 7. Acceptance Criteria

| AC番号 | 条件                                                                                                                                                                           | 検証方法               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| AC-1   | 単一ブロードキャスト IPC チャンネルの横断調査レポートが `outputs/phase-1/investigation.md` に存在し、対象候補一覧・並行呼び出し可能性・identifier 有無が表形式で記録されている | レポート目視確認       |
| AC-2   | 対象受信系ごとに「水平展開する / 現状維持」の判定根拠が文書化されている（現状維持の場合も理由を記述）                                                                          | レポート目視確認       |
| AC-3   | 展開対象と判定された受信 Hook に `options.planId`（または同等キー）フィルタが導入されている                                                                                    | 差分確認（`git diff`） |
| AC-4   | 各展開対象に後方互換 3 条件（sender 未設定 / receiver 未設定 / 両方設定時の一致 / 両方設定時の不一致）のテストが追加されている                                                 | vitest run             |
| AC-5   | 空文字 `""` と `undefined` を厳密等価で区別するエッジケーステストが追加されている                                                                                              | vitest run             |
| AC-6   | `useEffect` 依存配列に filter キーが含まれ、cleanup → 再登録が正しく動作することを検証するテストが存在する                                                                     | vitest run             |
| AC-7   | 共通 helper 化の要否判定が記載されており、Yes の場合は helper が実装されている（呼び出し元 2 箇所以上かつ実装パターンが揃っているときのみ Yes）                                | レポート + 実装差分    |
| AC-8   | `lessons-learned-stream-001-progress-callback.md` の L-STREAM-FUP-05 に横展開結果が追記されている（対象 0 件の場合もその旨を明記）                                             | ファイル目視確認       |
| AC-9   | `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/desktop lint` / 追加テスト全てが PASS する                                                                      | CI ログ / 手元コマンド |

---

## 8. 苦戦箇所・学習事項

FUP-02 実装時の苦戦ポイントを次のタスクで簡潔に解決できるよう記述する。本タスク着手時は以下を**事前に確認**してから実装に入ること。

### 8.1 filter-by-id パターンの後方互換 3 条件テスト網羅

**症状**: 後方互換要件（`progress.planId` 未設定 / `options.planId` 未設定 / 両方設定時の一致・不一致）のうち 1 条件でもテストが欠けると、FUP-03（required 化）時に気付かずに破壊的変更を入れてしまう。

**知見**: 展開対象ごとに以下 4 ケースのテストを最低限必ず追加する。

1. receiver 未指定（`options.planId === undefined`）→ 全通知受け入れ
2. sender 未設定（`progress.planId === undefined`）→ legacy 互換で受け入れ
3. 両方設定で一致 → 受け入れ（match）
4. 両方設定で不一致 → skip（miss）

### 8.2 emit 経路が Runtime Facade か Main IPC Handler かの特定に時間がかかる

**症状**: FUP-02 では `sendSkillCreatorProgress` が Main IPC Handler 側にあったが、類似チャンネルでは Runtime Facade 側で直接 `webContents.send` している可能性がある。どこで payload を組み立てているかを先に特定しないと修正箇所を誤る。

**知見**: 横断調査フェーズで必ず「emit 元ファイル」と「payload 組み立て箇所」を投射的にマップしてから実装に入る。次のコマンドが有効。

```bash
grep -REn 'webContents\.send' apps/desktop/src/main/
grep -REn 'onProgress|emitProgress' apps/desktop/src/main/services/runtime/
```

### 8.3 `useEffect` 依存配列に filter キーを入れ忘れるとリーク

**症状**: FUP-02 初期実装で `useEffect` の依存配列に `options.planId` を含め忘れ、planId 変更時に古い listener が残って二重購読になるリスクがあった。

**知見**: filter キーを受け取る Hook を実装する際は、**依存配列にそのキーを必ず含める**。ESLint の `react-hooks/exhaustive-deps` も有効化しておくこと。cleanup → 新 listener 登録が正しく動くことをテストで明示的に検証する。

### 8.4 空文字 `""` と `undefined` の厳密等価区別

**症状**: `options.planId === ""` を filter 有効と見做すか無視するかで挙動が割れやすい。FUP-02 では「空文字は filter 有効（空文字同士の一致以外は skip）、undefined は filter 無効」と決めた。

**知見**: filter 条件は `!== undefined` で判定する（`!planId` のような truthy 判定は空文字を未指定と誤認するため禁止）。展開先でも同じ契約を踏襲する。

### 8.5 共通 helper 化の判断基準

**症状**: FUP-02 では `useStreamingProgress` 1 箇所のみのためインラインで実装したが、水平展開で 2 箇所以上になった瞬間にコピペ管理が破綻する。

**知見**: 以下の条件を**全て**満たすときのみ共通 helper（例: `createBroadcastFilter({ key: 'planId' })`）化する。

- 呼び出し元が 2 箇所以上
- 後方互換 3 条件のロジックが完全一致（key 名のみ差し替え可能）
- テストも同じ 4 ケース構造で書ける

片方でも満たさない場合は、インラインで残して各 Hook の責務を明示する方が保守しやすい。

### 8.6 Source evidence（FUP-02 由来）

- `docs/30-workflows/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md` の「後方互換ポリシー」「エッジケース」節
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md` の L-STREAM-FUP-05

---

## 9. 参照

- [TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID 正本](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/index.md)
- [Phase 12 未タスク検出（候補 2）](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/unassigned-task-detection.md)
- [Phase 12 実装ガイド（filter-by-id 擬似コード / 後方互換ポリシー）](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/implementation-guide.md)
- [TASK-SC-08-FUP-01-INTEGRATION-TEST](./TASK-SC-08-FUP-01-INTEGRATION-TEST.md)
- [TASK-SC-08-FUP-03-PAYLOAD-PLANID-REQUIRED（未 formalize）](../TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID/outputs/phase-12/unassigned-task-detection.md)
- [lessons-learned-stream-001-progress-callback.md（L-STREAM-FUP-05 契約）](../../../.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md)
- [useStreamingProgress.ts](../../../apps/desktop/src/renderer/hooks/useStreamingProgress.ts)
- [useStreamingProgress.test.ts](../../../apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts)
- [skill-creator-api.ts (preload)](../../../apps/desktop/src/preload/skill-creator-api.ts)
- [skillCreatorHandlers.ts](../../../apps/desktop/src/main/ipc/skillCreatorHandlers.ts)
