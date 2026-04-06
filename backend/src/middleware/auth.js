const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, department')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ message: 'User not found.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Role '${req.user.role}' is not authorized.` });
  }
  next();
};

module.exports = { protect, authorize };
