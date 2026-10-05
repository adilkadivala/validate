"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mailbox, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";



export default function ProfileSheet() {
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={"/images/profile/avtar.webp"} alt="profile" />
      <AvatarFallback className="bg-primary text-primary-foreground">
        "U"
      </AvatarFallback>
    </Avatar>
  );
}
