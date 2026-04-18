<?php 
require_once("parts/auth.php");
require_once("parts/layout.php");
require_once("parts/mysql.php");

LoadHead("Lista Vozila"); 
LoadNavBar();

// Handle update and delete requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['update_id'])) {
        // Handle update request
        $update_id = (int)$_POST['update_id'];
        $naziv = $_POST['naziv'] ?? '';
        $kratki_opis = $_POST['kratki_opis'] ?? '';
        $opis = $_POST['opis'] ?? '';
        $cena = $_POST['cena'] ?? 0;

        $stmt = $conn->prepare("UPDATE vozila SET naziv = ?, kratki_opis = ?, opis = ?, cena = ? WHERE id = ?");
        $stmt->bind_param("sssdi", $naziv, $kratki_opis, $opis, $cena, $update_id);

        if ($stmt->execute()) {
            //echo "<div style='color: green; margin-bottom: 15px;'>Vozilo uspešno ažurirano.</div>";
        } else {
            //echo "<div style='color: red; margin-bottom: 15px;'>Greška prilikom ažuriranja vozila.</div>";
        }
    }

    if (isset($_POST['delete_id'])) {
        // Handle delete request
        $delete_id = (int)$_POST['delete_id'];
        $stmt = $conn->prepare("DELETE FROM vozila WHERE id = ?");
        $stmt->bind_param("i", $delete_id);

        if ($stmt->execute()) {
            //echo "<div style='color: green; margin-bottom: 15px;'>Vozilo uspešno obrisano.</div>";
        } else {
            //echo "<div style='color: red; margin-bottom: 15px;'>Greška prilikom brisanja vozila.</div>";
        }
    }
}
?>

<div id="layoutSidenav_content">
    <main>
        <div class="container-fluid px-4">
            <h1 class="mt-4 mb-4">Lista Vozila</h1>

            <!-- Editable Form Above the Table -->
            <div id="editFormContainer" style="display: none; margin-bottom: 20px;">
                <h3>Uredi Vozilo</h3>
                <form method="post" id="editForm">
                    <input type="hidden" name="update_id" id="update_id">
                    
                    <div class="form-group">
                        <label for="naziv">Naslov</label>
                        <input type="text" name="naziv" id="edit_naziv" class="form-control" required>
                    </div>
                    
                    <div class="form-group mt-2">
                        <label for="kratki_opis">Kratki Opis</label>
                        <textarea name="kratki_opis" id="edit_kratki_opis" class="form-control" rows="2"></textarea>
                    </div>
                    
                    <div class="form-group mt-2">
                        <label for="opis">Opis</label>
                        <textarea rows="10" name="opis" id="edit_opis" class="form-control" rows="3"></textarea>
                    </div>
                    
                    <div class="form-group mt-2">
                        <label for="cena">Cena</label>
                        <input type="number" step="0.01" name="cena" id="edit_cena" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="mt-2 btn btn-primary">Sačuvaj izmene</button>
                    <button type="button" class="mt-2 btn btn-secondary" onclick="hideEditForm()">Otkaži</button>
                </form>
            </div>

            <div class="card">
                <div class="card-body">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>Slika</th>
                                <th>ID Vozila</th>
                                <th>Naslov</th>
                                <th>Kratki Opis</th>
                                <th>Cena</th>
                                <th>Akcija</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            <?php 
                            $sql = "SELECT id, naziv, kratki_opis, opis, cena FROM vozila ORDER BY id DESC";
                            $result = $conn->query($sql);
                            
                            if ($result->num_rows > 0) {
                                while($row = $result->fetch_assoc()) {
                                    $imageDir = "vozila/" . $row['id'] . "/";
                                    $imagePath = "assets/images/default.jpg"; 

                                    if (is_dir($imageDir)) {
                                        $images = glob($imageDir . "*.{jpg,jpeg,png,gif}", GLOB_BRACE);
                                        if (!empty($images)) {
                                            usort($images, function($a, $b) {
                                                return filemtime($a) - filemtime($b);
                                            });
                                            $imagePath = $images[0];
                                        }
                                    }
                            ?>
                                <tr>
                                    <td>
                                        <img src="<?php echo htmlspecialchars($imagePath); ?>" alt="Slika vozila" style="width: 100px; height: auto;">
                                    </td>
                                    <td><?php echo htmlspecialchars($row["id"]); ?></td>
                                    <td><?php echo htmlspecialchars($row["naziv"]); ?></td>
                                    <td><?php echo htmlspecialchars($row["kratki_opis"]); ?></td>
                                    <td><?php echo number_format($row["cena"], 2) . " €"; ?></td>
                                    <td>
                                        <!-- Edit Button to show form -->
                                        <button class="btn btn-primary btn-sm" onclick='showEditForm(
    "<?php echo htmlspecialchars($row['id'], ENT_QUOTES); ?>",
    "<?php echo htmlspecialchars($row['naziv'], ENT_QUOTES); ?>",
    "<?php echo htmlspecialchars($row['kratki_opis'], ENT_QUOTES); ?>",
    <?php echo json_encode($row['opis']); ?>,
    "<?php echo htmlspecialchars($row['cena'], ENT_QUOTES); ?>"
)'>Uredi</button>


                                        <!-- Delete Button Form -->
                                        <form method="post" style="display:inline-block;" onsubmit="return confirm('Da li ste sigurni da želite da obrišete ovo vozilo?');">
                                            <input type="hidden" name="delete_id" value="<?php echo $row['id']; ?>">
                                            <button type="submit" class="btn btn-danger btn-sm">Obriši</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php 
                                } 
                            } 
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<script>
// Show the edit form and populate with data
function showEditForm(id, naziv, kratki_opis, opis, cena) {
    document.getElementById('editFormContainer').style.display = 'block';
    document.getElementById('update_id').value = id;
    document.getElementById('edit_naziv').value = naziv;
    document.getElementById('edit_kratki_opis').value = kratki_opis;
    document.getElementById('edit_opis').value = opis; // Correctly formatted
    document.getElementById('edit_cena').value = cena;
}

// Hide the edit form
function hideEditForm() {
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('editForm').reset();
}
</script>

<?php LoadFooter(); ?>
