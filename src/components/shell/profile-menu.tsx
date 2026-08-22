import Link from "next/link";
import { Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-2 rounded-md p-0.5 outline-none ring-ring/50 focus-visible:ring-2" />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
            EU
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-medium">Você</span>
          <span className="text-xs font-normal text-muted-foreground">Workspace pessoal</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/configuracoes" />}>
          <Settings className="size-4" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/configuracoes#perfil" />}>
          <User className="size-4" />
          Perfil
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
