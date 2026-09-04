import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'default_local_development_secret_key';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access token missing' });
        return;
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string') {
            res.status(403).json({ error: 'Token is invalid or expired' });
            return;
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    });
};
