import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '../lib'

export function CodeBlock({ code, label = 'tsx' }: { code: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
  }
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{label}</span>
        <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy code">
          {status === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          <span role="status">
            {status === 'copied' ? 'Copied' : status === 'error' ? 'Select text to copy' : 'Copy'}
          </span>
        </Button>
      </div>
      <pre tabIndex={0} aria-label={`${label} code`}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
