<?php 
// Layout
require_once("partials/layout.php") ;
require_once("admin/parts/mysql.php");

LoadHead('Auto Delić | Početna');
?>

	<body class="loader">
		
  <?php LoadNav(); ?>
	    
		<!-- animsition-overlay start -->
		<main class="animsition-overlay" data-animsition-overlay="true">
			<!-- page-head start -->
			<section id="up" class="page-head flex-min-height-box dark-bg-2">
				<!-- page-head-bg -->
				<div class="page-head-bg overlay-loading2" style="background-image: url(assets/images/klijenti1.jpg);"></div>
				
				<!-- flex-min-height-inner start -->
	  			<div class="flex-min-height-inner">
		  			<!-- flex-container start -->
		  			<div class="container top-bottom-padding-120 flex-container response-999">
			  			<!-- column start -->
			  			<div class="six-columns six-offset">
				  			<div class="content-left-margin-40">
				  				<h2 class="large-title-bold">
									<span class="load-title-fill tr-delay03" data-text="Polovni">Polovni</span><br>
									<span class="load-title-fill tr-delay04" data-text="Aotomobili">Aotomobili</span><br>
								</h2>
								<p class="p-style-bold-up text-height-20 d-flex-wrap">
									<span class="load-title-fill tr-delay08" data-text="Online Auto Plac">Online Auto Plac</span>
								</p>
				  			</div>
			  			</div><!-- column end -->
		  			</div><!-- flex-container end -->
	  			</div><!-- flex-min-height-inner end -->
	  			
	  			<!-- scroll-btn start -->
				<a href="#down" class="scroll-btn pointer-large">
					<div class="scroll-arrow-box">
						<span class="scroll-arrow"></span>
					</div>
					<div class="scroll-btn-flip-box">
						<span class="scroll-btn-flip" data-text="Scroll">Scroll</span>
					</div>
				 </a><!-- scroll-btn end -->
			</section><!-- page-head end -->

			<!-- section start -->
			<section class="light-bg-1" data-midnight="black">
				<!-- container start -->
				<div class="container bottom-padding-60 top-padding-120">
					<!-- text-center start -->
					<div data-animation-container class="text-center">
						<h2 data-animation-child class="large-title text-height-10 text-color-1 overlay-anim-box2" data-animation="overlay-anim2">Naša ponuda</h2><br>
						<p data-animation-child class="fade-anim-box tr-delay02 text-color-1 xsmall-title-oswald top-margin-5" data-animation="fade-anim">Lista svih dostupnih vozila za prodaju</p>
					</div><!-- text-center end -->
					


          <div class="flex-container response-999 top-padding-60" id="vozila">
    <?php

    // Query to get vehicle data including cena
    $sql = "SELECT id, naziv, kratki_opis, cena FROM vozila";
    $result = $conn->query($sql);

    // Check if there are results
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Prepare image URL
            $imageDir = "admin/vozila/" . $row['id'] . "/";
            $imagePath = "assets/images/default.jpg"; // Fallback image if no images are found

            if (is_dir($imageDir)) {
                // Get all image files in the directory
                $images = glob($imageDir . "*.{jpg,jpeg,png,gif}", GLOB_BRACE);

                if (!empty($images)) {
                    // Sort the images by modification time in ascending order (earliest first)
                    usort($images, function($a, $b) {
                        return filemtime($a) - filemtime($b);
                    });

                    // Set the first image (earliest by modification date)
                    $imagePath = $images[0];
                }
            }

            // Format cena
            $formattedCena = number_format($row['cena'], 2) . " €";
    ?>
        <!-- Dynamic vehicle display -->
        <div class="four-columns bottom-padding-60">
            <a data-animation-container href="vozilo?id=<?php print($row['id']) ?>" class="content-right-margin-20 hover-box pointer-large d-block light-bg-2">
                <div data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 expertise-img-box" data-animation="overlay-anim2">
                    <img class="hover-img" src="<?php echo htmlspecialchars($imagePath); ?>" alt="<?php echo htmlspecialchars($row['naziv']); ?>">
                    <div class="cena">
                        <?php echo $formattedCena; ?>
                    </div>
                </div>
                <div class="expertise content-padding-l-r-20 content-padding-bottom-20">
                    <h3 data-animation-child class="small-title-oswald text-color-1 hover-content fade-anim-box tr-delay01" data-animation="fade-anim">
                        <?php echo htmlspecialchars($row['naziv']); ?>
                    </h3><br>
                    <p data-animation-child class="p-style-xsmall text-color-1 hover-content fade-anim-box tr-delay02" data-animation="fade-anim">
                        <?php echo htmlspecialchars($row['kratki_opis']); ?>
                    </p>
                </div>
            </a>
        </div>
    <?php
        }
    }
    ?>
</div>

<!-- CSS for cena positioning -->
<style>
    .cena {
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 10px 12px;
        font-weight: bold;
        font-size: 1.2em;
        color: #333;
        background-color: #FFBF00;
    }
</style>




			</section><!-- section end -->

		</main><!-- animsition-overlay end -->
		
		<!-- footer start -->
		<footer class="footer dark-bg-1">
			<!-- flex-container start -->
			<div class="flex-container container top-bottom-padding-90">
				<!-- logo kolona start -->
				<div class="two-columns bottom-padding-60">
					<div class="content-right-margin-10 footer-center-mobile">
						<img class="footer-logo" src="assets/images/logonovi.png" alt="Auto Delić Plus Logo">
					</div>
				</div><!-- logo kolona end -->
		
				<!-- meni kolona start -->
				<div class="three-columns bottom-padding-60">
					<div class="content-left-right-margin-10">
						<ul class="footer-menu text-color-4">
							<li><a class="pointer-large animsition-link small-title-oswald hover-color active" href="index.html">Početna</a></li>
							<li><a class="pointer-large animsition-link small-title-oswald hover-color" href="about.html">O nama</a></li>
							<li><a class="pointer-large animsition-link small-title-oswald hover-color" href="services.html">Usluge</a></li>
							<li><a class="pointer-large animsition-link small-title-oswald hover-color" href="contact.html">Kontakt</a></li>
						</ul>
					</div>
				</div><!-- meni kolona end -->
		
				<!-- kontakt informacije start -->
				<div class="four-columns bottom-padding-60">
					<div class="content-left-right-margin-10 footer-center-mobile">
						<ul class="footer-information text-color-4">
							<li><i class="far fa-envelope"></i><a href="mailto:adtehnickipregled@gmail.com" class="xsmall-title-oswald">adtehnickipregled@gmail.com</a></li>
							<li><i class="fas fa-mobile-alt"></i><a href="tel:+381652200739" class="xsmall-title-oswald">+381 65 220 0739</a></li>
							<li><i class="fas fa-map-marker-alt"></i><a href="#" class="xsmall-title-oswald text-height-17">Branka Ćosića 3<br><span>Niš, Srbija</span></a></li>
						</ul>
					</div>
				</div><!-- kontakt informacije end -->
		
				<!-- društvene mreže start -->
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
				</div><!-- društvene mreže end -->
		
				<!-- autorska prava start -->
				<div class="twelve-columns">
					<p class="p-letter-style text-color-4 footer-copyright">
						&copy; 2024 Auto Delić Plus. Sva prava zadržana.
					</p>
				</div><!-- autorska prava end -->
			</div><!-- flex-container end -->
		</footer><!-- footer end -->
		
		<!-- scripts --> 
        <script src="assets/js/plugins.js"></script> 
        <script src="assets/js/main.js"></script>
	</body>
</html>

<style>
  #vozila img {
    height: 244px;
    object-fit: cover;
}
</style>