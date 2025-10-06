import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	transpilePackages: ["@imagetools/tools"],
};

export default nextConfig;
