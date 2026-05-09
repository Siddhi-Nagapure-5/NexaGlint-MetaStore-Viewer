import { type CloudProvider, PROVIDER_COLORS } from "@/lib/connections-store";

const PROVIDER_SVG: Record<CloudProvider, React.ReactNode> = {
  "AWS S3": (
    <svg viewBox="0 0 40 40" className="size-full" fill="none">
      <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z" fill="#FF9900" opacity="0.15"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FF9900">S3</text>
    </svg>
  ),
  "Azure Blob": (
    <svg viewBox="0 0 40 40" className="size-full" fill="none">
      <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z" fill="#0078D4" opacity="0.15"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0078D4">AZ</text>
    </svg>
  ),
  "MinIO": (
    <svg viewBox="0 0 40 40" className="size-full" fill="none">
      <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z" fill="#C72C48" opacity="0.15"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="7" fontWeight="700" fill="#C72C48">MIO</text>
    </svg>
  ),
  "GCS": (
    <svg viewBox="0 0 40 40" className="size-full" fill="none">
      <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8z" fill="#4285F4" opacity="0.15"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fontWeight="700" fill="#4285F4">GCS</text>
    </svg>
  ),
};

export function CloudBadge({ provider, size = "sm" }: { provider: CloudProvider; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };
  const iconSize = { sm: "size-3", md: "size-4", lg: "size-5" };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${PROVIDER_COLORS[provider]} ${sizeClasses[size]}`}
    >
      <span className={iconSize[size]}>{PROVIDER_SVG[provider]}</span>
      {provider}
    </span>
  );
}
