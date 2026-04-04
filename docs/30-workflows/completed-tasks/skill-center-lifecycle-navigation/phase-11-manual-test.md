# Phase 11: 手動テスト

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

**タスク種別: UI task → スクリーンショット取得必須**

---

## 1. スクリーンショット計画

| ID       | シナリオ                                                       | 撮影対象              | ライト/ダーク |
| -------- | -------------------------------------------------------------- | --------------------- | ------------- |
| TC-11-01 | `SkillCenterView`（「+新規作成」と「スキル管理」が並ぶ）       | ヘッダー部分          | 両方          |
| TC-11-02 | 「+新規作成」クリック後（`SkillCreateWizard` 表示）            | ウィザード全体        | 両方          |
| TC-11-03 | 「スキル管理」クリック後（`SkillManagementPanel` 表示）        | 管理パネル全体        | 両方          |
| TC-11-04 | `SkillManagementPanel` の lifecycle サブビュー表示             | `SkillLifecyclePanel` | ライトのみ    |
| TC-11-05 | `SkillManagementPanel` の戻るボタンで `SkillCenterView` に戻る | ヘッダー + 戻り導線   | ライトのみ    |

---

## 2. 手動テスト手順

```
1. アプリ起動
2. ⌘+5 → SkillCenterView が開くことを確認 [TC-11-01]
3. ヘッダーに「+新規作成」と「スキル管理」があることを確認
4. 「+新規作成」クリック → SkillCreateWizard が表示されることを確認 [TC-11-02]
5. 戻る / 閉じるで SkillCenterView に戻ることを確認
6. 「スキル管理」クリック → SkillManagementPanel が表示されることを確認 [TC-11-03]
7. SkillManagementPanel 内で lifecycle サブビューへ切り替えられることを確認 [TC-11-04]
8. 「戻る」ボタンで SkillCenterView に戻ることを確認 [TC-11-05]
```

---

## 3. 3層評価

| 層       | 評価観点                                                    | 判定 |
| -------- | ----------------------------------------------------------- | ---- |
| Semantic | 「+新規作成」と「スキル管理」の役割分担が明確か             | [ ]  |
| Visual   | primary / secondary の見た目が既存デザインと整合しているか  | [ ]  |
| AI UX    | `skillCreate` を壊さず `skillManagement` を追加できているか | [ ]  |

---

## 4. スクリーンショット保存先

```
outputs/phase-11/screenshots/
  TC-11-01-skill-center-light.png
  TC-11-01-skill-center-dark.png
  TC-11-02-skill-create-light.png
  TC-11-02-skill-create-dark.png
  TC-11-03-skill-management-light.png
  TC-11-03-skill-management-dark.png
  TC-11-04-skill-lifecycle-light.png
  TC-11-05-skill-center-return-light.png
```

---

## Phase 11 完了確認

- [ ] スクリーンショット 8 枚取得完了
- [ ] 3 層評価完了
- [ ] HIGH 問題なし（あれば未タスク化）
