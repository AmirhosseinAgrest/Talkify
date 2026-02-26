// src/components/common/VerifiedBadge.tsx
interface VerifiedBadgeProps {
  size?: string;
  className?: string;
}

export function VerifiedBadge({ size = "1em", className }: VerifiedBadgeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={`inline-block align-text-bottom text-blue-500 ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Verified"
    >
      <title>Verified</title>
      <path d="M12 2L15 5H19V9L22 12L19 15V19H15L12 22L9 19H5V15L2 12L5 9V5H9L12 2ZM10.5 16.5L17 10L15.6 8.6L10.5 13.7L8.4 11.6L7 13L10.5 16.5Z" />
    </svg>
  );
}