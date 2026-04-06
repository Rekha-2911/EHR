const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const { logActivity } = require('../utils/logger');
const { syncUserRoleCSV } = require('../utils/syncStorage');

exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users').select('id, name, email, role, department, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ message: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from('users').insert({
      name, email, password: hashedPassword, role, department: department || 'General'
    }).select('id, name, email, role, department').single();

    if (error) return res.status(500).json({ message: error.message });

    await logActivity(req.user.id, req.user.name, req.user.role, 'CREATE_USER',
      `Admin created user: ${email} (${role})`, req.ip);
    syncUserRoleCSV(role).catch(e => console.error('[Sync] createUser CSV failed:', e.message));
    res.status(201).json({ message: 'User created.', user: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('email, role').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: error.message });

    await logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_USER',
      `Admin deleted user: ${user.email}`, req.ip);
    syncUserRoleCSV(user.role).catch(e => console.error('[Sync] deleteUser CSV failed:', e.message));
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role, department } = req.body;
    const { data, error } = await supabase
      .from('users').update({ role, department })
      .eq('id', req.params.id)
      .select('id, name, email, role, department').single();

    if (error || !data) return res.status(404).json({ message: 'User not found.' });

    await logActivity(req.user.id, req.user.name, req.user.role, 'UPDATE_ROLE',
      `Role updated for ${data.email} to ${role}`, req.ip);
    syncUserRoleCSV(role).catch(e => console.error('[Sync] updateRole CSV failed:', e.message));
    res.json({ message: 'User updated.', user: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
