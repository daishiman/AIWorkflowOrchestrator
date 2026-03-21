# test expansion report: UT-SLIDE-UI-001

## メタ情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | UT-SLIDE-UI-001 |
| Phase    | 6               |
| 作成日   | 2026-03-21      |

## 拡充対象

| 区分          | 追加・拡充内容                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 型 / 状態導出 | `types.test.ts` で `deriveSlideUIStatus()` の 4状態と境界ケースを拡充                                                       |
| selector      | `selectors.test.ts` で `useSlideUIStatus()` と個別 selector を拡充                                                          |
| component     | `SlideSyncCard.test.tsx` / `SlideGuidanceBlock.test.tsx` / `SlideProgressRow.test.tsx` / `TerminalLauncher.test.tsx` を拡充 |
| integration   | `SlideWorkspace.test.tsx` で synced / running / degraded / guidance の条件レンダリングを拡充                                |

## 主要確認点

- handoff guidance が `guidance` 状態へ反映されること
- degraded の retry が `manualSync` へ結線されること
- settings CTA が `setCurrentView("settings")` を呼ぶこと
- terminal command copy が `handoffGuidance.terminalCommand` を優先すること

## 補足

current environment では targeted vitest 実行時に `esbuild` native binary mismatch が発生するため、実行可否の再確認は Phase 9 / Phase 12 の changelog と verification report に集約した。
