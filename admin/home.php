<?php 
require_once("parts/auth.php");
require_once("parts/layout.php") ;
?>

<?php 
LoadHead("Početna"); 
LoadNavBar();
?>

<div id="layoutSidenav_content">
    <main>
        <div class="container-fluid px-4">
            <h1 class="mt-4 mb-4">Dobrodošli na Auto Delić admin panel</h1>
        </div>
    </main>
</div>

<?php LoadFooter(); ?>