const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const { logActivity } = require('../utils/logger');
const { syncUserRoleCSV } = require('../utils/syncStorage');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase.from('users').insert({
      name, email, password: hashedPassword, role, department: department || 'General'
    }).select('id, name, email, role, department').single();

    if (error) return res.status(500).json({ message: error.message });

    const token = generateToken(user.id);
    await logActivity(user.id, user.name, user.role, 'REGISTER', `New user registered: ${email}`, req.ip);
    syncUserRoleCSV(user.role).catch(e => console.error('[Sync] register CSV failed:', e.message));
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users').select('*').eq('email', email).single();

    if (error || !user) return res.status(401).json({ message: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken(user.id);
    await logActivity(user.id, user.name, user.role, 'LOGIN', `User logged in: ${email}`, req.ip);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
