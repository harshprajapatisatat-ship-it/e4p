import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Satat Technologies — home"
      className={`inline-flex items-center select-none ${className}`}
    >
      <Image
        src="/satat-logo.svg"
        alt="Satat Technologies"
        width={168}
        height={106}
        priority
        className="h-11 w-auto object-contain"
      />
    </Link>
  );
}
