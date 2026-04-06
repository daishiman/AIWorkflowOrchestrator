# Phase 6 出力: テスト拡充

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### 拡充内容

既存テストの回帰確認と新規テストの網羅性確認。

| テストケース | 検証内容                                                 | 結果 |
| ------------ | -------------------------------------------------------- | ---- |
| TC-04d       | `header-create-cta` クリックで skillCreate が維持される  | PASS |
| TC-04e       | ローディング中は管理 CTA が表示されない                  | PASS |
| TC-04f       | 管理 CTA と作成 CTA が同じ header-row 内にある           | PASS |
| TC-03 (dock) | skillManagement 時に AppLayout に skillCenter が渡される | PASS |

### 既存テスト回帰確認

- `SkillCenterView.cta.test.tsx`: 全 35 件 PASS（新規 8 件含む）
- `SkillManagementPanel.integration.test.tsx`: 全件 PASS（変更なし）
- `SkillManagementPanel.route-classification.test.tsx`: 全件 PASS（変更なし）
