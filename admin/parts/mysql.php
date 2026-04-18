<?php

$servername = "localhost";
$username = "autodeli_delic";
$password = "delicadmin2024";
$dbname = "autodeli_delic";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

?>