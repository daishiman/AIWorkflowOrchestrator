# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## TASK-FIX-SAFEINVOKE-TIMEOUT-001 教訓（2026-03-10）

### 苦戦箇所: timeout 実装の責務は Preload だが、失敗影響は UI に現れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `invokeWithTimeout()` の修正自体は Preload 層でも、実害は AuthGuard timeout fallback や Settings 公開シェルでしか可視化されない |
| 再発条件 | 「内部ユーティリティ修正なので画面検証は不要」と判断する |
| 対処 | current workflow 配下へ screenshot 4件を取得し、timeout fallback と Settings shell の実影響を証跡化した |
| 標準ルール | ユーザーが screenshot を明示要求したら、非UIタスクでも影響 UI を代表画面として撮影する |

### 実装教訓: Promise.race パターンのシンプルさと clearTimeout cleanup の判断

| 項目 | 内容 |
| --- | --- |
| 発見 | IPC タイムアウトは `Promise.race([ipcRenderer.invoke(ch, args), timeoutPromise])` で驚くほどシンプルに実装できた。複雑な AbortController やカスタムキャンセル機構は不要 |
| clearTimeout 判断 | 設計段階で cleanup の要否を検討した。結論: 採用。成功/失敗の両分岐で `clearTimeout(timeoutId)` を実行し、短命 timer の残留を防いだ |
| 判断根拠 | (1) fake timers テストで pending timer が残らず再現性が上がる、(2) 高頻度 invoke 時の不要 timer 残留を避けられる, (3) `invokeWithTimeout()` に閉じ込めれば呼び出し側の複雑さは増えない |
| 標準ルール | timeout 導入タスクでは「発火条件」「エラーメッセージ文言」「cleanup 責務の配置」の3点を設計時に確認する |

### 実装教訓: 3ファイル重複 safeInvoke の DRY 統合

| 項目 | 内容 |
| --- | --- |
| 発見 | `safeInvoke` が `index.ts`、`skill-api.ts`、`skill-creator-api.ts` の3ファイルに重複実装されていた。タイムアウト追加時に3箇所を個別修正する必要があり、DRY 違反が顕在化 |
| 判断プロセス | (1) `grep -rn "safeInvoke" apps/desktop/src/preload/` で重複を検出 → (2) 共通ロジックを `ipc-utils.ts` に抽出 → (3) 各ファイルから import して使用 |
| 効果 | 1箇所の修正で全 IPC 呼び出しにタイムアウトが適用される。将来の `IPC_TIMEOUT_MS` 値変更も定数1箇所で完結 |
| 副次効果 | `safeInvokeUnwrap` は内部で `safeInvoke` を呼ぶため、タイムアウト機構が自動的に適用された。上位ラッパーの修正不要 = DRY 統合の実証的メリット |
| 標準ルール | ユーティリティ関数を修正する前に `grep -rn` で重複実装を検索し、DRY 統合の機会を評価する |

### 実装教訓: Fake Timer テスト戦略（P13 準拠）

| 項目 | 内容 |
| --- | --- |
| 戦略 | `vi.useFakeTimers()` + `vi.advanceTimersByTime(IPC_TIMEOUT_MS)` で deterministic なタイマーテスト。タイムアウト発火を正確に制御できる |
| P13 遵守 | `vi.runAllTimers()` は `Promise.race` + `setTimeout` の再スケジュールで無限ループするため使用禁止。必ず `advanceTimersByTime` で1ステップずつ進める |
| テストパターン | `ipcRenderer.invoke` を未解決の Promise で制御し、`advanceTimersByTime(IPC_TIMEOUT_MS)` でタイマーを進行させ、タイムアウトエラーの発火を検証。正常応答テストでは Timer 進行前に Promise を resolve して成功パスを確認 |
| 標準ルール | Promise.race + setTimeout のテストでは `runAllTimers` / `runAllTimersAsync` を絶対に使わず、`advanceTimersByTime` で必要な時間だけ進める |

### 実装補遺: Preload タイマーテストと contextBridge capture

| 項目 | 内容 |
| --- | --- |
| contextBridge capture | `preload/index.ts` 単体では `contextBridge.exposeInMainWorld` に公開された API を capture して評価すると、Renderer 実利用形に近い形で回帰を確認しやすい |
| fake timer 順序 | fake timers は `invokeWithTimeout()` 呼び出し前に有効化し、Promise 作成後に `advanceTimersByTime` で進めると timeout 分岐を安定再現できる |
| Promise.race helper 判断 | timeout 制御は各 API ごとに書かず、共通 helper に閉じ込めて `safeInvoke` / `safeInvokeUnwrap` から再利用させると rollout 漏れを減らせる |
| カバレッジ判定 | timeout helper は file-scope 100% を狙い、Preload API 側は representative route の回帰で閉じると責務境界がぶれにくい |

### 苦戦箇所: Phase 12 の planned wording が system spec 同期漏れを招く

| 項目 | 内容 |
| --- | --- |
| 課題 | `spec-update-summary.md` / `documentation-changelog.md` に「PR マージ時に実施予定」が残ると、実際の仕様同期が未完了でも成果物だけ揃って見える |
| 再発条件 | workflow outputs を先に書き、`.claude/skills/...` 正本の更新を後回しにする |
| 対処 | system spec 5件、SKILL/LOGS 4件、workflow outputs を同一ターンで更新し、「予定」表現を全撤去した |
| 標準ルール | Phase 12 完了判定は「正本更新済み」「未タスク登録済み」「outputs記述が実績ベース」の3点同時達成とする |

### 同種課題の簡潔解決手順（6ステップ）

1. ユーティリティ修正前に `grep -rn` で重複実装を検索し、DRY 統合の機会を評価する。
2. Promise.race + setTimeout パターンでは clearTimeout の要否を GC 安全性の観点で判断し、根拠を設計書に記録する。
3. Fake Timer テストでは `advanceTimersByTime` のみ使用し、`runAllTimers` は禁止（P13 準拠）。
4. 影響 UI があるなら、内部修正でも screenshot 対象を先に決める。
5. Phase 12 では system spec / SKILL / LOGS / workflow outputs を同一ターンで更新する。
6. 再監査で見つかった別責務の差分は未タスク化し、主タスクの完了判定と分離する。

