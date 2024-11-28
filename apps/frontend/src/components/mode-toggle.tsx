import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const ThemeMenu = () => {
    const set = {
      light: () => setTheme("light"),
      dark: () => setTheme("dark"),
    };

    const modes = {
      light: "Claro",
      dark: "Oscuro",
    };

    return (
      <DropdownMenuContent>
        {Object.entries(set).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={value}
          >
            {modes[key as keyof typeof modes]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    );
  };

  const ModeIcon = () => {
    const Icon = theme === "dark" ? Moon : Sun;

    return (
      <Icon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100' />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className='relative flex items-center justify-center w-8 h-8 bg-white rounded-full dark:bg-gray-800'
        aria-label='Toggle theme'
      >
        <ModeIcon />
      </DropdownMenuTrigger>
      <ThemeMenu />
    </DropdownMenu>
  );
}
