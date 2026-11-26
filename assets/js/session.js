/* =====================================================================
   session.js - a pretend "login session" with NO backend.

   The idea: when someone "logs in", we save their details in the browser's
   localStorage. Every page reads from that same spot to know who the user
   is. "Logout" simply deletes it. Nothing is ever sent to a server.

   Only the 5 fake users in USERS below can log in. Their passwords sit
   right here in plain text, which anyone can read in the browser, so this
   only PRETENDS to need credentials. It is not real security.

   Everything is stored as one JSON object under the key "ts.session":
     { username, account, role, plan, loggedInAt }
   (The password is never saved.)

   Handy things to try in the browser console:
     Session.get()      -> shows the saved user
     Session.clear()    -> logs out
     Session.users      -> the list of allowed logins
   ===================================================================== */

window.Session = (function () {
  var KEY = 'ts.session';

  // ----- The ONLY logins that work -----
  // username = Pendo visitor ID. account, role and plan are fixed for each
  // user and sent to Pendo as account ID and metadata. All fake.
  var USERS = [
    { username: 'ana@example.com',  password: 'password1', account: 'acme-corp', role: 'admin',   plan: 'enterprise' },
    { username: 'ben@example.com',  password: 'password2', account: 'acme-corp', role: 'learner', plan: 'enterprise' },
    { username: 'cara@example.com', password: 'password3', account: 'globex',    role: 'manager', plan: 'pro' },
    { username: 'dev@example.com',  password: 'password4', account: 'globex',    role: 'learner', plan: 'pro' },
    { username: 'eli@example.com',  password: 'password5', account: 'initech',   role: 'learner', plan: 'free' }
  ];

  // Look up a username in USERS (not case-sensitive). Returns the user or null.
  function findUser(username) {
    var name = String(username || '').trim().toLowerCase();
    for (var i = 0; i < USERS.length; i++) {
      if (USERS[i].username === name) return USERS[i];
    }
    return null;
  }

  // Check a username and password. If they match a user in USERS, save
  // that user as the session and return true. Otherwise return false.
  function login(username, password) {
    var user = findUser(username);
    if (!user || user.password !== password) return false;
    save({ username: user.username, account: user.account, role: user.role, plan: user.plan });
    return true;
  }

  // Read the saved user. Returns an object, or null if nobody is logged in.
  // A saved user who isn't in USERS (for example, left over from when the
  // site accepted any name) is thrown away, so they're logged out.
  function get() {
    var user;
    try {
      user = JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;   // the saved text was broken; treat as logged out
    }
    if (user && !findUser(user.username)) {
      clear();
      return null;
    }
    return user;
  }

  // Save a user (turns the object into text for storage).
  function save(user) {
    user.loggedInAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(user));
  }

  // Delete the saved user = logout.
  function clear() {
    localStorage.removeItem(KEY);
  }

  // true / false: is somebody logged in?
  function isLoggedIn() {
    var user = get();
    return !!(user && user.username);
  }

  return { get: get, login: login, clear: clear, isLoggedIn: isLoggedIn, users: USERS };
})();
