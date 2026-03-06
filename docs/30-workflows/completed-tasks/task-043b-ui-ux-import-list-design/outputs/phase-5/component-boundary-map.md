# Phase 5 コンポーネント境界図

## Boundary

| 層           | 要素                    | 責務                                                        |
| ------------ | ----------------------- | ----------------------------------------------------------- |
| Panel Root   | `SkillManagementPanel`  | search、state priority、view switch、dialog state           |
| Imported UI  | imported card           | edit / analyze / remove actions                             |
| Available UI | available row           | request import trigger                                      |
| Dialog       | `SkillImportDialog`     | metadata preview、confirm / cancel、dialog-local focus trap |
| Store        | selector / action hooks | data source と side effect                                  |

## 非変更領域

- `SkillAnalysisView`
- `SkillCreateWizard`
- `SkillEditor`
- store slice 定義そのもの
