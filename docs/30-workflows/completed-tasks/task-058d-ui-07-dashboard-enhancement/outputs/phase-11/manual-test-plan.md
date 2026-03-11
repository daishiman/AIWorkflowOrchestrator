# Phase 11 成果物: 手動テスト計画

## テストケース

| TC-ID    | 状態    | viewport / theme           | 目的                                        |
| -------- | ------- | -------------------------- | ------------------------------------------- |
| TC-11-01 | normal  | 1440x980 / light           | 標準デスクトップで情報階層と CTA 密度を確認 |
| TC-11-02 | empty   | 1440x980 / light           | welcoming EmptyState と primary CTA を確認  |
| TC-11-03 | loading | 1440x980 / dark            | skeleton 密度と暗色テーマ視認性を確認       |
| TC-11-04 | normal  | 390x844 / dark             | モバイル縦積みと CTA 到達性を確認           |
| TC-11-05 | normal  | 1440x980 / kanagawa-dragon | muted text と accent のバランスを確認       |

## 観点

- hierarchy: hero → suggestions → timeline の順で自然に視線が落ちるか
- density: card 高さと余白が窮屈でないか
- accessibility: CTA が focus-visible で見失われないか
- responsiveness: mobile でカード順序とラベルが崩れないか
