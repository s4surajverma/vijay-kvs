/**
 * PM SHRI KV Suranussi — Authentication Manager
 * ────────────────────────────────────────────────
 * Current backend : localStorage via DB layer
 * Future  backend : Supabase Auth
 *
 * Migration note:
 *   login()  → supabase.auth.signInWithPassword({ email, password })
 *   logout() → supabase.auth.signOut()
 *   isLoggedIn() → check (await supabase.auth.getSession()).data.session
 */

const Auth = (() => {

  /**
   * Attempt login with username + password.
   * Returns { success: true, user } or { success: false, error: string }
   *
   * Supabase equivalent:
   *   const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
   *   if (error) return { success: false, error: error.message };
   *   return { success: true, user: data.user };
   */
  function login(username, password) {
    const creds = DB.getCredentials();
    if (
      username.trim().toLowerCase() === creds.username.toLowerCase() &&
      password === creds.password
    ) {
      const user = { username: creds.username, displayName: creds.displayName };
      DB.createSession(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid username or password. Please try again.' };
  }

  /**
   * Destroy the current session and clear admin UI.
   * Supabase equivalent: await supabase.auth.signOut()
   */
  function logout() {
    DB.destroySession();
  }

  /**
   * Returns true when a valid (non-expired) session exists.
   * Supabase equivalent: !!(await supabase.auth.getSession()).data.session
   */
  function isLoggedIn() {
    return DB.getSession() !== null;
  }

  /**
   * Return the logged-in user object, or null.
   * Supabase equivalent: (await supabase.auth.getUser()).data.user
   */
  function getUser() {
    const session = DB.getSession();
    return session ? session.user : null;
  }

  /**
   * Change the admin password.
   * Supabase equivalent: await supabase.auth.updateUser({ password: newPassword })
   */
  function changePassword(currentPassword, newPassword) {
    const creds = DB.getCredentials();
    if (currentPassword !== creds.password) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    DB.updateCredentials({ password: newPassword });
    return { success: true };
  }

  return { login, logout, isLoggedIn, getUser, changePassword };

})();
