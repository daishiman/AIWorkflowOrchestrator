# documentation-changelog.md

## 変更履歴

### Phase 1: 要件定義

- `verify-ipc-4layer.cjs` の current facts を確認し、`skill-creator:configure-api` は既登録なので missing に含めない方針を確定した
- preload 同期の対象を `ALLOWED_INVOKE_CHANNELS` 6件 + `ALLOWED_ON_CHANNELS` 6件に固定した

### Phase 2: 設計

- `CHAT_EXPORT_CHANNELS` は spread で取り込む方針にした
- `FILE_SYSTEM_CHANNELS` は `SHOW_SAVE_DIALOG` の重複を避けるため、`WRITE_FILE` と `READ_FILE` だけを明示追加する方針に変えた

### Phase 3: 設計レビュー

- `ALLOWED_INVOKE_CHANNELS` 6件 + `ALLOWED_ON_CHANNELS` 6件の合計 12 件で preload / main の current facts を閉じることを確認した
- `verify-ipc-4layer.cjs` の Rule-1 / Rule-2 / Rule-3 が全 PASS になる前提に更新した

### Phase 4: テスト方針

- `verify-ipc-4layer.cjs` を最重要確認コマンドとして採用した
- `channels.skill-import.test.ts` の重複値チェックを意識して、`FILE_SYSTEM_CHANNELS` の丸ごと spread を避けた

### Phase 5: 実装

- `apps/desktop/src/preload/channels.ts` に `CHAT_EXPORT_CHANNELS` と `FILE_SYSTEM_CHANNELS` を反映した
- `ALLOWED_INVOKE_CHANNELS` と `ALLOWED_ON_CHANNELS` を実装どおりに更新した

### Phase 6-11: 確認・補強

- 型チェックと既存テストで preload 定義の崩れがないことを確認し、`verify-ipc-4layer.cjs` を PASS に固定した
- 手動テストは N/A とし、UI 影響がないことを前提にした

### Phase 12: ドキュメント更新

- `implementation-guide.md` を Part 1 / Part 2 構成へ再構成した
- `system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` を current facts と一致させた
- `artifacts.json` と `outputs/artifacts.json` の parity を同値に揃えた
- 計画系の表現を残さず、現在の実装状態をそのまま記録する形に寄せた

### Phase 13: PR 作成

- この workflow では PR 作成を行わないため、Phase 13 はスキップ扱いにした
