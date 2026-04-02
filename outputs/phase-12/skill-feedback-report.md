# Phase 12: スキルフィードバック — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## 学び

1. shared IPC channel の build 修正だけで close すると、Vitest 側の alias drift を見落としやすい
2. Phase 11 を NON_VISUAL にする場合でも、`manual-test-result.md` は metadata / fallback reason / source evidence まで書かないと placeholder 扱いになる
3. Phase 12 は task-specific outputs と generic outputs を混在させず、`artifacts.json` と task spec の参照先を canonical filename に揃えるべき
4. 同一 wave 内で follow-up を解消した場合は、unassigned を open のまま残さず completed 側へ移管して narrative も戻す必要がある
5. NON_VISUAL task でも `manual-test-checklist.md` を省略せず、checklist / result / discovered issues を 1 wave で揃えるべき

## next action

- Phase 1 で build/test parity の確認を明示する
- Phase 11 の NON_VISUAL テンプレートに discovered issues 0件記録を必須項目として追加する
- Phase 12 で canonical filename と artifacts の照合を必須にする
- Phase 11 の NON_VISUAL テンプレートに `manual-test-checklist.md` を必須成果物として追加する
