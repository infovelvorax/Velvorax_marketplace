import './Pagination.css';
import { useMemo } from 'react'
import { cn } from '../../../utils'

/**
 * Reusable accessible Pagination bar component
 */
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  showEdges = true,
  className,
}) {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5 // siblings + first + last + current + 2 dots

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2

    const firstPageIndex = 1
    const lastPageIndex = totalPages

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, idx) => idx + 1)
      return [...leftRange, '...', totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, idx) => totalPages - rightItemCount + idx + 1
      )
      return [firstPageIndex, '...', ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, idx) => leftSiblingIndex + idx
      )
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex]
    }

    return []
  }, [totalPages, siblingCount, currentPage])

  if (totalPages <= 1) return null

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1)
    }
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center justify-center gap-1 select-none', className)}
    >
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={handlePrevious}
        aria-label="Go to previous page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FFD700]/15 bg-black text-[#BDBDBD] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Buttons */}
      <div className="flex items-center gap-1">
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === '...') {
            return (
              <span
                key={`dots-${idx}`}
                className="inline-flex h-9 w-9 items-center justify-center text-sm font-medium text-gray-400"
              >
                &#8230;
              </span>
            )
          }

          const isCurrent = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange?.(Number(pageNumber))}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isCurrent
                  ? 'bg-primary-600 text-white shadow-xs font-semibold'
                  : 'bg-black border border-[#FFD700]/15 text-[#BDBDBD] hover:bg-black'
              )}
            >
              {pageNumber}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={handleNext}
        aria-label="Go to next page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FFD700]/15 bg-black text-[#BDBDBD] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}

export default Pagination
