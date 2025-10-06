import {
	Replace,
	SquareDashedBottomCode,
	Search,
	LogIn,
	UserPlus,
	Github,
	LogOut,
	SquareRoundCorner,
	Image,
	LayoutGrid,
} from "lucide-react";

export const iconMap: Record<
	string,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	Replace,
	SquareDashedBottomCode,
	LogIn,
	UserPlus,
	Github,
	LogOut,
	SquareRoundCorner,
	Image,
	LayoutGrid,
	Search,
};

export function getIcon(iconName?: string) {
	return (iconName && iconMap[iconName]) || Search;
}
