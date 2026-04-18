<?php function LoadHead($pageTitle = 'Auto Delić') { ?>

<!DOCTYPE html>
<html lang="en">
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="keywords" content="tehnički pregled, tehnički pregled vozila, tehnički pregled motocikala, izdavanje registracionih nalepnica, zeleni kartoni, probne tablice, prenos vozila, registracija vozila, tehnički pregled mopeda, tehnički pregled Niš">


  <title><?php print($pageTitle) ?></title>

  <!-- fonts -->
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700%7COswald:300,400,500,600,700" rel="stylesheet" type="text/css">
   <link rel="icon" href="assets/images/logonovi.png" type="image/png">
  <!-- styles -->	
  <link href="assets/css/plugins.css" rel="stylesheet" type="text/css">
  <link href="assets/css/style.css" rel="stylesheet" type="text/css">
</head>

<?php } ?>

<?php function LoadScripts() { ?>
  <script src="assets/js/plugins.js"></script> 
  <script src="assets/js/main.js"></script>
  <script src="assets/js/particles_init.js"></script>
<?php } ?>

<?php function LoadNav() { ?>

<!-- loading start -->
<div class="loading">
    <img class="logo-loading" src="assets/images/logonovi.png" alt="logo">
</div><!-- loading end -->
  
<!-- pointer start -->
<div class="pointer" id="pointer">
  <i class="fas fa-long-arrow-alt-right"></i>
  <i class="fas fa-search"></i>
  <i class="fas fa-link"></i>
</div><!-- pointer end -->

<!-- to-top-btn start -->
<a class="to-top-btn pointer-small" href="#up">
    <span class="to-top-arrow"></span>		    
</a><!-- to-top-btn end -->
  
  <!-- header start -->
  <header class="fixed-header">
    <!-- header-flex-box start -->
  <div class="header-flex-box">
      <!-- logo start -->
    <a href="index.php" class="logo pointer-large animsition-link">
      <div class="logo-img-box">
            <img class="logo-white" src="assets/images/logonovi.png" alt="logo">
            <img class="logo-black" src="assets/images/logonovi.png" alt="logo">
          </div>
        </a><!-- logo end -->
        
    <!-- menu-open start -->	
    <div class="menu-open pointer-large">
      <span class="hamburger"></span>
    </div><!-- menu-open end -->
    </div><!-- header-flex-box end -->
</header><!-- header end -->

<!-- nav-container start -->	
<nav class="nav-container dark-bg-1">
  <!-- nav-logo start -->
  <div class="nav-logo">
    <img src="assets/images/logonovi.png" alt="logo">
  </div><!-- nav-logo end -->
  
  <!-- menu-close -->
  <div class="menu-close pointer-large"></div>

  <!-- dropdown-close-box start -->
  <div class="dropdown-close-box">
    <div class="dropdown-close pointer-large">
      <span></span>
    </div>
  </div><!-- dropdown-close-box end -->

  <!-- nav-menu start -->
  <ul class="nav-menu dark-bg-1">
    <!-- nav-box start -->
    <li class="nav-box nav-bg-change active dropdown-open">
      <a class="pointer-large nav-link">
        <span class="nav-btn active" data-text="Početna">Početna</span>
      </a>
    
      
      <div class="nav-bg" style="background-image: url(assets/images/tehnicki2.jpg);"></div>
    </li><!-- nav-box end -->
    <!-- nav-box start -->
    <li class="nav-box nav-bg-change">
      <a href="about.html" class="animsition-link pointer-large nav-link">
        <span class="nav-btn" data-text="O nama">O nama</span>
      </a>
      <div class="nav-bg" style="background-image: url(assets/images/tehnicki3.jpg);"></div>
    </li><!-- nav-box end -->
    <!-- nav-box start -->
    <li class="nav-box nav-bg-change">
      <a href="services.html" class="animsition-link pointer-large nav-link">
        <span class="nav-btn" data-text="Usluge">Usluge</span>
      </a>
      <div class="nav-bg" style="background-image: url(assets/images/tehnickiunutra4.jpg);"></div>
    </li><!-- nav-box end -->

    <li class="nav-box nav-bg-change">
      <a href="online-zakazivanje" class="animsition-link pointer-large nav-link">
        <span class="nav-btn" data-text="Online zakazivanje">Online zakazivanje</span>
      </a>
      <div class="nav-bg" style="background-image: url(assets/images/tehnickiunutra4.jpg);"></div>
    </li><!-- nav-box end -->
    <!-- nav-box start -->
  
    <!-- nav-box start -->
    <li class="nav-box nav-bg-change ">
      <a href="polovni-automobili.php" class="pointer-large nav-link">
        <span class="nav-btn" data-text="Polovni Automobili">Polovni Automobili</span>
      </a>
      
     
      
      <div class="nav-bg" style="background-image: url(assets/images/tehnickiunutra3.jpg);"></div>
    </li><!-- nav-box end -->
    <!-- nav-box start -->
    <li class="nav-box nav-bg-change">
      <a href="contact.html" class="animsition-link pointer-large nav-link">
        <span class="nav-btn" data-text="Contact">Kontakt</span>
      </a>
      <div class="nav-bg" style="background-image: url(assets/images/znak2.jpg);"></div>
    </li><!-- nav-box end -->
  </ul><!-- nav-menu end -->
</nav><!-- nav-container end -->

<?php } ?>