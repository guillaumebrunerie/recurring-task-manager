export const POST = async (req: Request) => {
	const body = await req.json();

	console.log("SW LOG:", body);

	return Response.json({ ok: true });
};
