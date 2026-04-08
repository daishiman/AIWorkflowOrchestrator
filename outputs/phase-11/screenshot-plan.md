# W2-seq-03a スクリーンショット計画

## タスクID: W2-seq-03a

---

## 撮影対象

| No. | スクリーンショット名              | 対象ステップ | 撮影内容                                                    |
| --- | --------------------------------- | ------------ | ----------------------------------------------------------- |
| 1   | `TC-11-01-step0-skill-info.png`   | Step 0       | SkillInfoStep の初期表示（スキル名・purpose・カテゴリ選択） |
| 2   | `TC-11-02-step1-conversation.png` | Step 1       | ConversationRoundStep の表示（smartDefaults 反映後）        |
| 3   | `TC-11-03-step2-generate.png`     | Step 2       | GenerateStep の表示（LLM生成中）                            |
| 4   | `TC-11-04-step3-complete.png`     | Step 3       | CompleteStep の action cards 全表示                         |

---

## 撮影手順

### Step 0（SkillInfoStep）

1. `SkillCreateWizard` を開く
2. Step 0 が表示されていることを確認
3. スキル名に「テストスキル」を入力
4. purpose に「Slackに毎日レポートを送る」を入力
5. カテゴリに「schedule」を選択
6. スクリーンショットを撮影 → `TC-11-01-step0-skill-info.png`

### Step 1（ConversationRoundStep）

1. Step 0 で「次へ」をクリック
2. Step 1（ConversationRoundStep）が表示されることを確認
3. smartDefaults が反映されていることを確認（Slack が認識されていること）
4. スクリーンショットを撮影 → `TC-11-02-step1-conversation.png`

### Step 2（GenerateStep）

1. Step 1 で「今すぐ生成（詳細）」をクリック
2. Step 2（GenerateStep）が表示されることを確認
3. LLM生成中のローディング表示を確認
4. スクリーンショットを撮影 → `TC-11-03-step2-generate.png`

### Step 3（CompleteStep）

1. 生成完了後に Step 3（CompleteStep）が表示されることを確認
2. action cards（今すぐ実行・エディタで開く・別のスキルを作成・やり直す）が表示されていることを確認
3. Slack 外部連携情報が表示されていることを確認
4. スクリーンショットを撮影 → `TC-11-04-step3-complete.png`

---

## 撮影コマンド（Playwright）

```bash
node apps/desktop/scripts/capture-skill-create-wizard-w2-seq-03a-screenshots.mjs
```

---

## 保存先

```
outputs/phase-11/screenshots/
├── TC-11-01-step0-skill-info.png
├── TC-11-02-step1-conversation.png
├── TC-11-03-step2-generate.png
└── TC-11-04-step3-complete.png
```

---

## 注意事項

- Step 2（GenerateStep）の撮影は生成APIのモックが必要（実際の LLM API は呼ばない）
- `hasExternalIntegration: true` の状態を撮影するため、必ず "Slack" を含む purpose を入力すること
- スクリーンショットは 1280x800 の解像度で撮影する
