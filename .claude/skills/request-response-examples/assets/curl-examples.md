# cURL例テンプレート

## 例示対象
- {{endpoint}}

## cURL

```bash
curl -X {{METHOD}} "{{BASE_URL}}{{PATH}}" \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{{JSON_BODY}}'
```

## レスポンス例

```json
{{RESPONSE_BODY}}
```
