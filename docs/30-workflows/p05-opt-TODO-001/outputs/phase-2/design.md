# Phase 2: 設計書

## 設計結論

- `verify_existing` workflow として再構成する
- cleanup 実装は再実施しない
- Phase 11 は NON_VISUAL evidence に寄せる
- Phase 12 は canonical 6成果物 + parity を強制する

## concern 別方針

| concern       | 方針                                          |
| ------------- | --------------------------------------------- |
| code fact     | 実コードを再変更しない                        |
| history fact  | PR #2199 と commit `2fcca99de` を根拠にする   |
| artifact fact | root / outputs の JSON parity を取る          |
| evidence fact | manual-test-report を primary evidence にする |
