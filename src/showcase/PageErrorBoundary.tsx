import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../components/ui/button'

type Props = { children: ReactNode; resetKey: string }
type State = { failed: boolean; resetKey: string }

export class PageErrorBoundary extends Component<Props, State> {
  state = { failed: false, resetKey: this.props.resetKey }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  static getDerivedStateFromProps(props: Props, state: State) {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page rendering failed:', error, info.componentStack)
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="docs-page" role="alert">
        <h1 className="text-2xl font-semibold">This page could not be loaded.</h1>
        <p className="my-4 text-muted">
          Reload the page to try again, or choose another page from the navigation.
        </p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    )
  }
}
