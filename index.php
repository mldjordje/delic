<?php 
// Layout
require_once("partials/layout.php") ;

LoadHead('Auto Delić | Početna');
?>
	
	<body class="loader">
		
		<?php LoadNav(); ?>
	    
		<!-- animsition-overlay start -->
		<main class="animsition-overlay" data-animsition-overlay="true">
			<!-- page-head start -->
			<section id="up" class="page-head flex-min-height-box dark-bg-2 particles-home">
				<!-- page-head-bg -->
				<div class="page-head-bg" id="particles-js" style="background-image: url(assets/images/tehnicki.jpg);"></div>
				
				<!-- flex-min-height-inner start -->
				<div class="flex-min-height-inner">
					<!-- container start -->
					<div class="container top-bottom-padding-120">
						<h2 class="overlay-loading2 medium-title red-color">Dobrodošli u Auto Delić </h2>
						<h3 class="large-title-bold text-color-4">
							<span class="overlay-loading2 overlay-light-bg-1 tr-delay01">Pouzdane usluge</span><br>
							<span class="overlay-loading2 overlay-light-bg-1 tr-delay02">registracije</span><br>
							<span class="overlay-loading2 overlay-light-bg-1 tr-delay03">i tehničkog pregleda vozila</span>
						</h3>
						<p class="d-flex-wrap top-margin-20 text-color-4">
							<span class="small-title-oswald text-height-20 fade-loading tr-delay04 top-margin-10">Profesionalna podrška</span>
							<span class="small-title-oswald text-height-20 fade-loading tr-delay05 top-margin-10">Osiguranje vozila</span>
							<span class="small-title-oswald text-height-20 fade-loading tr-delay06 top-margin-10">Posredovanje u prodaji</span>
						</p>
						<a href="online-zakazivanje.php" class="no-underline">
  <h2 class="overlay-loading2 medium-title red-color">
    Zakaži registraciju
  </h2>
