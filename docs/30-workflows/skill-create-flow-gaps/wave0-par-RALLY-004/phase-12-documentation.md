# Phase 12: ドキュメント

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 12             |
| 機能名     | TASK-RALLY-004 |
| 前提Phase  | Phase 11       |
| 後続Phase  | Phase 13       |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                      | 実行形態 |
| ---------- | ----------------------------------------- | -------- |
| SubAgent-A | 変更サマリー作成・index.md ステータス更新 | **直列** |

## 変更サマリー

`packages/shared/src/types/skillCreator.ts` の `SkillCreatorUserInputSubmission` と `InterviewUserAnswer` の重複フィールドに正規化マークを追加した。

- `selectedOptionIds`: `@canonical` マーク追加（複数選択の正規フィールド）
- `selectedValues`: `@deprecated Use selectedOptionIds instead.` マーク追加（レガシー互換フィールド）

これにより、ラリー機能ギャップの設計書（rally-phase-1-analysis.md）の懸念点9「selectedOptionIds/selectedValues重複フィールド」で問題となっていた型定義レベルの曖昧さが解消された。

IDE（VSCode 等）で `selectedValues` フィールドを参照するコードにはデプリケーション警告が表示されるようになり、新規実装での誤使用を防ぐ。

## 中学生レベルの概念説明

プログラムでは「同じ情報を表す名前が2つある」と、どちらを使えばいいか分からなくなります。

例えば、`selectedOptionIds` と `selectedValues` はどちらも「選んだ選択肢のリスト」を表しています。でも2つあると「どっちが正しいの？」と混乱します。

今回の修正では、「`selectedOptionIds` が正しい名前（`@canonical`）です」と型定義にコメントを書き加えました。また「`selectedValues` は古い名前なので使わないでください（`@deprecated`）」とも書き加えました。

こうすることで、VSCode などの開発ツールが「古い名前を使っていますよ」と自動的に警告を出してくれるようになります。コードを削除しなくても、コメントを追加するだけで誤使用を防げるのが JSDoc の便利な点です。

## 関連ドキュメント更新

- `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md` の懸念点9が本タスクで解消されたことを記録する
- `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` の RALLY-004 欄に完了記録を追加する

## 完了条件

- [ ] 変更サマリーが作成されている
- [ ] 中学生レベルの概念説明が含まれている
- [ ] 関連ドキュメントへの反映が完了している

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 13: PR作成
