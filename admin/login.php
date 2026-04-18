<?php
session_start();

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get and sanitize submitted username and password
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // --- Hardkodovani korisnici za start (zameni sa DB kasnije) ---
    // Format: 'username' => ['password' => 'plain_or_hash', 'role' => 'admin|radnik']
    $users = [
        'delic'  => ['password' => 'delic',  'role' => 'admin'],
        'radnik' => ['password' => 'radnik', 'role' => 'radnik'],
        // dodatne naloge: 'ime' => ['password'=>'lozinka','role'=>'radnik'],
    ];

    // Verify username and password (plaintext check for now)
    if ($username !== '' && isset($users[$username]) && $users[$username]['password'] === $password) {
        // Prevent session fixation
        session_regenerate_id(true);

        // Save useful session data
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $users[$username]['role']; // 'admin' ili 'radnik'
        $_SESSION['is_admin'] = ($users[$username]['role'] === 'admin') ? 1 : 0;

        // Redirect to home.php
        header("Location: home.php");
        exit();
    } else {
        // Redirect back to login page with an error message
        header("Location: index.php?error=1");
        exit();
    }
}
?>
