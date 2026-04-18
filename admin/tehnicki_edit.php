<?php
require_once("parts/auth.php");
require_once("parts/layout.php");
require_once("parts/mysql.php");

$is_admin = ($userRole === 'admin');

if (!isset($_GET['id'])) {
    header("Location: tehnicki-pregledi.php");
    exit();
}

$id = (int)$_GET['id'];

// --- Učitavanje zapisa --- //
$stmt = $pdo->prepare("SELECT * FROM tehnicki_pregledi_novi WHERE id=?");
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    header("Location: tehnicki-pregledi.php");
    exit();
}

// --- Obrada forme --- //
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['save'])) {

        // Admin može menjati sve kolone
        $vreme_tehnickog = $is_admin ? $_POST['vreme_tehnickog'] : $row['vreme_tehnickog'];
        $datum_pregleda   = $is_admin ? $_POST['datum_pregleda'] : $row['datum_pregleda'];
        $ime_prezime      = $is_admin ? $_POST['ime_prezime'] : $row['ime_prezime'];
        $broj_telefona    = $is_admin ? $_POST['broj_telefona'] : $row['broj_telefona'];
        $marka_vozila     = $is_admin ? $_POST['marka_vozila'] : $row['marka_vozila'];
        $tip_vozila       = $is_admin ? $_POST['tip_vozila'] : $row['tip_vozila'];

        // Polja koja radnik može menjati
        $datum_isteka_registracije = $_POST['datum_isteka_registracije'] ?? $row['datum_isteka_registracije'];
        $datum_isteka_atesta       = $_POST['datum_isteka_atesta'] ?? $row['datum_isteka_atesta'];
        $status                    = $_POST['status'] ?? $row['status'];
        $napomena                  = $_POST['napomena'] ?? $row['napomena'];

        // UPDATE
        $stmt = $pdo->prepare("UPDATE tehnicki_pregledi_novi SET
            ".($is_admin ? "vreme_tehnickog=?, datum_pregleda=?, ime_prezime=?, broj_telefona=?, marka_vozila=?, tip_vozila=?," : "")."
            datum_isteka_registracije=?, datum_isteka_atesta=?, status=?, napomena=?
            WHERE id=?");

        $stmt->execute(array_merge(
            $is_admin ? [$vreme_tehnickog,$datum_pregleda,$ime_prezime,$broj_telefona,$marka_vozila,$tip_vozila] : [],
            [$datum_isteka_registracije,$datum_isteka_atesta,$status,$napomena,$id]
        ));

        header("Location: tehnicki-pregledi.php");
        exit();
    }
}

LoadHead("Izmena pregleda");
LoadNavBar();
?>

<div id="layoutSidenav_content">
    <main>
        <div class="container-fluid px-4">
            <h1 class="mt-4 mb-4">Izmena tehničkog pregleda</h1>

            <div class="card p-3 mb-3">
                <form method="post">
                    <div class="row mb-2">
                        <div class="col">
                            <label>Vreme tehničkog</label>
                            <input type="datetime-local" name="vreme_tehnickog" class="form-control" value="<?= $row['vreme_tehnickog'] ?>" <?= $is_admin ? '' : 'readonly' ?>>
                        </div>
                        <div class="col">
                            <label>Datum pregleda</label>
                            <input type="date" name="datum_pregleda" class="form-control" value="<?= $row['datum_pregleda'] ?>" <?= $is_admin ? '' : 'readonly' ?>>
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col">
                            <label>Ime i prezime</label>
                            <input type="text" name="ime_prezime" class="form-control" value="<?= $row['ime_prezime'] ?>" <?= $is_admin ? '' : 'readonly' ?>>
                        </div>
                        <div class="col">
                            <label>Broj telefona</label>
                            <input type="text" name="broj_telefona" class="form-control" value="<?= $row['broj_telefona'] ?>" <?= $is_admin ? '' : 'readonly' ?>>
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col">
                            <label>Marka vozila</label>
                            <input type="text" name="marka_vozila" class="form-control" value="<?= $row['marka_vozila'] ?>" <?= $is_admin ? '' : 'readonly' ?>>
                        </div>
                        <div class="col">
                            <label>Tip vozila</label>
                            <input type="text" name="tip_vozila" class="form-control" value="<?= $row['tip_vozila'] ?>" <?= $is_admin ? '' : 'readonly' ?>>
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col">
                            <label>Datum isteka registracije</label>
                            <input type="date" name="datum_isteka_registracije" class="form-control" value="<?= $row['datum_isteka_registracije'] ?>">
                        </div>
                        <div class="col">
                            <label>Datum isteka atesta</label>
                            <input type="date" name="datum_isteka_atesta" class="form-control" value="<?= $row['datum_isteka_atesta'] ?>">
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col">
                            <label>Status</label>
                            <select name="status" class="form-control">
                                <option value="">--Izaberi status--</option>
                                <option value="prošao" <?= $row['status'] == 'prošao' ? 'selected' : '' ?>>Prošao</option>
                                <option value="nije prošao" <?= $row['status'] == 'nije prošao' ? 'selected' : '' ?>>Nije prošao</option>
                            </select>
                        </div>
                        <div class="col">
                            <label>Napomena</label>
                            <input type="text" name="napomena" class="form-control" value="<?= $row['napomena'] ?>">
                        </div>
                    </div>

                    <button type="submit" name="save" class="btn btn-primary mt-2">Sačuvaj izmene</button>
                    <a href="tehnicki-pregledi.php" class="btn btn-secondary mt-2">Nazad</a>
                </form>
            </div>
        </div>
    </main>
</div>

<?php LoadFooter(); ?>
