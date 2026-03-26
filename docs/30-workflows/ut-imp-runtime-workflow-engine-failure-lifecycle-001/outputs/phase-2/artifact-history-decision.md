# Artifact History Decision

## 決定

phase artifact は `latest snapshot` ではなく `append history` を正本とする。

## 理由

1. 失敗の再現性と監査性を残せる。
2. Task04 が review / retry の説明根拠を UI に出せる。
3. Task08 が resume 前後の履歴差分を扱いやすい。

## consumer rule

- consumer は末尾要素を latest として読む。
- history 全体は engine owner とし、renderer が再構成しない。
- upsert helper が残る場合は phase latest accessor に限定する。
