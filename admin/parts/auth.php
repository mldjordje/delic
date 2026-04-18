<?php
session_start();

// Proveri da li je korisnik ulogovan
if (!isset($_SESSION['role']) || !isset($_SESSION['username'])) {
    header("Location: ../index.php");
    exit();
}

// Možeš koristiti ove promenljive u ostalim fajlovima
$loggedUser = $_SESSION['username'];
$userRole = $_SESSION['role']; // 'admin' ili 'radnik'

// Ako želiš da ograničiš neku stranicu samo za admina, možeš dodati:
// if ($userRole !== 'admin') {
//     header("Location: home.php");
//     exit();
// }
?>
