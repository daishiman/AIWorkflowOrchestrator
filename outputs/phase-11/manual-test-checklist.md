# 手動テスト チェックリスト — TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## 事前確認

- [x] `apps/desktop/src/renderer/utils/cronConverter.ts` に weekly 空曜日ガードが存在する
- [x] `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` に空曜日ケースが存在する
- [x] `apps/desktop/src/__tests__/utils/cronConverter.test.ts` に既存の正常系が存在する
- [x] Phase 11 は NON_VISUAL と判定されている

## 照合確認

- [x] AC-1: `weekly` かつ `weekdays: []` で空文字を返す
- [x] AC-2: `weekdays` あり weekly ケースが正常に返る
- [x] AC-3: 既存テストの回帰範囲が current facts と一致する
- [x] AC-4: 空曜日ケースの追加テストが存在する
- [x] AC-5: JSDoc にガード処理の説明がある

## 実行確認

- [x] ソース確認による semantic review を完了した
- [ ] `pnpm --filter @repo/desktop exec vitest run src/__tests__/utils/cronConverter.edge.test.ts src/__tests__/utils/cronConverter.test.ts --reporter=verbose` はこの workspace で esbuild mismatch により停止した

## 完了確認

- [x] `outputs/phase-11/manual-test-report.md` を作成した
- [x] `outputs/phase-11/discovered-issues.md` を作成した
- [x] `outputs/phase-11/ui-sanity-visual-review.md` を作成した
- [x] `outputs/phase-11/phase11-capture-metadata.json` を作成した
