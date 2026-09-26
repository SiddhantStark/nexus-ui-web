import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

/** Catches render failures, including rejected lazy imports. Async actions own their errors. */
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
