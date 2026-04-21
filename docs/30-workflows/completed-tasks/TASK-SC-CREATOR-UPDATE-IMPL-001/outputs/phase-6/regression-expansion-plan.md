# Phase 6: テスト拡充計画

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## covered / uncovered 分類

| 観点                                         | update-TC で covered          | 状態                |
| -------------------------------------------- | ----------------------------- | ------------------- |
| 既存 SKILL.md からの purpose 読み込み        | update-TC-01                  | ✅ covered          |
| LLM による purpose 再生成                    | update-TC-02                  | ✅ covered          |
| LLM 失敗 → 既存 purpose フォールバック       | update-TC-03                  | ✅ covered          |
| SKILL.md 不存在 → description フォールバック | update-TC-04                  | ✅ covered          |
| AbortSignal による中断                       | update-TC-05                  | ✅ covered          |
| progress emit 順序                           | update-TC-06                  | ✅ covered          |
| multiline description パース                 | update-TC-01 で間接的にカバー | ✅ covered          |
| singleline description パース                | update-TC-03 で間接的にカバー | ✅ covered          |
| frontmatter なし SKILL.md                    | —                             | 🔲 uncovered (軽微) |
| skillPath 指定時のパス解決                   | —                             | 🔲 uncovered (軽微) |

## uncovered 観点への対応

| 観点                       | 対応方針                                                                        | 優先度 |
| -------------------------- | ------------------------------------------------------------------------------- | ------ |
| frontmatter なし SKILL.md  | Phase 8 リファクタリング時に `extractPurposeFromSkillMd` の単体テストを追加検討 | 低     |
| skillPath 指定時のパス解決 | update-TC-01 の `skillPath` 変形版を Phase 9 品質確認時に追加                   | 低     |

## 結論

主要な TC は update-TC-01〜06 で網羅されている。uncovered 観点はいずれも軽微（フォールバックが機能するため破壊的ではない）。重複追加を避けるため、Phase 6 での新規テスト追加は見送り、Phase 9 品質レポートで再評価する。
