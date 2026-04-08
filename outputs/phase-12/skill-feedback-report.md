# スキルフィードバックレポート

## タスクID: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 良かった点

- `resolveHealthPolicy()` を shared 側の正本に寄せたことで、hook 側の責務がかなり薄くなった
- `useMainlineExecutionAccess` のテストが `buildMainlineExecutionAccessState()` への引数確認に集中でき、実装意図が読みやすかった
- Phase 11 の NON_VISUAL 証跡を先に固めたことで、Phase 12 の文章化が迷いなく進められた

## 改善点・気づき

- `outputs/phase-12/` に旧タスクの成果物と current task の草稿が混在しており、canonical ファイルの選定に一度迷った
- `docs/30-workflows/ut-health-policy-mainline-migration/index.md` と `artifacts.json` の status が古いままだと、実装済みでも workflow 上は未完了に見えてしまう
- async hook のテストは、`renderHook` 後に 1 ティック待たないと `act(...)` 警告が出ることがあった

## 今後のタスクへの推奨事項

- Phase 12 の成果物は、最初から task-specific の canonical 名で揃える
- workflow の進捗更新は、出力ファイルだけでなく `index.md` と `artifacts.json` まで同じ wave で同期する
- async な hook テストは、`renderAccessHook` のような flush helper を共通化する

## task-specification-creator スキルへのフィードバック

- Phase 12 の checklist に `index.md` と `artifacts.json` の status 同期を明示してほしい
- Phase 12 の出力テンプレートで、legacy draft ファイルが残る場合の扱いを先に書いてほしい
- Step 2 の条件付き更新では、正本コメントに追記すべき consumer のファイルパスを明示すると迷いが減る
