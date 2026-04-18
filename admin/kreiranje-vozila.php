<?php
require_once("parts/auth.php");
require_once("parts/layout.php");
require_once("parts/mysql.php");

LoadHead("Create New Listing");
LoadNavBar();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $naziv = $_POST['naziv'] ?? '';
  $kratki_opis = $_POST['kratki_opis'] ?? '';
  $opis = $_POST['opis'] ?? '';
  $cena = $_POST['cena'] ?? 0;

  // Insert new record
  $stmt = $conn->prepare("INSERT INTO vozila (naziv, kratki_opis, opis, cena, created_on) VALUES (?, ?, ?, ?, NOW())");
  $stmt->bind_param('sssd', $naziv, $kratki_opis, $opis, $cena);

  if ($stmt->execute()) {
      $recordId = $stmt->insert_id;  // Get the ID of the new record

      // Create folder for images
      $uploadDir = "vozila/$recordId/";
      if (!is_dir($uploadDir)) {
          mkdir($uploadDir, 0777, true);
      }

      // Process each uploaded image with sequential naming
      $imageCounter = 1;  // Start counter for sequential naming
      foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
          // Get file extension
          $extension = pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION);
          
          // Define the new name with the counter
          $imageName = $imageCounter . "." . $extension;
          $targetFile = $uploadDir . $imageName;

          // Move uploaded file and increment counter
          if (move_uploaded_file($tmpName, $targetFile)) {
              // Wait for 1 second after uploading the first image
              if ($imageCounter === 1) {
                  sleep(1);
              }
              
              $imageCounter++; // Increment the counter for the next image
          }
      }

      // Redirect to vozila.php on success
      header("Location: vozila.php");
      exit();
  } else {
      // Redirect to vozila.php on error
      header("Location: vozila.php");
      exit();
  }
}

?>

<div id="layoutSidenav_content">
    <main>
        <div class="container-fluid px-4">
            <h1 class="mt-4 mb-4">Kreiranje vozila</h1>
            <form target="kreiranjeVozila" method="POST" enctype="multipart/form-data" class="form-group">
                <div class="mb-3">
                    <label for="naziv" class="form-label">Naslov oglasa</label>
                    <input type="text" name="naziv" id="naziv" class="form-control" required>
                </div>
                
                <div class="mb-3">
                    <label for="kratki_opis" class="form-label">Kratki opis</label>
                    <textarea name="kratki_opis" id="kratki_opis" class="form-control" rows="3"></textarea>
                </div>
                
                <div class="mb-3">
                    <label for="opis" class="form-label">Opis</label>
                    <textarea name="opis" id="opis" class="form-control" rows="5"></textarea>
                </div>
                
                <div class="mb-3">
                    <label for="cena" class="form-label">Cena</label>
                    <input type="number" step="0.01" name="cena" id="cena" class="form-control" required>
                </div>
                
                <div class="mb-3">
                    <label for="images" class="form-label">Upload Images</label>
                    <input type="file" name="images[]" id="images" class="form-control" multiple accept="image/*" onchange="previewImages()">
                </div>
                
                <div id="imagePreview" class="mb-3"></div>

                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
    </main>
</div>

<script>
function previewImages() {
    var preview = document.getElementById("imagePreview");
    preview.innerHTML = ""; // Clear existing images
    var files = document.getElementById("images").files;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        
        reader.onload = function (e) {
            var img = document.createElement("img");
            img.src = e.target.result;
            img.className = "img-thumbnail m-1";
            img.style.width = "100px";
            preview.appendChild(img);
        };
        
        reader.readAsDataURL(file);
    }
}
</script>

<?php LoadFooter(); ?>
