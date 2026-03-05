# Phase 5 セクションリンクマップ

## 1. 反映元→反映先対応（SubAgent-IMP-SCREENS）

| 反映元ID | 反映元証跡                                    | 主反映先                         | 反映先証跡                                                                                                                        |
| -------- | --------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| SRC-T1   | `task-050-ui-00-ui-design-foundation.md:36`   | 00-1/00-2                        | `00-1-design-tokens.md:8`, `00-2-atoms-components.md:545`                                                                         |
| SRC-T2   | `task-050-ui-00-ui-design-foundation.md:279`  | 00-2/00-3/00-4                   | `00-2...:27`, `task-053...:28`, `task-054...:26`                                                                                  |
| SRC-T3   | `task-050-ui-00-ui-design-foundation.md:687`  | 00-3, 057, 058d                  | `task-053...:441`, `task-057...:195`, `task-058d...:254`                                                                          |
| SRC-T4   | `task-050-ui-00-ui-design-foundation.md:761`  | 00-2/00-3/00-4, 057              | `00-2...:517`, `task-053...:472`, `task-054...:326`, `task-057...:789`                                                            |
| SRC-T5   | `task-050-ui-00-ui-design-foundation.md:795`  | 00-2/00-3/00-4, 058b             | `00-2...:510`, `task-053...:464`, `task-054...:319`, `task-058b...:498`                                                           |
| SRC-T5C  | `task-050-ui-00-ui-design-foundation.md:842`  | 00-2/00-3, 058a                  | `00-2...:525`, `task-053...:482`, `task-058a...:949`                                                                              |
| SRC-T5D  | `task-050-ui-00-ui-design-foundation.md:950`  | 058a/058b/059b/030/058d/058e/061 | `task-058a...:19`, `task-058b...:49`, `task-059b...:26`, `task-030...:26`, `task-058d...:34`, `task-058e...:20`, `task-061...:34` |
| SRC-T5B  | `task-050-ui-00-ui-design-foundation.md:1000` | 058b/059b/058e                   | `task-058b...:761`, `task-059b...:229`, `task-058e...:367`                                                                        |
| SRC-T6   | `task-050-ui-00-ui-design-foundation.md:1055` | 00-2/00-3/00-4                   | `00-2...:536`, `task-053...:488`, `task-054...:340`                                                                               |

## 2. 仕様書別担当（関心ごとの分離）

| 仕様書       | 専任SubAgent            | 判定件数 |
| ------------ | ----------------------- | -------- |
| 00-1         | SubAgent-IMP-TOKENS     | 1        |
| 00-2         | SubAgent-IMP-ATOMS      | 5        |
| 00-3         | SubAgent-IMP-MOLECULES  | 7        |
| 00-4         | SubAgent-IMP-ORGANISMS  | 6        |
| 057〜061/030 | SubAgent-IMP-SCREENS    | 14       |
| 統合判定     | SubAgent-IMP-INTEGRATOR | 33       |

## 3. 不整合候補

- `00-1-design-tokens.md` の正本参照導線（A-001）
- `SRC-T5B` の onboarding 反映は責務外（A-030）

## 4. Task 100% 実行確認

- [x] 反映元と反映先の対応を記録
- [x] 仕様書別SubAgent分担を記録
- [x] 不整合候補を抽出
