# Phase 5: 契約差分

## 変更前

- desktop と skill-creator で同じ正規表現が個別定義されていた。
- `init_skill.js` は runtime で package 解決に失敗する可能性があった。

## 変更後

- `skillName.ts` を単一信頼源として公開した。
- `SkillScanner.ts` と `init_skill.js` は shared 定数を参照する。
- `init_skill.js` は package import 失敗時に dist fallback を使う。

## 互換性

- バリデーションルール自体は変更していない。
- 既存の kebab-case 判定は維持される。
- 追加されたのは runtime 解決と境界値の保護だけ。
