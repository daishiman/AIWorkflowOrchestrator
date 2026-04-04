# FR-04 verify 契約 — 現状記載状況調査

## 調査結果

### FR-04 関連記載の現状

| ファイル                                                     | FR-04 関連記載 | 内容                                                          |
| ------------------------------------------------------------ | -------------- | ------------------------------------------------------------- |
| `lessons-learned-auth-ipc-fallback-registration-settings.md` | あり           | FR-04 定義の仕様ドリフト問題を記録                            |
| `lessons-learned-current.md`                                 | あり           | TASK-P0-01 SkillCreatorVerificationEngine Layer 1/2 の教訓3件 |
| `task-workflow-completed.md`                                 | あり           | UT-IMP-SDK-06 Layer3/4 拡張の完了記録                         |
| `interfaces-agent-sdk-skill.md`                              | なし           | FR-04 セクションなし                                          |
| `arch-execution-capability-contract.md`                      | なし           | 実行能力契約に特化、verify 未記載                             |

### check ID 体系の記載状況

- **既に記載あり**: なし（コード内のみ）
- **散在する情報**: lessons-learned に断片的な言及があるのみ
- **体系的な定義**: 未ドキュメント化

### 追記候補先ファイル

| 優先度    | 方針        | ファイル                                           | 理由                                                                                                                                 |
| --------- | ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1（推奨） | B: 新規作成 | `references/interfaces-skill-verify-contract.md`   | verify 契約は独立した関心事。19 check ID × 4 Layer は成長可能性が高い。実装も `SkillCreatorVerificationEngine.ts` として独立している |
| 2         | C: 既存追記 | `references/arch-execution-capability-contract.md` | 実行能力契約の近くに配置可能だが、ファイルの責務が広がりすぎる                                                                       |
| 3         | A: 既存追記 | `references/interfaces-agent-sdk-skill.md`         | スキル関連を集約できるが、ファイルサイズが増大する                                                                                   |

### 推奨判断

**方針 B: 新規ファイル `interfaces-skill-verify-contract.md` の作成を推奨**

理由:

1. verify 契約は FR-04 として独立した機能要件であり、専用ファイルが自然
2. Layer 拡張に伴い内容が増大するため、独立ファイルが将来のメンテナンス性に優れる
3. `SkillCreatorVerificationEngine.ts` が独立したファイルとして実装されていることと対称
4. grep での検索性が高い（ファイル名に verify-contract を含む）
