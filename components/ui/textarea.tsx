// components/ui/textarea.tsx
import React, { TextareaHTMLAttributes } from "react"

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea: React.FC<TextareaProps> = props => (
  <textarea
    {...props}
    className={props.className ?? "mt-1 block w-full border rounded p-2"}
  />
)