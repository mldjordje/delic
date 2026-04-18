<?php
require_once("parts/auth.php");
require_once("parts/layout.php");
require_once("parts/mysql.php");

// Provera uloge
$is_admin = ($userRole === 'admin');

LoadHead("Tehnički pregledi");
LoadNavBar();

// --- Handle save (insert/update) --- //
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save'])) {
    $id = $_POST['id'] ?? null;

    // Za admina: sve vrednosti dolaze iz forme
    if ($is_admin) {
        $vreme_tehnickog = $_POST['vreme_tehnickog'] ?? null;
        $datum_pregleda = $_POST['datum_pregleda'] ?? null;
        $ime_prezime = $_POST['ime_prezime'] ?? null;
        $broj_telefona = $_POST['broj_telefona'] ?? null;
        $marka_vozila = $_POST['marka_vozila'] ?? null;
        $tip_vozila = $_POST['tip_vozila'] ?? null;
    } else {
        // Za radnika: zadrži postojeće vrednosti polja koja ne menja
        $stmt = $conn->prepare("SELECT vreme_tehnickog, datum_pregleda, ime_prezime, broj_telefona, marka_vozila, tip_vozila FROM tehnicki_pregledi_novi WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($vreme_tehnickog, $datum_pregleda, $ime_prezime, $broj_telefona, $marka_vozila, $tip_vozila);
        $stmt->fetch();
        $stmt->close();
    }

    // Polja koja radnik menja (ili admin)
    $datum_isteka_registracije = $_POST['datum_isteka_registracije'] ?? null;
    $datum_isteka_atesta = $_POST['datum_isteka_atesta'] ?? null;
    $status = $_POST['status'] ?? null;
    $napomena = $_POST['napomena'] ?? null;

    if ($id) {
        // UPDATE
        $stmt = $conn->prepare("UPDATE tehnicki_pregledi_novi SET
            vreme_tehnickog=?, datum_pregleda=?, ime_prezime=?, broj_telefona=?, marka_vozila=?, tip_vozila=?,
            datum_isteka_registracije=?, datum_isteka_atesta=?, status=?, napomena=?
            WHERE id=?");
        $stmt->bind_param("ssssssssssi",
            $vreme_tehnickog, $datum_pregleda, $ime_prezime, $broj_telefona, $marka_vozila, $tip_vozila,
            $datum_isteka_registracije, $datum_isteka_atesta, $status, $napomena, $id
        );
        $stmt->execute();
        $stmt->close();
    } else {
        // INSERT
        $stmt = $conn->prepare("INSERT INTO tehnicki_pregledi_novi
            (vreme_tehnickog, datum_pregleda, ime_prezime, broj_telefona, marka_vozila, tip_vozila, datum_isteka_registracije, datum_isteka_atesta, status, napomena)
            VALUES (?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssssssssss",
            $vreme_tehnickog, $datum_pregleda, $ime_prezime, $broj_telefona, $marka_vozila, $tip_vozila,
            $datum_isteka_registracije, $datum_isteka_atesta, $status, $napomena
        );
        $stmt->execute();
        $stmt->close();
    }

    header("Location: tehnicki.php");
    exit();
}


// --- Handle delete (samo admin) --- //
if ($is_admin && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $delete_id = (int)$_POST['delete_id'];
    $stmt = $conn->prepare("DELETE FROM tehnicki_pregledi_novi WHERE id=?");
    $stmt->bind_param("i", $delete_id);
    $stmt->execute();
    $stmt->close();
    echo "<div style='color: green; margin-bottom:15px;'>Uspešno obrisano pregleda sa ID: $delete_id</div>";
}

// --- Fetch all records --- //
$result = $conn->query("SELECT * FROM tehnicki_pregledi_novi ORDER BY datum_pregleda DESC");
$rows = [];
if($result){
    while($row = $result->fetch_assoc()){
        $rows[] = $row;
    }
}

// Funkcija za prikaz datuma u dd/mm/yyyy
function formatDateDMY($date){
    if(!$date) return '';
    return date("d/m/Y", strtotime($date));
}
?>

<div id="layoutSidenav_content">
    <main>
        <div class="container-fluid px-4">
            <h1 class="mt-4 mb-4">Tehnički pregledi</h1>

            <?php if($is_admin): ?>
            <a href="#" class="btn btn-success mb-3" onclick="document.getElementById('addForm').style.display='block'; return false;">Dodaj novi pregled</a>

            <!-- Dodavanje novog pregleda -->
            <div id="addForm" style="display:none;" class="card p-3 mb-3">
                <h5>Dodaj novi pregled</h5>
                <form method="post">
                    <input type="hidden" name="id">
                    <div class="row mb-2">
                        <div class="col">
                            <label class="form-label small">Vreme tehničkog</label>
                            <input type="datetime-local" name="vreme_tehnickog" class="form-control" required>
                        </div>
                        <div class="col">
                            <label class="form-label small">Datum pregleda</label>
                            <input type="date" name="datum_pregleda" class="form-control" required>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <label class="form-label small">Ime i prezime</label>
                            <input type="text" name="ime_prezime" class="form-control" required>
                        </div>
                        <div class="col">
                            <label class="form-label small">Broj telefona</label>
                            <input type="text" name="broj_telefona" class="form-control">
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <label class="form-label small">Marka vozila</label>
                            <input type="text" name="marka_vozila" class="form-control">
                        </div>
                        <div class="col">
                            <label class="form-label small">Tip vozila</label>
                            <input type="text" name="tip_vozila" class="form-control">
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <label class="form-label small">Datum isteka registracije</label>
                            <input type="date" name="datum_isteka_registracije" class="form-control">
                        </div>
                        <div class="col">
                            <label class="form-label small">Datum isteka atesta</label>
                            <input type="date" name="datum_isteka_atesta" class="form-control">
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col">
                            <label class="form-label small">Status</label>
                            <select name="status" class="form-control">
                                <option value="">Status</option>
                                <option value="prošao">Prošao</option>
                                <option value="nije prošao">Nije prošao</option>
                            </select>
                        </div>
                        <div class="col">
                            <label class="form-label small">Napomena</label>
                            <input type="text" name="napomena" class="form-control">
                        </div>
                    </div>
                    <button type="submit" name="save" class="btn btn-primary">Sačuvaj</button>
                </form>
            </div>
            <?php endif; ?>

            <!-- Inline Edit forma -->
<div id="editForm" style="display:none;" class="card p-3 mb-3">
    <h5>Izmeni pregled</h5>
    <form method="post">
        <input type="hidden" name="id" id="edit_id">

        <?php if($is_admin): ?>
        <div class="row mb-2">
            <div class="col">
                <label class="form-label small">Vreme tehničkog</label>
                <input type="datetime-local" name="vreme_tehnickog" id="edit_vreme_tehnickog" class="form-control">
            </div>
            <div class="col">
                <label class="form-label small">Datum pregleda</label>
                <input type="date" name="datum_pregleda" id="edit_datum_pregleda" class="form-control">
            </div>
        </div>
        <div class="row mb-2">
            <div class="col">
                <label class="form-label small">Ime i prezime</label>
                <input type="text" name="ime_prezime" id="edit_ime_prezime" class="form-control">
            </div>
            <div class="col">
                <label class="form-label small">Broj telefona</label>
                <input type="text" name="broj_telefona" id="edit_broj_telefona" class="form-control">
            </div>
        </div>
        <div class="row mb-2">
            <div class="col">
                <label class="form-label small">Marka vozila</label>
                <input type="text" name="marka_vozila" id="edit_marka_vozila" class="form-control">
            </div>
            <div class="col">
                <label class="form-label small">Tip vozila</label>
                <input type="text" name="tip_vozila" id="edit_tip_vozila" class="form-control">
            </div>
        </div>
        <?php endif; ?>

        <div class="row mb-2">
            <div class="col">
                <label class="form-label small">Datum isteka registracije</label>
                <input type="date" name="datum_isteka_registracije" id="edit_datum_isteka_registracije" class="form-control">
            </div>
            <div class="col">
                <label class="form-label small">Datum isteka atesta</label>
                <input type="date" name="datum_isteka_atesta" id="edit_datum_isteka_atesta" class="form-control">
            </div>
        </div>

        <div class="row mb-2">
            <div class="col">
                <label class="form-label small">Status</label>
                <select name="status" id="edit_status" class="form-control">
                    <option value="">Status</option>
                    <option value="prošao">Prošao</option>
                    <option value="nije prošao">Nije prošao</option>
                </select>
            </div>
            <div class="col">
                <label class="form-label small">Napomena</label>
                <input type="text" name="napomena" id="edit_napomena" class="form-control">
            </div>
        </div>

        <button type="submit" name="save" class="btn btn-primary">Sačuvaj izmene</button>
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('editForm').style.display='none'">Otkaži</button>
    </form>
</div>


            <!-- Table -->
            <div class="card mb-4">
                <div class="card-body">
                    <table class="table table-bordered table-striped">
                        <thead class="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Vreme tehničkog</th>
                                <th>Datum pregleda</th>
                                <th>Ime i prezime</th>
                                <th>Broj telefona</th>
                                <th>Marka vozila</th>
                                <th>Tip vozila</th>
                                <th>Datum isteka registracije</th>
                                <th>Datum isteka atesta</th>
                                <th>Status</th>
                                <th>Napomena</th>
                                <?php if($is_admin) echo "<th>Akcije</th>"; ?>
                            </tr>
                        </thead>
                        <tbody>
<?php foreach($rows as $r): ?>
<tr>
    <td><?= $r['id'] ?></td>
    <td><?= $r['vreme_tehnickog'] ?></td>
    <td><?= formatDateDMY($r['datum_pregleda']) ?></td>
    <td><?= htmlspecialchars($r['ime_prezime']) ?></td>
    <td><?= htmlspecialchars($r['broj_telefona']) ?></td>
    <td><?= htmlspecialchars($r['marka_vozila']) ?></td>
    <td><?= htmlspecialchars($r['tip_vozila']) ?></td>
    <td><?= formatDateDMY($r['datum_isteka_registracije']) ?></td>
    <td><?= formatDateDMY($r['datum_isteka_atesta']) ?></td>
    <td><?= $r['status'] ?></td>
    <td><?= htmlspecialchars($r['napomena']) ?></td>
    <td>
        <button class="btn btn-warning btn-sm" onclick="editRecord(<?= htmlspecialchars(json_encode($r)) ?>, <?= $is_admin ? 'true' : 'false' ?>)">Izmeni</button>
        <?php if($is_admin): ?>
        <form method="post" style="display:inline;" onsubmit="return confirm('Da li ste sigurni da želite da obrišete?');">
            <input type="hidden" name="delete_id" value="<?= $r['id'] ?>">
            <button type="submit" class="btn btn-danger btn-sm">Obriši</button>
        </form>
        <?php endif; ?>
    </td>
</tr>
<?php endforeach; ?>

                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </main>
</div>

<script>
function editRecord(data, isAdmin){
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('edit_id').value = data.id;

    if(isAdmin){
        // Admin vidi i može menjati sve
        document.getElementById('edit_vreme_tehnickog').value = data.vreme_tehnickog;
        document.getElementById('edit_datum_pregleda').value = data.datum_pregleda;
        document.getElementById('edit_ime_prezime').value = data.ime_prezime;
        document.getElementById('edit_broj_telefona').value = data.broj_telefona;
        document.getElementById('edit_marka_vozila').value = data.marka_vozila;
        document.getElementById('edit_tip_vozila').value = data.tip_vozila;
        document.getElementById('edit_datum_isteka_registracije').value = data.datum_isteka_registracije;
        document.getElementById('edit_datum_isteka_atesta').value = data.datum_isteka_atesta;
        document.getElementById('edit_status').value = data.status;
        document.getElementById('edit_napomena').value = data.napomena;

        // Prikaži sva polja
        document.querySelectorAll('#editForm .form-control').forEach(f => f.parentElement.style.display='block');
    } else {
        // Radnik vidi samo dozvoljena polja
        document.getElementById('edit_datum_isteka_registracije').value = data.datum_isteka_registracije;
        document.getElementById('edit_datum_isteka_atesta').value = data.datum_isteka_atesta;
        document.getElementById('edit_status').value = data.status;
        document.getElementById('edit_napomena').value = data.napomena;

        // Sakrij ostala polja
        ['edit_vreme_tehnickog','edit_datum_pregleda','edit_ime_prezime','edit_broj_telefona','edit_marka_vozila','edit_tip_vozila'].forEach(f => {
            document.getElementById(f).parentElement.style.display='none';
        });

        // Prikaži samo dozvoljena
        ['edit_datum_isteka_registracije','edit_datum_isteka_atesta','edit_status','edit_napomena'].forEach(f => {
            document.getElementById(f).parentElement.style.display='block';
        });
    }

    // Skrol do forme
    window.scrollTo({ top: document.getElementById('editForm').offsetTop - 100, behavior: 'smooth' });
}

</script>

<?php LoadFooter(); ?>
