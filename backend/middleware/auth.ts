// Handles authentication of requests, and sets req.user.
// TODO: Make it work/convert to services
export async function checkAuth (req: Request, res: Response, next: NextFunction) {

	if (!req.cookies || !req.cookies.token || isEmpty(req.cookies.token) || !isLength(req.cookies.token, {min: 100, max: 100})) {
		res.status(errors.unauthorized.error.status);
		return res.send(errors.unauthorized)
	} else {
		// An authorization token has been supplied. Verify it.
		const auth = await Database.getAuthByToken(req.cookies.token);
		if (!auth) {
			// Invalid auth token.
			res.status(403);
			res.send(errorGenerator(403, 'Forbidden: Invalid authorisation token.'))
		} else {
			// User exists. Set it and move on.
			// Check auth age
			const numLife = Number(authLife);
			const oldest = auth.created.getTime() + (numLife * 1000);
			if (oldest < Date.now()) {
				// It's expired.
				await Database.deleteAuth(auth);
				res.status(401).send(errorGenerator(401, "Token expired, please login again.", {action: "login"}));
			}
			// Check if it's member only
			if (auth.user && requiredPerms) {
				if (!hasPerms(auth.user, requiredPerms)) {
					res.status(errors.unauthorized.error.status);
					return res.send(errors.forbidden)
				}
			}
			req.user = auth.user;
			next()
		}

	}
}