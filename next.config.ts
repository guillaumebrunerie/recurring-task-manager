import type { NextConfig } from "next";
import { createVanillaExtractPlugin } from "@vanilla-extract/next-plugin";
import createPwa from "next-pwa";

const withVanillaExtract = createVanillaExtractPlugin();
const withPwa = createPwa({
	dest: "public",
});

const nextConfig: NextConfig = {
	/* config options here */
};

export default withPwa(withVanillaExtract(nextConfig) as never);
