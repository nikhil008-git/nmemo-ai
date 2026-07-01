"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const navItems = [
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className=" bg-white fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap gap-1.5 sm:gap-2">
            <BreadcrumbItem>
              {isHome ? (
                <BreadcrumbPage className="font-bold">nmemo</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/" className="font-bold">
                    nmemo
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {!isHome && (
              <>
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="inline-flex items-center">
                      <Home size={16} strokeWidth={2} aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}

            {navItems.map((item) => (
              <span key={item.href} className="contents">
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {pathname === item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
