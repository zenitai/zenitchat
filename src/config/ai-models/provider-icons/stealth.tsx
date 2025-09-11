import { SVGProps } from "react";

export const Stealth = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-hat-glasses-icon lucide-hat-glasses"
    {...props}
  >
    <path d="M14 18a2 2 0 0 0-4 0" />
    <path d="m19 11-2.11-6.657a2 2 0 0 0-2.752-1.148l-1.276.61A2 2 0 0 1 12 4H8.5a2 2 0 0 0-1.925 1.456L5 11" />
    <path d="M2 11h20" />
    <circle cx="17" cy="18" r="3" />
    <circle cx="7" cy="18" r="3" />
  </svg>
);
