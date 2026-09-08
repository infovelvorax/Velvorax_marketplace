import './ErrorMessage.css';
import { cn } from '../../../utils'
import { Button } from '../..'

/**
 * Reusable ErrorMessage component for displaying operational/API error states.
 */
export function ErrorMessage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryText = 'Try Again',
  variant = 'card',
  className,
}) {
  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center gap-2 text-sm text-red-600 font-medium',
          className
        )}
      >
        <svg
          className="w-4 h-4 shrink-0 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-auto text-xs underline font-semibold hover:text-red-800 cursor-pointer"
          >
            {retryText}
          </button>
        )}
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 text-red-900',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            {title && <span className="font-semibold mr-1">{title}:</span>}
            <span className="text-sm">{message}</span>
          </div>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            {retryText}
          </Button>
        )}
      </div>
    )
  }

  // Default 'card' variant
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-xl bg-red-50/70 border border-red-200',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-700 max-w-sm">{message}</p>

      {onRetry && (
        <div className="mt-4">
          <Button
            size="sm"
            variant="danger"
            onClick={onRetry}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ErrorMessage
