<?php
// Layout and Database Connection
require_once("partials/layout.php");
require_once("admin/parts/mysql.php");

LoadHead('Auto Delić | Vozila');

// Check if 'id' is provided in URL
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    exit("Invalid or missing vehicle ID.");
}

$id = (int)$_GET['id'];

// Fetch vozilo details from database
$stmt = $conn->prepare("SELECT naziv, kratki_opis, opis FROM vozila WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    exit("Vehicle not found.");
}

$vozilo = $result->fetch_assoc();

// Fetch all images for the vozilo
$imageDir = "admin/vozila/" . $id . "/";
$images = is_dir($imageDir) ? glob($imageDir . "*.{jpg,jpeg,png,gif}", GLOB_BRACE) : [];

$stmt->close();
?>

<body class="loader">
    <?php LoadNav(); ?>
    
    <!-- animsition-overlay start -->
    <main class="animsition-overlay" data-animsition-overlay="true">
        <!-- single-post start -->
        <div id="down" class="single-post container bottom-padding-30 top-padding-120 light-bg-1" data-midnight="black">
            <div class="flex-container">
                <!-- column start -->
                <div class="twelve-columns">
                    <div class="light-bg-2">
                        <div class="content-margin-block">
                            <article class="entry-content">
                                <h2 class="title-style text-color-1 top-margin-30"><?php echo htmlspecialchars($vozilo['naziv']); ?></h2>

                                <!-- post-img-flex start -->
                                <div class="post-img-flex">
                                    <?php
                                    if (!empty($images)) {
                                        foreach ($images as $image) {
                                            echo '<a class="post-img-box photo-popup" href="' . htmlspecialchars($image) . '">
                                                    <div class="pointer-zoom">
                                                        <img style="height: 340px; object-fit: cover;" src="' . htmlspecialchars($image) . '" alt="Vehicle Image">
                                                    </div>
                                                </a>';
                                        }
                                    } else {
                                        echo '<p class="text-color-1">No images available for this vehicle.</p>';
                                    }
                                    ?>
                                </div><!-- post-img-flex end -->
                                
                                <!-- Display kratki_opis and opis -->
                                <p class="p-style-medium text-color-1"><?php echo nl2br(htmlspecialchars($vozilo['kratki_opis'])); ?></p>
                                <p class="p-style-medium text-color-1"><?php echo nl2br(htmlspecialchars($vozilo['opis'])); ?></p>
                                
                                
                            </article>
                        </div>
                    </div>
                </div><!-- column end -->
            </div><!-- flex-container end -->
        </div><!-- single-post end -->
    </main><!-- animsition-overlay end -->
    
    <!-- footer start -->
    <footer class="footer dark-bg-1">
        <div class="flex-container container top-bottom-padding-90">
            <!-- Logo Column -->
            <div class="two-columns bottom-padding-60">
                <div class="content-right-margin-10 footer-center-mobile">
                    <img class="footer-logo" src="assets/images/logonovi.png" alt="Auto Delić Plus Logo">
                </div>
            </div>
            
            <!-- Menu Column -->
            <div class="three-columns bottom-padding-60">
                <div class="content-left-right-margin-10">
                    <ul class="footer-menu text-color-4">
                        <li><a class="pointer-large animsition-link small-title-oswald hover-color active" href="index.html">Početna</a></li>
                        <li><a class="pointer-large animsition-link small-title-oswald hover-color" href="about.html">O nama</a></li>
                        <li><a class="pointer-large animsition-link small-title-oswald hover-color" href="services.html">Usluge</a></li>
                        <li><a class="pointer-large animsition-link small-title-oswald hover-color" href="contact.html">Kontakt</a></li>
                    </ul>
                </div>
            </div>
            
            <!-- Contact Info Column -->
            <div class="four-columns bottom-padding-60">
                <div class="content-left-right-margin-10 footer-center-mobile">
                    <ul class="footer-information text-color-4">
                        <li><i class="far fa-envelope"></i><a href="mailto:adtehnickipregled@gmail.com" class="xsmall-title-oswald">adtehnickipregled@gmail.com</a></li>
                        <li><i class="fas fa-mobile-alt"></i><a href="tel:+381652200739" class="xsmall-title-oswald">+381 65 220 0739</a></li>
                        <li><i class="fas fa-map-marker-alt"></i><a href="#" class="xsmall-title-oswald text-height-17">Branka Ćosića 3<br><span>Niš, Srbija</span></a></li>
                    </ul>
                </div>
            </div>
            
            <!-- Social Media Column -->
            <div class="three-columns bottom-padding-60">
                <div class="content-left-margin-10">
                    <ul class="footer-social">
                        <li>
                            <div class="flip-btn-box">
                                <a href="#" class="flip-btn pointer-small" data-text="Instagram">Instagram</a>
                            </div>
                        </li>
                        <li>
                            <div class="flip-btn-box">
                                <a href="#" class="flip-btn pointer-small" data-text="Facebook">Facebook</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Copyright Column -->
            <div class="twelve-columns">
                <p class="p-letter-style text-color-4 footer-copyright">
                    &copy; 2024 Auto Delić Plus. Sva prava zadržana.
                </p>
            </div>
        </div>
    </footer><!-- footer end -->
    
    <!-- scripts --> 
    <script src="assets/js/plugins.js"></script> 
    <script src="assets/js/main.js"></script>
</body>
</html>
