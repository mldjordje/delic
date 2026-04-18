<?php 
require_once("parts/auth.php");
require_once("parts/layout.php");
require_once("parts/mysql.php");

// Handle delete request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $delete_id = (int)$_POST['delete_id'];
    $stmt = $conn->prepare("DELETE FROM tehnicki_pregledi WHERE id = ?");
    $stmt->bind_param("i", $delete_id);
    if ($stmt->execute()) {
        echo "<div style='color: green; margin-bottom: 15px;'>Uspešno obrisano zakazivanje sa ID-jem $delete_id.</div>";
    } else {
        echo "<div style='color: red; margin-bottom: 15px;'>Greška prilikom brisanja zakazivanja.</div>";
    }
}
?>

<?php 
LoadHead("Početna"); 
LoadNavBar();
?>

<div id="layoutSidenav_content">
    <main>
        <div class="container-fluid px-4">
            <h1 class="mt-4 mb-4">Lista zakazanih tehničkih pregleda</h1>

            <div class="card">
                <div class="card-body">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>ID zakazivanja</th>
                                <th>Ime</th>
                                <th>Prezime</th>
                                <th>Brend vozila</th>
                                <th>Broj telefona</th>
                                <th>Termin</th>
                                <th>Kreirano</th>
                                <th>Akcija</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            <?php 
                            $sql = "SELECT * FROM tehnicki_pregledi ORDER BY id DESC";
                            $result = $conn->query($sql);
                            
                            if ($result->num_rows > 0) {
                                while($row = $result->fetch_assoc()) {
                            ?>
                                <tr>
                                    <td><?php print($row["id"]) ?></td>
                                    <td><?php print($row["ime"]) ?></td>
                                    <td><?php print($row["prezime"]) ?></td>
                                    <td><?php print($row["marka"]) ?></td>
                                    <td><?php print($row["broj_telefona"]) ?></td>
                                    <td><?php echo date("d/m/Y H:i:s", strtotime($row["termin"])); ?></td>
                                    <td><?php echo date("d/m/Y H:i:s", strtotime($row["created_on"])); ?></td>
                                    <td>
                                        <!-- Delete Button Form -->
                                        <form method="post" onsubmit="return confirm('Da li ste sigurni da želite da obrišete zakazivanje?');">
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

<?php LoadFooter(); ?>
