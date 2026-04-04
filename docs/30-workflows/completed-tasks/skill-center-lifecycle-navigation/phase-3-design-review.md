# Phase 3: 設計レビュー

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. 4条件評価

| 条件       | 評価    | 根拠                                                                                                                      |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| **価値性** | ✅ PASS | PR #1863/#1869/#1871/#1872 の実装済み機能を main-shell から到達可能にする。`SkillCreateWizard` の主導線は維持される       |
| **実現性** | ✅ PASS | 変更は 5 ファイル中心で、既存の `setCurrentView` と `SkillManagementPanel` の再利用で収まる                               |
| **整合性** | ✅ PASS | ViewType 命名規則（camelCase）、navigate 関数命名規則（`navigateTo{ViewName}`）、責務境界（Store 所有・Props 委譲）に準拠 |
| **運用性** | ✅ PASS | `/advanced/skill-create-wizard` URL で `SkillCreateWizard` が残存し、`skillManagement` は補助導線として追加される         |

---

## 2. 矛盾チェックリスト

| チェック項目                                            | 結果        | 備考                                                                                      |
| ------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| ViewType 重複                                           | ✅ なし     | `skillManagement` は既存と重複なし。`skillLifecycle` の top-level 化は採用しない          |
| `normalizeSkillLifecycleView()` との整合                | ✅ 確認済み | `"skill-center"` → `"skillCenter"` のエイリアス関数。新規 ViewType は正規形なので影響なし |
| `SkillManagementPanel` の既存テストへの影響             | ⚠️ 要対応   | Phase 4 で `skillManagement` 追加に伴うテスト差分を特定する                               |
| `useSkillCenter.ts` の `navigateToSkillCreate` 削除有無 | 決定: 維持  | `navigateToSkillCreate` は既存の主導線として残す                                          |

---

## 3. 漏れチェック

| 項目                                                    | チェック    | 備考                                                             |
| ------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `skillManagement` の `normalizeSkillLifecycleView` 対応 | ✅ 不要     | 正規形で追加するため変換不要                                     |
| `AppDock` / `NavShortcut` への追加                      | 決定: なし  | ショートカットキー割り当てはスコープ外（未タスク候補として記録） |
| `SkillManagementPanel` の「戻る」実装                   | ✅ 設計済み | `onClose` と back button で `skillCenter` に戻す                 |
| Phase 11 スクリーンショット                             | ✅ 必要     | UI task のため必須                                               |

---

## 4. ゲート判定

**判定: ✅ PASS → Phase 4 へ進む**

### 判断根拠

- 変更範囲が小さく、既存パターンを踏襲している
- 後退互換性が保たれている（`/advanced/` URL で旧ウィザードにアクセス可能）
- テスト戦略が明確で、6 テストケースが定義済み
- `SkillLifecyclePanel` の既存実装変更は不要
- `skillLifecycle` top-level route 案を破棄し、canonical route に収束している

### ブロッカー

なし

### MINOR 指摘（未タスク候補）

- `AppDock` / サイドバーに `skillManagement` のショートカットキーを追加する（スコープ外）

---

## Phase 3 完了確認

- [x] 4 条件評価完了
- [x] 矛盾チェック完了
- [x] 漏れチェック完了
- [x] ゲート判定完了（PASS）
- [x] Phase 4 進行承認
