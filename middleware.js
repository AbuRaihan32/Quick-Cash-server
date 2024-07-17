// ! Custom Middleware
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const token = req.headers?.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "token nai" });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "wrong token" });
    }
    req.decoded = decoded;
    next();
  });
};

// ! verify Admin middleware must use after verify token

export const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);

  const isAdmin = user?.role === "Admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};
