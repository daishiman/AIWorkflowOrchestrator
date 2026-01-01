# Server Action テンプレート

## 基本的な Server Action

```typescript
// app/actions/{{resource}}.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// バリデーションスキーマ
const Create{{Resource}}Schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

const Update{{Resource}}Schema = Create{{Resource}}Schema.partial()

// 型定義
type ActionState = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

// 作成アクション
export async function create{{Resource}}(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 認証チェック
  const session = await auth()
  if (!session) {
    return { success: false, message: 'Unauthorized' }
  }

  // バリデーション
  const validatedFields = Create{{Resource}}Schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db.{{resource}}.create({
      data: {
        ...validatedFields.data,
        authorId: session.user.id,
      },
    })

    revalidatePath('/{{resources}}')
    revalidateTag('{{resources}}')

    return { success: true, message: '{{Resource}} created successfully' }
  } catch (error) {
    console.error('Failed to create {{resource}}:', error)
    return { success: false, message: 'Failed to create {{resource}}' }
  }
}

// 更新アクション
export async function update{{Resource}}(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session) {
    return { success: false, message: 'Unauthorized' }
  }

  // 認可チェック
  const existing = await db.{{resource}}.findUnique({ where: { id } })
  if (!existing || existing.authorId !== session.user.id) {
    return { success: false, message: 'Forbidden' }
  }

  const validatedFields = Update{{Resource}}Schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db.{{resource}}.update({
      where: { id },
      data: validatedFields.data,
    })

    revalidatePath('/{{resources}}')
    revalidateTag(`{{resource}}-${id}`)

    return { success: true, message: '{{Resource}} updated successfully' }
  } catch (error) {
    console.error('Failed to update {{resource}}:', error)
    return { success: false, message: 'Failed to update {{resource}}' }
  }
}

// 削除アクション
export async function delete{{Resource}}(id: string): Promise<ActionState> {
  const session = await auth()
  if (!session) {
    return { success: false, message: 'Unauthorized' }
  }

  const existing = await db.{{resource}}.findUnique({ where: { id } })
  if (!existing || existing.authorId !== session.user.id) {
    return { success: false, message: 'Forbidden' }
  }

  try {
    await db.{{resource}}.delete({ where: { id } })

    revalidatePath('/{{resources}}')
    revalidateTag('{{resources}}')

    return { success: true, message: '{{Resource}} deleted successfully' }
  } catch (error) {
    console.error('Failed to delete {{resource}}:', error)
    return { success: false, message: 'Failed to delete {{resource}}' }
  }
}
```

## useFormState を使用するフォーム

```typescript
// components/{{resource}}-form.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { create{{Resource}} } from '@/app/actions/{{resource}}'

const initialState = { success: false, message: '', errors: {} }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  )
}

export function {{Resource}}Form() {
  const [state, formAction] = useFormState(create{{Resource}}, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
        {state.errors?.title && (
          <p className="mt-1 text-sm text-red-600">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="mt-1 block w-full rounded-md border p-2"
        />
        {state.errors?.content && (
          <p className="mt-1 text-sm text-red-600">{state.errors.content[0]}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <SubmitButton />
        {state.message && (
          <p className={state.success ? 'text-green-600' : 'text-red-600'}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
```

## 楽観的更新を使用するリスト

```typescript
// components/{{resource}}-list.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { delete{{Resource}} } from '@/app/actions/{{resource}}'

type {{Resource}} = {
  id: string
  title: string
  // ...
}

export function {{Resource}}List({ items }: { items: {{Resource}}[] }) {
  const [isPending, startTransition] = useTransition()

  const [optimisticItems, removeOptimisticItem] = useOptimistic(
    items,
    (state, deletedId: string) => state.filter((item) => item.id !== deletedId)
  )

  async function handleDelete(id: string) {
    startTransition(async () => {
      removeOptimisticItem(id)
      await delete{{Resource}}(id)
    })
  }

  return (
    <ul className="space-y-2">
      {optimisticItems.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between p-4 border rounded"
        >
          <span>{item.title}</span>
          <button
            onClick={() => handleDelete(item.id)}
            disabled={isPending}
            className="text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
```

## 変数説明

| 変数            | 説明                           | 例                           |
| --------------- | ------------------------------ | ---------------------------- |
| `{{resource}}`  | リソース名（単数、camelCase）  | `post`, `comment`, `task`    |
| `{{Resource}}`  | リソース名（単数、PascalCase） | `Post`, `Comment`, `Task`    |
| `{{resources}}` | リソース名（複数、camelCase）  | `posts`, `comments`, `tasks` |
