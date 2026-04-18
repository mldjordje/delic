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
			<section id="up" class="page-head flex-min-height-box dark-bg-1">
				<!-- page-head-bg -->
				<div class="page-head-bg overlay-loading2" style="background-image: url(&quot;assets/images/tehnickiunutra5.jpg&quot;); transform: translate3d(0px, 0px, 0px); transition: all;"></div>

				<!-- flex-min-height-inner start -->
	  			<div class="flex-min-height-inner">
		  			<!-- flex-container start -->
		  			<div class="container top-bottom-padding-120 flex-container response-999">
			  			<!-- column start -->
			  			<div class="six-columns six-offset">
				  			<div class="content-left-margin-40">
				  				<h2 class="large-title-bold">
									<span class="load-title-fill tr-delay03" data-text="Zakažite online">Zakažite online</span><br>
									<span class="load-title-fill tr-delay04" data-text="Tehnički">Tehnički</span><br>
									<span class="load-title-fill tr-delay05" data-text="Pregled">Pregled</span>
								</h2>
								<p class="p-style-bold-up text-height-20 d-flex-wrap">
									<span class="load-title-fill tr-delay08" data-text="Rezervišite vaš termin za 30 sekundi!">Rezervišite vaš termin za 30 sekundi!</span>
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
						<span class="scroll-btn-flip" data-text="Forma za zakazivanje">Forma za zakazivanje</span>
					</div>
				 </a><!-- scroll-btn end -->
			</section><!-- page-head end -->

			<section id="down" class="contact-form-box dark-bg-1 flex-min-height-box">
				<div class="bg-overlay"></div>
				<!-- flex-min-height-inner start -->
				<div class="flex-min-height-inner">
					<!-- contact-form-container start -->
					<div class="contact-form-container">
						<!-- container start -->
						<div class="container small top-bottom-padding-120 form-box">
							<h4 class="small-title-oswald text-color-4 text-center">Forma za zakazivanje</h4>
							<!-- flex-container start -->
							<form class="flex-container top-padding-90" method="post" name="formobrsv" id="send_form">
								<!-- column start -->
								<div class="four-columns">
									<div class="input-box">
                      <input type="text" name="ime" id="ime" required class="form-input pointer-small">
                      <label for="ime" class="form-label">Ime</label>
                  </div>
								</div><!-- column end -->
								<!-- column start -->
								<div class="four-columns">
									<div class="content-left-right-margin-10 input-box">
                      <input type="text" name="prezime" id="prezime" required class="form-input pointer-small">
                      <label for="prezime" class="form-label">Prezime</label>
									</div>
								</div><!-- column end -->
								<!-- column start -->
								<div class="four-columns">
                    <div class="input-box">
											<?php
											// Path to the JSON file
											$jsonFile = 'brands.json';

											// Read and decode the JSON file
											$brands = json_decode(file_get_contents($jsonFile), true);

											if ($brands && is_array($brands)) {
													// Output the default option
													echo '<select name="marka" id="marka" required class="form-select pointer-small">';
													echo '<option value="">Izaberite marku...</option>';
													
													// Loop through the array and create option elements
													foreach ($brands as $brand) {
															$name = htmlspecialchars($brand['name'], ENT_QUOTES, 'UTF-8');
															echo "<option value=\"$name\">$name</option>";
													}

													echo '</select>';
											} else {
													echo 'Error loading brands.';
											}
											?>
                  </div>
                </div>
                <div class="four-columns">
                    <div class="input-box">
                      <input type="text" name="broj_telefona" id="broj_telefona" required class="form-input pointer-small">
                      <label for="broj_telefona" class="form-label email-label">Broj telefona</label>
                  </div>
                </div>
                <div class="four-columns">
									<div class="content-left-right-margin-10 input-box">
											<input type="date" name="datum" id="datum" required class="form-input pointer-small" min="<?= date('Y-m-d') ?>">
											<label for="datum" class="form-label email-label">Datum</label>
									</div>
								</div>
                <div class="four-columns">
                    <div class="input-box">
                      <select name="vreme" id="vreme" required class="form-select pointer-small">
                        <option value="">Izaberite vreme...</option>
                      </select>
                  </div>
                </div>

								<div class="twelve-columns">
									<div id="alert-box" class="alert-box" style="display: none; margin-top: 20px; font-size: 18px;"></div>
								</div>

								<!-- column start -->
								<div class="twelve-columns text-center top-padding-90">
									<button id="send" class="border-btn-box pointer-large">
										<span class="border-btn-inner">
									      	<span class="border-btn" data-text="Potvrdite dolazak">Potvrdite dolazak</span>
									      	<span class="btn-wait">Wait...</span>
									    </span>
									</button>
								</div><!-- column end -->
							</form><!-- flex-container end -->
						</div><!-- container end -->

						<!-- alert start -->
						<div class="js-popup-fade" id="m_err">
							<div class="js-popup text-center">
								<div class="popup-icon">
									<i class="fas fa-times"></i>
								</div>
								<div class="popup-alert title-style text-color-4">Error</div>
								<div class="flip-btn-box js-popup-close">
									<div class="flip-btn pointer-large" data-text="Close">Close</div>
								</div>
							</div>
						</div><!-- alert end -->
					</div><!-- contact-form-container end -->
				</div><!-- flex-min-height-inner end -->
			</section><!-- contact-form-box end -->
			
			<!-- flex-min-height-box start -->
			<section class="dark-bg-2 flex-min-height-box">
				<!-- flex-min-height-inner start -->
				<div class="flex-min-height-inner">
					<!-- container start -->
					<div class="container top-padding-120 bottom-padding-60">
						<div data-animation-container>
							<h2 class="large-title text-center">
								<span data-animation-child class="title-fill" data-animation="title-fill-anim" data-text="Zakazivanje Tehničkog Pregleda">Zakazivanje Tehničkog Pregleda</span>
							</h2>
							<p data-animation-child class="p-style-small text-color-5 fade-anim-box tr-delay03" data-animation="fade-anim">Naš sistem za online zakazivanje tehničkog pregleda omogućava vam da rezervišete termin u svega par klikova. Pratite jednostavne korake i završite sve za samo nekoliko minuta.</p>
						</div>
						
						<!-- flex-container start -->
						<div class="flex-container top-padding-90 contact-box">
							<!-- column start -->
							<div class="four-columns bottom-padding-60">
								<div data-animation-container class="content-right-margin-20">
									<p data-animation-child class="small-title-oswald red-color overlay-anim-box2" data-animation="overlay-anim2">Popunite Osnovne Informacije</p>
									<p class="title-style text-color-4">
										<span data-animation-child class="overlay-anim-box2 overlay-light-bg-1 tr-delay01" data-animation="overlay-anim2">Unesite svoje podatke</span><br>
										<span data-animation-child class="overlay-anim-box2 overlay-light-bg-1 tr-delay02" data-animation="overlay-anim2">i podatke o vozilu.</span><br>
									</p>
								</div>
							</div><!-- column end -->
							<!-- column start -->
							<div class="four-columns bottom-padding-60">
								<div data-animation-container class="content-left-right-margin-10">
									<p data-animation-child class="small-title-oswald red-color overlay-anim-box2" data-animation="overlay-anim2">Izaberite Datum i Vreme</p>
									<h6 class="title-style text-color-4">
										<span data-animation-child class="overlay-anim-box2 overlay-light-bg-1 tr-delay01" data-animation="overlay-anim2">Pronađite termin</span><br>
										<span data-animation-child class="overlay-anim-box2 overlay-light-bg-1 tr-delay02" data-animation="overlay-anim2">koji vam odgovara</span><br>
										<span data-animation-child class="overlay-anim-box2 overlay-light-bg-1 tr-delay03" data-animation="overlay-anim2">i rezervišite bez čekanja.</span>
									</h6>
								</div>
							</div><!-- column end -->
							<!-- column start -->
							<div class="four-columns bottom-padding-60">
								<div data-animation-container class="content-left-margin-20">
									<p data-animation-child class="small-title-oswald red-color overlay-anim-box2" data-animation="overlay-anim2">Potvrdite Zakazivanje</p>
									<p class="title-style text-color-4">
										<span data-animation-child class="overlay-anim-box2 overlay-light-bg-1 tr-delay01" data-animation="overlay-anim2">Potvrdite termin klikom na dugme.</span><br>
									</p>
								</div>
							</div><!-- column end -->
						</div><!-- flex-container end -->
					</div><!-- container end -->
				</div><!-- flex-min-height-inner end -->
			</section><!-- flex-min-height-box end -->

			<!-- contact-form-box start -->
			
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
		
		<?php LoadScripts() ?>
	</body>
