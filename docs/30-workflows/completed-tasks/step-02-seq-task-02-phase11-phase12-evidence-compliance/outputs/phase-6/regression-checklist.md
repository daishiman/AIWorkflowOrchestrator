# Regression Checklist

| fail path                     | 検出方法                                                                 | 判定                           |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| placeholder 残存              | `find .../outputs/phase-11/screenshots -name 'placeholder.png'`          | 0 件であること                 |
| TC-ID 抽出不能                | `validate-phase11-screenshot-coverage.js --json`                         | errors 0                       |
| implementation guide 骨格欠落 | `validate-phase12-implementation-guide.js --json`                        | errors 0                       |
| compliance が存在確認だけ     | `rg -n 'present' outputs/phase-12/phase12-task-spec-compliance-check.md` | 内容完了表に置換されていること |