</a>

					</div><!-- container end -->
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
			
			<section class="home-slider" id="up">
				<div class="swiper-wrapper">
					<!-- Prvi slajd -->
					<div class="swiper-slide flex-min-height-box home-slide">
						<div class="slide-bg overlay-loading2 overlay-dark-bg-1" style="background-image:url(assets/images/tehnickiunutra5.jpg)"></div>
						<div class="home-slider-content flex-min-height-inner dark-bg-1">
							<div class="container top-bottom-padding-120 flex-container response-999">
								<div class="six-columns six-offset">
									<div class="content-left-margin-40">
										<h2 class="large-title-bold">
											<span class="slider-title-fill slider-tr-delay01" data-text="Brza i jednostavna">Brza i jednostavna</span><br>
											<span class="slider-title-fill slider-tr-delay02" data-text="registracija i">registracija i</span><br>
											<span class="slider-title-fill slider-tr-delay03" data-text="tehnički pregled">tehnički pregled</span>
										</h2>
										<p class="p-style-bold-up text-height-20 d-flex-wrap">
											<span class="slider-title-fill slider-tr-delay04" data-text="Registracija vozila">Registracija vozila</span>
											<span class="slider-title-fill slider-tr-delay05" data-text="Tehnički pregled">Tehnički pregled</span>
											<span class="slider-title-fill slider-tr-delay06" data-text="Osiguranje">Osiguranje</span>
										</p>
										<div class="slider-fade slider-tr-delay07 top-margin-30">
											<div class="border-btn-box border-btn-red pointer-large">
												<div class="border-btn-inner">
													<a href="#services" class="border-btn" data-text="Saznajte više">Saznajte više</a>
												</div>
											</div>
										</div>
									</div>
								</div><!-- column end -->
							</div><!-- flex-container end -->
						</div><!-- home-slider-content end -->
					</div><!-- swiper-slide end -->
					
					<!-- Drugi slajd -->
					<div class="swiper-slide flex-min-height-box home-slide">
						<div class="slide-bg" style="background-image:url(assets/images/tehnicki2.jpg)"></div>
						<div class="home-slider-content flex-min-height-inner dark-bg-2">
							<div class="container top-bottom-padding-120 flex-container response-999">
								<div class="six-columns six-offset">
									<div class="content-left-margin-40">
										<h2 class="slider-overlay2 medium-title red-color">Auto Delić</h2>
										<h3 class="large-title-bold text-color-4">
											<span class="slider-overlay2 slider-tr-delay01">Sve za vaše</span><br>
											<span class="slider-overlay2 slider-tr-delay02">vozilo na jednom</span><br>
											<span class="slider-overlay2 slider-tr-delay03">mestu</span>
										</h3>
										<div class="slider-fade slider-tr-delay04 top-margin-30">
											<div class="border-btn-box pointer-large">
												<div class="border-btn-inner">
													<a href="#services" class="border-btn" data-text="Saznajte više">Saznajte više</a>
												</div>
											</div>
										</div>
									</div>
								</div><!-- column end -->
							</div><!-- flex-container end -->
						</div><!-- home-slider-content end -->
					</div><!-- swiper-slide end -->
					
					<!-- Treći slajd -->
					<div class="swiper-slide flex-min-height-box home-slide red-slide">
						<div class="slide-bg" style="background-image:url(assets/images/tehnicki3.jpg)"></div>
						<div class="home-slider-content flex-min-height-inner red-bg">
							<div class="container top-bottom-padding-120 flex-container response-999">
								<div class="six-columns">
									<h2 class="large-title-bold">
										<span class="slider-title-fill slider-tr-delay01" data-text="Kompletna usluga">Kompletna usluga</span><br>
										<span class="slider-title-fill slider-tr-delay02" data-text="osiguranja i">osiguranja i</span><br>
										<span class="slider-title-fill slider-tr-delay03" data-text="prenos vlasništva">prenos vlasništva</span>
									</h2>
									<div class="small-title-oswald text-height-20 d-flex-wrap top-margin-20">
										<span class="slider-title-fill slider-tr-delay04 top-margin-10" data-text="Pouzdano">Pouzdano</span>
										<span class="slider-title-fill slider-tr-delay05 top-margin-10" data-text="Efikasno">Efikasno</span>
										<span class="slider-title-fill slider-tr-delay06 top-margin-10" data-text="Profesionalno">Profesionalno</span>
									</div>
									<div class="arrow-btn-box slider-fade slider-tr-delay06 top-margin-30">
										<a href="#services" class="arrow-btn pointer-large">Saznajte više</a>
									</div>
								</div><!-- column end -->
							</div><!-- flex-container end -->
						</div><!-- home-slider-content end -->
					</div><!-- swiper-slide end -->
				</div><!-- swiper-wrapper end -->
				
				<!-- swiper navigacija -->
				<div class="swiper-button-next">
					<div class="slider-arrow-next-box">
						<span class="slider-arrow-next"></span>
					</div>
				</div>
				<div class="swiper-button-prev">
					<div class="slider-arrow-prev-box">
						<span class="slider-arrow-prev"></span>
					</div>
				</div>
				<div class="swiper-pagination"></div>
				
				<!-- scroll dugme -->
				<a href="#down" class="scroll-btn pointer-large">
					<div class="scroll-arrow-box">
						<span class="scroll-arrow"></span>
					</div>
					<div class="scroll-btn-flip-box">
						<span class="scroll-btn-flip" data-text="Scroll">Scroll</span>
					</div>
				</a><!-- scroll dugme end -->
			</section><!-- home-slider end -->
			
			<!-- flex-min-height-box start -->
			<section id="down" class="dark-bg-1 flex-min-height-box">
				<!-- flex-min-height-inner start -->
				<div class="flex-min-height-inner">
					<!-- container start -->
					<div class="container small top-bottom-padding-120">
						<!-- flex-container start -->
						<div data-animation-container class="flex-container">
							<!-- column start -->
							<div class="twelve-columns text-center">
								<h2 class="large-title text-height-12">
									<span data-animation-child class="title-fill" data-animation="title-fill-anim" data-text="Vaš Partner">Vaš Partner</span><br>
									<span data-animation-child class="title-fill tr-delay01" data-animation="title-fill-anim" data-text="za Vozila i Registraciju">za Vozila i Registraciju</span>
								</h2>
							</div><!-- column end -->
							
							<!-- column start -->
							<div class="six-columns">
								<div class="content-right-margin-20">
									<p data-animation-child class="p-style-medium text-color-5 fade-anim-box tr-delay02" data-animation="fade-anim">
										Auto Delić je vaša pouzdana agencija za registraciju vozila, tehnički pregled, i osiguranje. Naš tim stručnjaka posvećen je tome da vam obezbedi brzu i efikasnu uslugu, pružajući sve potrebne informacije i podršku u vezi s vašim vozilom.
									</p>
								</div>
							</div><!-- column end -->
							
							<!-- column start -->
							<div class="six-columns">
								<div class="content-left-margin-20">
									<p data-animation-child class="p-style-medium text-color-5 fade-anim-box tr-delay03" data-animation="fade-anim">
										Uz širok spektar usluga, od registracije i tehničkog pregleda do osiguranja i prenosa vlasništva, Auto Delić je tu da vam pomogne u svakom koraku. Naša misija je jednostavna: sigurnost i zadovoljstvo svakog klijenta su naš prioritet.
									</p>
								</div>
							</div><!-- column end -->
							
							<!-- column start -->
							<div class="twelve-columns text-center">
								<p data-animation-child class="p-letter-style text-color-4 text-height-13 fade-anim-box tr-delay04" data-animation="fade-anim">
									Auto Delić  - Vaša sigurnost i poverenje su nam na prvom mestu.
								</p>
							</div><!-- column end -->
						</div><!-- flex-container end -->
					</div><!-- container end -->
				</div><!-- flex-min-height-inner end -->
			</section><!-- flex-min-height-box end -->
			
		
			<!-- section start -->
			<section class="light-bg-1 bottom-padding-30 top-padding-120" data-midnight="black">
				<!-- container start -->
				<div data-animation-container class="container small bottom-padding-60 text-center">
					<h2 data-animation-child class="large-title text-height-10 text-color-1 overlay-anim-box2" data-animation="overlay-anim2">Naše Usluge</h2><br>
					<p data-animation-child class="fade-anim-box tr-delay02 text-color-1 xsmall-title-oswald top-margin-5" data-animation="fade-anim">Sve što je potrebno za vaše vozilo na jednom mestu</p>
				</div><!-- container end -->
				
				<!-- Usluga 1: Registracija vozila -->
				<div class="bottom-padding-90">
					<div class="portfolio-content flex-min-height-box">
						<div class="portfolio-content-inner flex-min-height-inner">
							<div class="flex-container container small">
								<div data-animation-container class="six-columns">
									<div class="content-right-margin-40">
										<span class="small-title-oswald red-color overlay-anim-box2" data-animation="overlay-anim2">Registracija Vozila</span>
										<h3 class="title-style text-color-1">
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay01" data-animation="overlay-anim2">Prva registracija</span><br>
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay02" data-animation="overlay-anim2">Obnavljanje registracije</span><br>
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay03" data-animation="overlay-anim2">Promena tablica</span>
										</h3>
										<p data-animation-child class="p-style-small text-color-2 fade-anim-box tr-delay04" data-animation="fade-anim">
											Nudimo sve usluge registracije vozila, uključujući prvu registraciju, obnavljanje registracije, registraciju za elektro i hibridna vozila, promenu tablica i još mnogo toga.
										</p>
										
										<div data-animation-child class="arrow-btn-box top-margin-30 fade-anim-box tr-delay05" data-animation="fade-anim">
											<a href="#services" class="arrow-btn pointer-large animsition-link">Saznajte više</a>
										</div>
									</div>
								</div><!-- column end -->
								<div class="six-columns top-padding-60">
									<a href="#services" class="portfolio-content-bg-box pointer-large hover-box hidden-box animsition-link">
										<div class="portfolio-content-bg hover-img overlay-anim-box2 overlay-dark-bg-2" data-animation="overlay-anim2" style="background-image:url(assets/images/tehnickinocu.jpg)"></div>
									</a>
								</div><!-- column end -->
							</div><!-- flex-container end -->
						</div><!-- portfolio-content-inner end -->
					</div><!-- portfolio-content end -->
				</div><!-- bottom-padding-90 end -->
				
				<!-- Usluga 2: Tehnički pregled -->
				<div class="bottom-padding-90">
					<div class="portfolio-content flex-min-height-box">
						<div class="portfolio-content-inner flex-min-height-inner">
							<div class="flex-container reverse container small">
								<div class="six-columns top-padding-60">
									<a href="#services" class="portfolio-content-bg-box pointer-large hover-box hidden-box animsition-link">
										<div class="portfolio-content-bg hover-img overlay-anim-box2 overlay-dark-bg-2" data-animation="overlay-anim2" style="background-image:url(assets/images/tehnickiunutra5.jpg)"></div>
									</a>
								</div><!-- column end -->
								<div data-animation-container class="six-columns">
									<div class="content-left-margin-40">
										<span class="small-title-oswald red-color overlay-anim-box2" data-animation="overlay-anim2">Tehnički Pregled</span>
										<h3 class="title-style text-color-1">
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay01" data-animation="overlay-anim2">Zakazivanje pregleda</span><br>
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay02" data-animation="overlay-anim2">Provera vozila</span><br>
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay03" data-animation="overlay-anim2">Izrada dokumentacije</span>
										</h3>
										<p data-animation-child class="p-style-small text-color-2 fade-anim-box tr-delay04" data-animation="fade-anim">
											Pružamo kompletan tehnički pregled vozila, uključujući zakazivanje, proveru ispravnosti vozila i izradu potrebne dokumentacije.
										</p>
										
										<div data-animation-child class="arrow-btn-box top-margin-30 fade-anim-box tr-delay05" data-animation="fade-anim">
											<a href="#services" class="arrow-btn pointer-large animsition-link">Saznajte više</a>
										</div>
									</div>
								</div><!-- column end -->
							</div><!-- flex-container end -->
						</div><!-- portfolio-content-inner end -->
					</div><!-- portfolio-content end -->
				</div><!-- bottom-padding-90 end -->
				
				<!-- Usluga 3: Osiguranje vozila -->
				<div class="bottom-padding-90">
					<div class="portfolio-content flex-min-height-box">
						<div class="portfolio-content-inner flex-min-height-inner">
							<div class="flex-container container small">
								<div data-animation-container class="six-columns">
									<div class="content-right-margin-40">
										<span class="small-title-oswald red-color overlay-anim-box2" data-animation="overlay-anim2">Osiguranje Vozila</span>
										<h3 class="title-style text-color-1">
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay01" data-animation="overlay-anim2">Autoodgovornost</span><br>
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay02" data-animation="overlay-anim2">Kasko osiguranje</span><br>
											<span data-animation-child class="overlay-anim-box2 overlay-dark-bg-2 tr-delay03" data-animation="overlay-anim2">Pomoć na putu</span>
										</h3>
										<p data-animation-child class="p-style-small text-color-2 fade-anim-box tr-delay04" data-animation="fade-anim">
											Osigurajte svoje vozilo brzo i jednostavno sa našim uslugama autoodgovornosti, kasko osiguranja, osiguranja od loma stakla, i pomoći na putu.
										</p>
										
										<div data-animation-child class="arrow-btn-box top-margin-30 fade-anim-box tr-delay05" data-animation="fade-anim">
											<a href="#services" class="arrow-btn pointer-large animsition-link">Saznajte više</a>
										</div>
									</div>
								</div><!-- column end -->
								<div class="six-columns top-padding-60">
									<a href="#services" class="portfolio-content-bg-box pointer-large hover-box hidden-box animsition-link">
										<div class="portfolio-content-bg hover-img overlay-anim-box2 overlay-dark-bg-2" data-animation="overlay-anim2" style="background-image:url(assets/images/znak3.jpg)"></div>
									</a>
								</div><!-- column end -->
							</div><!-- flex-container end -->
						</div><!-- portfolio-content-inner end -->
					</div><!-- portfolio-content end -->
				</div><!-- bottom-padding-90 end -->
			</section><!-- section end -->
			
			
			<!-- section start -->
			<section class="dark-bg-2">
				<!-- container start -->
				<div class="container small top-bottom-padding-120">
					<!-- medium-title start -->
					<h2 data-animation-container class="medium-title">
						<span data-animation-child class="title-fill" data-animation="title-fill-anim" data-text="Saradnici">Saradnici</span><br>
						
					</h2><!-- medium-title end -->
					
					<!-- client-list start -->
					<ul class="client-list d-flex-wrap top-padding-60">
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/astrgovina.jpg" alt="Brand" class="hover-opac-img">
									<img src="assets/images/asatrgovina.jpg" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/bdauto.jpg" alt="Brand" class="hover-opac-img">
									<img src="assets/images/bdauto.jpg" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/citytaxi.jpg" alt="Brand" class="hover-opac-img">
									<img src="assets/images/citytaxi.jpg" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/generali.png" alt="Brand" class="hover-opac-img">
									<img src="assets/images/generali.png" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/globas.png" alt="Brand" class="hover-opac-img">
									<img src="assets/images/globas.png" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/krunic.jpg" alt="Brand" class="hover-opac-img">
									<img src="assets/images/krunic.jpg" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="#" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/onewelnes.png" alt="Brand" class="hover-opac-img">
									<img src="assets/images/onewelnes.png" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
						<li>
							<a href="https://www.instagram.com/_bsphotography__/" class="pointer-large d-block">
								<div class="brand-box">
									<img src="assets/images/fotografdelic.png" alt="Brand" class="hover-opac-img">
									<img src="assets/images/fotografdelic.png" alt="Brand" class="opac-img">
								</div>
							</a>
						</li>
					
						
						<li class="empty-spot-box">
							<a data-animation-container href="#" class="pointer-large p-style-bold-up empty-spot d-block">
								<span data-animation-child class="title-fill" data-animation="title-fill-anim" data-text="Ovo mesto je">Ovo mesto je</span>
								<span data-animation-child class="title-fill tr-delay01" data-animation="title-fill-anim" data-text="Rezervisano">Rezervisano</span>
								<span data-animation-child class="title-fill tr-delay02" data-animation="title-fill-anim" data-text="Za vas">Za vas</span>
							</a>
						</li>
					</ul><!-- client-list end -->
				</div><!-- container end -->
			</section><!-- section end -->

			<!-- light-bg-2 start -->
			<div class="light-bg-2 top-bottom-padding-120" data-midnight="black">
				<!-- testimonials-slider start -->
				<div class="testimonials-slider container small">
					<!-- swiper-wrapper start -->
					<div class="swiper-wrapper">
						<!-- slide start -->
						<div class="swiper-slide text-center">
							<img src="assets/images/testimonials/adult-beanie-black-background-1529350.jpg" alt="author">
							<div class="testimonials-content">
								<p class="text-color-4 p-style-bold">“Brzina i profesionalnost usluge za registraciju vozila su neverovatni! Sve je bilo gotovo za manje od pola sata. Hvala timu Auto Delić  na sjajnom iskustvu!”</p>
							</div>
							<div class="text-color-1 small-title-oswald">
								Marko Petrović, <span class="text-color-2">Vlasnik vozila</span>
							</div>
						</div><!-- slide end -->
						
						<!-- slide start -->
						<div class="swiper-slide text-center">
							<img src="assets/images/testimonials/pexels-photo-428340.jpeg" alt="author">
							<div class="testimonials-content">
								<p class="text-color-4 p-style-bold">“Iskoristio sam sve njihove usluge - registraciju, tehnički pregled i osiguranje. Bilo je brzo, bez stresa, i sve na jednom mestu. Topla preporuka za sve vlasnike automobila!”</p>
							</div>
							<div class="text-color-1 small-title-oswald">
								Ivana Jovanović, <span class="text-color-2">Pravna savetnica</span>
							</div>
						</div><!-- slide end -->
						
						<!-- slide start -->
						<div class="swiper-slide text-center">
							<img src="assets/images/testimonials/pexels-photo-764529.jpeg" alt="author">
							<div class="testimonials-content">
								<p class="text-color-4 p-style-bold">“Tehnički pregled je bio efikasan i detaljan. Tim je bio profesionalan i dao mi je korisne savete o održavanju. Definitivno ću se ponovo vratiti.”</p>
							</div>
							<div class="text-color-1 small-title-oswald">
								Stefan Nikolić, <span class="text-color-2">Mali privrednik</span>
							</div>
						</div><!-- slide end -->
						
						<!-- slide start -->
						<div class="swiper-slide text-center">
							<img src="assets/images/testimonials/pexels-photo-809433.jpeg" alt="author">
							<div class="testimonials-content">
								<p class="text-color-4 p-style-bold">“Auto Delić  je moj izbor za sve usluge osiguranja. Imaju odličnu ponudu i pomogli su mi da izaberem polisu koja odgovara mom budžetu. Sve preporuke!”</p>
							</div>
							<div class="text-color-1 small-title-oswald">
								Jovana Ilić, <span class="text-color-2">Finansijski savetnik</span>
							</div>
						</div><!-- slide end -->
						
						<!-- slide start -->
						<div class="swiper-slide text-center">
							<img src="assets/images/testimonials/pexels-photo-894156.jpeg" alt="author">
							<div class="testimonials-content">
								<p class="text-color-4 p-style-bold">“Prenos vlasništva na novom automobilu je prošao brzo i lako. Zahvaljujući stručnom timu, sve je bilo spremno bez ikakvih komplikacija!”</p>
							</div>
							<div class="text-color-1 small-title-oswald">
								Milena Stojanović, <span class="text-color-2">Klijent</span>
							</div>
						</div><!-- slide end -->
					</div><!-- swiper-wrapper end -->
					
					<!-- swiper-pagination -->
					<div class="swiper-pagination"></div>
				</div><!-- testimonials-slider end -->
			</div><!-- light-bg-2 end -->
			
			
			<!-- video-content-bg start -->
			<div class="video-content-bg" style="background-image:url(assets/images/klijenti1.jpg)">
				<div class="bg-overlay"></div>
				<a href="https://www.youtube.com/shorts/FUPG5hBjyv0" class="video-play-button popup-youtube pointer-large">
					<span></span>
				</a>
			</div><!-- video-content-bg end -->
			
			<!-- latest-news start -->
			
		</main><!-- animsition-overlay end -->
		
		<!-- footer start -->
		<footer class="footer dark-bg-1">
			<!-- flex-container start -->
			<div class="flex-container container top-bottom-padding-90">
				<!-- logo kolona start -->
				<div class="two-columns bottom-padding-60">
					<div class="content-right-margin-10 footer-center-mobile">
						<img class="footer-logo" src="assets/images/logonovi.png" alt="Auto Delić  Logo">
					</div>
				</div><!-- logo kolona end -->
		
				<!-- meni kolona start -->
				<div class="three-columns bottom-padding-60">
					<div class="content-left-right-margin-10">
						<ul class="footer-menu text-color-4">
							<li><a class="pointer-large animsition-link small-title-oswald hover-color active" href="index.php">Početna</a></li>
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
							<li><i class="fas fa-mobile-alt"></i><a href="tel:+38162443050" class="xsmall-title-oswald">+381 62 44 30 50</a></li>
							<li><i class="fas fa-map-marker-alt"></i><a href="#" class="xsmall-title-oswald text-height-17">Bulevar Svetog Cara Konstantina 67Nj<br><span>Niš, Srbija</span></a></li>
						</ul>
					</div>
				</div><!-- kontakt informacije end -->
		
				<!-- društvene mreže start -->
				<div class="three-columns bottom-padding-60">
					<div class="content-left-margin-10">
						<ul class="footer-social">
							<li>
								<div class="flip-btn-box">
									<a href="https://www.instagram.com/auto_delic/" class="flip-btn pointer-small" data-text="Instagram">Instagram</a>
								</div>
							</li>
							<li>
								<div class="flip-btn-box">
									<a href="https://www.facebook.com/profile.php?id=61568973625956&locale=cx_PH" class="flip-btn pointer-small" data-text="Facebook">Facebook</a>
								</div>
							</li>
						</ul>
					</div>
				</div><!-- društvene mreže end -->
		
				<!-- autorska prava start -->
				<div class="twelve-columns">
					<p class="p-letter-style text-color-4 footer-copyright">
						&copy; <?php print(date("Y")) ?> Auto Delić. Sva prava zadržana.
					</p>
				</div><!-- autorska prava end -->
			</div><!-- flex-container end -->
		</footer><!-- footer end -->
		<!-- footer end -->
		 
		<?php LoadScripts() ?>
	</body>
</html>