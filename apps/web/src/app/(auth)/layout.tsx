export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-full w-full items-center justify-center p-4">
			{children}
		</div>
	);
}
