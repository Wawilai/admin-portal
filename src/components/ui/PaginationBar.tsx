interface PaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationBarProps) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, currentPage * safePageSize);

  return (
    <div className="pagination-bar">
      <div className="pagination-meta">
        <div className="pagination-copy">
          Showing {start}-{end} of {total}
        </div>
        {onPageSizeChange ? (
          <label className="pagination-page-size">
            <span className="pagination-copy">Rows</span>
            <select
              className="text-input pagination-select"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="pagination-actions">
        <button
          className="ghost-button compact-button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>
        <div className="pagination-copy">
          Page {currentPage} of {totalPages}
        </div>
        <button
          className="ghost-button compact-button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
