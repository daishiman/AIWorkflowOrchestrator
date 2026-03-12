# Screenshot Coverage

## 集計

- 対象 TC: 5
- 撮影完了: 5
- coverage: 100%
- theme: light 5 / dark 0
- 補助 JSON: `screenshots/capture-results.json`, `screenshots/phase11-dom-review.json`

## カバレッジ表

| テストケース | 画面                     | selector                                         | 結果 | 証跡                                         |
| ------------ | ------------------------ | ------------------------------------------------ | ---- | -------------------------------------------- |
| TC-11-01     | general chat             | `[data-testid='chat-view']`                      | PASS | `TC-11-01-general-chat-light.png`            |
| TC-11-02     | workspace handoff        | `[data-testid='workspace-view']`                 | PASS | `TC-11-02-workspace-handoff-light.png`       |
| TC-11-03     | skill-lifecycle handoff  | `[data-testid='skill-lifecycle-panel']`          | PASS | `TC-11-03-skill-lifecycle-handoff-light.png` |
| TC-11-04     | revive evidence          | `[data-testid='phase11-revive-evidence']`        | PASS | `TC-11-04-revive-recent-rail-light.png`      |
| TC-11-05     | streaming reset evidence | `[data-testid='phase11-stream-cancel-evidence']` | PASS | `TC-11-05-streaming-cancel-light.png`        |

## Apple UI/UX 所見

1. General chat は hierarchy が素直で primary action も見失わないが、初期表示の上部余白はやや広い。
2. Workspace handoff は file rail / bubbles / composer の3層が明快で、light theme の境界線も安定している。一方で composer が高く、bubble 行が少し詰まって見える。
3. Skill lifecycle handoff は create / execute / improve の因果関係を追いやすいが、1440x1024 では縦伸びして下部 orchestration が fold をまたぐ。
4. Revive / Stream reset は「何を復元するか」「何が消えたか」が一目で読め、dedicated harness としての説明力が高い。
