# 責務境界マップ - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## runCreateWorkflow → generateSkillMd パイプラインの責務

```
createSkill() [呼び出し側・オーケストレーター]
│
├── runCreateWorkflow(options)  [実行側]
│   責務: loadAgent を呼んで StructurePlanJson を組み立て返す
│   出力: StructurePlanJson | null
│
├── [接続コード] null チェック
│   if (structurePlan) → generateSkillMd 呼び出し
│   else → console.error でログ出力
│
└── generateSkillMd(skillDir, structurePlan)  [実行側]
    責務: structurePlan から plan オブジェクトを構築し
          tmp JSON 経由で generate_skill_md.js を実行して SKILL.md を生成する
    出力: void（副作用: SKILL.md ファイルの生成）
```

## 呼び出し側の責務

- `runCreateWorkflow` の戻り値を受け取る
- null チェックを行い、適切なブランチへ分岐する
- `generateSkillMd` に必要な引数（skillDir, structurePlan）を渡す
- エラーログを出力する（logger 非存在のため console.error）

## 実行側の責務

### `runCreateWorkflow`

- エージェントリソースを読み込んで StructurePlanJson を構築する
- 失敗時は null を返す（呼び出し元に例外を伝播しない）

### `generateSkillMd`

- StructurePlanJson から generate_skill_md.js 用の plan オブジェクトを変換する
- tmp ファイルの作成・削除を管理する
- SKILL.md の生成に失敗した場合は ensureSkillMdExists でフォールバックする
- 成功/失敗の判定は呼び出し元に委ねる（void 返却）
