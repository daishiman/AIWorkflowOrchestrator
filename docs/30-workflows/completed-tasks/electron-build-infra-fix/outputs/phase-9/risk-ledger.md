# Phase 9: Risk Ledger

| 種別        | 内容                                              | 重要度 | 取り扱い                    |
| ----------- | ------------------------------------------------- | ------ | --------------------------- |
| operational | AC-7 GUI 起動確認は CLI では確定できない          | 中     | operator checklist          |
| maintenance | `@electron/rebuild` 更新で CLI 挙動が変わる可能性 | 低     | version update 時に再確認   |
| environment | wider full suite は今回の review scope 外         | 低     | targeted guard は再実行済み |
