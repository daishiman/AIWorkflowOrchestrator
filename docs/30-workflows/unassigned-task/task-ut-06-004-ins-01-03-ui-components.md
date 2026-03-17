# INS-01〜03 UI コンポーネント実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1262
```

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-06-004                        |
| タスク名   | INS-01〜03 UI コンポーネント実装 |
| 分類       | 実装                             |
| 優先度     | 中                               |
| ステータス | 未実施                           |
| 依存タスク | TASK-SKILL-LIFECYCLE-08          |
| 発見元     | TASK-SKILL-LIFECYCLE-06 Phase 12 |

## 1. なぜこのタスクが必要か（Why）

説明責任 UI（INS-01/02/03）は仕様化済みだが実コンポーネントがない。利用者の可視性と監査性を確保するため実装が必要。

## 2. 何を達成するか（What）

INS-01（実行前警告）、INS-02（実行中待機）、INS-03（実行後履歴）を既存画面に挿入し、遷移追加なしで動作させる。

## 3. どのように実行するか（How）

Task-03/05 既存コンポーネントへ slot 追加し、`riskLevel` と `pendingCount` と `sessionPermissionHistory` を入力に描画する。

## 4. 実行手順

1. INS-01 コンポーネントを Task-05 CTA 画面に追加する。
2. INS-02 コンポーネントを Task-03 実行中画面に追加する。
3. INS-03 コンポーネントを Task-05 実行結果画面に追加する。
4. light/dark 両テーマで視認性を確認する。

## 5. 完了条件チェックリスト

- [ ] INS-01/02/03 が仕様位置に表示される
- [ ] 新規画面遷移を追加しない
- [ ] `riskLevel` 判定が小文字（high/critical）で統一される
- [ ] スクリーンショット証跡が取得できる
- [ ] テストが PASS する

## 6. 検証方法

```bash
pnpm --filter @repo/desktop test src/renderer/components/**/ins-*.test.tsx
pnpm --filter @repo/desktop test src/renderer/views/**/*task-0[35]*.test.tsx
```

## 7. リスクと対策

| リスク         | 対策                                                 |
| -------------- | ---------------------------------------------------- |
| レイアウト崩れ | 既存画面内挿入のみで余白/順序を固定                  |
| 文言不整合     | Phase 5 `accountability-ui-spec.md` を正本として統一 |

## 8. 参照情報

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/accountability-ui-spec.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/accountability-ui-design.md`

## 9. 備考

実装順は INS-02 -> INS-01 -> INS-03 とすると依存が少ない。
