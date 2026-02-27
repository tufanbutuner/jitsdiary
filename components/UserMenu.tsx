"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface UserMenuProps {
  isLoggedIn: boolean;
  userEmail: string | null;
}

function getInitials(email: string | null): string {
  if (!email) return "?";
  return email[0].toUpperCase();
}

export default function UserMenu({ isLoggedIn, userEmail }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
  }

  if (!isLoggedIn) {
    return (
      <>
        <Button variant="outline" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {userEmail && (
          <>
            <div className="px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {userEmail}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