</html>

<style>
  input[type="date"] {
      display: inline-block;
      position: relative;
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
      background: transparent;
      bottom: 0;
      color: transparent;
      cursor: pointer;
      height: auto;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      width: auto;
  }

  input[type=date]:required:invalid::-webkit-datetime-edit {
    color: transparent;
}
input[type=date]:focus::-webkit-datetime-edit {
    color: black !important;
}

option:not(first-child) {
        color: #000;
    }
</style>

<script>
    document.getElementById('datum').addEventListener('change', async function () {
        const date = this.value;
        const response = await fetch(`admin/get_available_slots?date=${date}`);
        const data = await response.json();

        const vremeSelect = document.getElementById('vreme');
        vremeSelect.innerHTML = '<option value="">Izaberite vreme...</option>';
        data.slots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            vremeSelect.appendChild(option);
        });
    });

    document.getElementById('send_form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const response = await fetch('admin/book_appointment', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        const alertBox = document.getElementById('alert-box');
        
        if (data.success) {
            alertBox.style.display = 'block';
            alertBox.style.color = 'green';
            alertBox.style.border = '1px solid green';
            alertBox.style.padding = '10px';
            alertBox.style.borderRadius = '5px';
            alertBox.innerHTML = data.success;
            
            // Reset form after successful submission
            document.getElementById('send_form').reset();
            
            // Clear available time options
            document.getElementById('vreme').innerHTML = '<option value="">Izaberite vreme...</option>';
        } else {
            alertBox.style.display = 'block';
            alertBox.style.color = 'red';
            alertBox.style.border = '1px solid red';
            alertBox.style.padding = '10px';
            alertBox.style.borderRadius = '5px';
            alertBox.innerHTML = data.error;
        }
    });
</script>
